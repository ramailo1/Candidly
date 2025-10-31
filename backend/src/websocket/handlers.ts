import { Socket } from 'socket.io';
import { TranscriptionService } from '../services/transcription';
import { OCRService } from '../services/ocr';
import { AIProviderService, UserContext, AIProvider } from '../services/ai-provider';
import { QuestionDetectionService } from '../services/question-detection';
import { SessionHistoryService } from '../services/session-history';
import { MockInterviewService, QuestionDifficulty, QuestionType } from '../services/mock-interview';

interface ClientState {
  sessionId?: string;
  isPaused: boolean;
  mockInterviewActive: boolean;
  mockInterviewData?: {
    questions: string[];
    answers: string[];
    difficulty: QuestionDifficulty;
    questionTypes: QuestionType[];
    interval: number;
    timer?: NodeJS.Timeout;
  };
  historyEnabled: boolean;
}

export class WebSocketHandlers {
  private clientStates = new Map<string, ClientState>();

  constructor(
    private transcriptionService: TranscriptionService,
    private ocrService: OCRService,
    private aiProviderService: AIProviderService,
    private questionDetectionService: QuestionDetectionService,
    private sessionHistoryService: SessionHistoryService,
    private mockInterviewService: MockInterviewService
  ) {}

  /**
   * Get or create client state
   */
  private getClientState(socketId: string): ClientState {
    if (!this.clientStates.has(socketId)) {
      this.clientStates.set(socketId, {
        isPaused: false,
        mockInterviewActive: false,
        historyEnabled: true
      });
    }
    return this.clientStates.get(socketId)!;
  }

  /**
   * Handle new client connection
   */
  handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);

    const state = this.getClientState(socket.id);

    // Create new session
    const session = this.sessionHistoryService.createSession();
    state.sessionId = session.id;

    // Send connection acknowledgment
    socket.emit('connected', {
      sessionId: session.id,
      timestamp: Date.now(),
      serverVersion: '1.0.0'
    });

    // Register event handlers
    this.registerHandlers(socket);
  }

  /**
   * Register all event handlers for a socket
   */
  private registerHandlers(socket: Socket) {
    socket.on('audio-stream', (data) => this.handleAudioStream(socket, data));
    socket.on('screenshot', (data) => this.handleScreenshot(socket, data));
    socket.on('generate-answer', (data) => this.handleGenerateAnswer(socket, data));
    socket.on('config-update', (data) => this.handleConfigUpdate(socket, data));
    socket.on('start-mock-interview', (data) => this.handleStartMockInterview(socket, data));
    socket.on('mock-next-question', () => this.handleMockNextQuestion(socket));
    socket.on('stop-mock-interview', () => this.handleStopMockInterview(socket));
    socket.on('request-mock-feedback', (data) => this.handleRequestMockFeedback(socket, data));
    socket.on('get-session-history', (data) => this.handleGetSessionHistory(socket, data));
    socket.on('export-sessions', (data) => this.handleExportSessions(socket, data));
    socket.on('pause-listening', () => this.handlePauseListening(socket));
    socket.on('resume-listening', () => this.handleResumeListening(socket));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Handle audio stream
   */
  private async handleAudioStream(socket: Socket, data: any) {
    const state = this.getClientState(socket.id);

    if (state.isPaused || state.mockInterviewActive) {
      return; // Don't process when paused or in mock interview mode
    }

    try {
      socket.emit('status-update', {
        status: 'processing',
        message: 'Transcribing audio...',
        timestamp: Date.now()
      });

      // Decode base64 audio buffer
      const audioBuffer = Buffer.from(data.audioBuffer, 'base64');

      // Transcribe audio
      const transcription = await this.transcriptionService.transcribeRealTime(audioBuffer);

      if (!transcription) {
        return; // No transcription result
      }

      // Send transcription result
      socket.emit('transcription-result', {
        text: transcription,
        isPartial: false,
        timestamp: Date.now()
      });

      // Detect question
      const detection = this.questionDetectionService.detectQuestion(transcription);

      if (detection.isQuestion && detection.question) {
        socket.emit('question-detected', {
          question: detection.question,
          source: 'audio',
          confidence: detection.confidence,
          timestamp: Date.now()
        });
      }

    } catch (error: any) {
      console.error('Audio stream error:', error);
      socket.emit('error', {
        code: 'TRANSCRIPTION_FAILED',
        message: 'Failed to transcribe audio',
        severity: 'error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle screenshot
   */
  private async handleScreenshot(socket: Socket, data: any) {
    const state = this.getClientState(socket.id);

    if (state.isPaused || state.mockInterviewActive) {
      return; // Don't process when paused or in mock interview mode
    }

    try {
      socket.emit('status-update', {
        status: 'processing',
        message: 'Processing screenshot...',
        timestamp: Date.now()
      });

      // Decode base64 image buffer
      const imageBuffer = Buffer.from(data.imageBuffer, 'base64');

      // Extract text using OCR
      const ocrProvider = data.ocrProvider || 'tesseract';
      const extractedText = await this.ocrService.extractText(imageBuffer, ocrProvider);

      if (!extractedText) {
        return; // No text extracted
      }

      // Detect question
      const detection = this.questionDetectionService.extractQuestion(extractedText);

      if (detection.isQuestion && detection.question) {
        socket.emit('question-detected', {
          question: detection.question,
          source: 'screen',
          confidence: detection.confidence,
          timestamp: Date.now()
        });
      }

    } catch (error: any) {
      console.error('Screenshot processing error:', error);
      socket.emit('error', {
        code: 'OCR_FAILED',
        message: 'Failed to extract text from screenshot',
        severity: 'warning',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle generate answer request
   */
  private async handleGenerateAnswer(socket: Socket, data: any) {
    const state = this.getClientState(socket.id);

    try {
      socket.emit('status-update', {
        status: 'processing',
        message: 'Generating answer...',
        timestamp: Date.now()
      });

      const { question, mode, provider, model, context } = data;

      // Generate answer
      const result = await this.aiProviderService.generateAnswer(
        question,
        mode,
        provider,
        model,
        context
      );

      if (result.error) {
        socket.emit('error', {
          code: result.error.split(':')[0],
          message: result.error,
          severity: 'error',
          timestamp: Date.now()
        });
        return;
      }

      // Add to session history if enabled
      if (state.historyEnabled && state.sessionId) {
        this.sessionHistoryService.addQuestion(state.sessionId, {
          question,
          answer: result.answer,
          codeSnippets: result.codeSnippets,
          source: 'audio', // Default, frontend can specify
          mode,
          provider
        });
      }

      // Send answer to client
      socket.emit('answer-ready', {
        question,
        answer: result.answer,
        codeSnippets: result.codeSnippets,
        mode,
        provider,
        timestamp: Date.now()
      });

      socket.emit('status-update', {
        status: 'listening',
        message: 'Ready',
        timestamp: Date.now()
      });

    } catch (error: any) {
      console.error('Generate answer error:', error);
      socket.emit('error', {
        code: 'AI_GENERATION_FAILED',
        message: 'Failed to generate answer',
        severity: 'error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle config update
   */
  private handleConfigUpdate(socket: Socket, data: any) {
    // Store config for this client if needed
    console.log('Config updated for client:', socket.id, data);
  }

  /**
   * Handle start mock interview
   */
  private async handleStartMockInterview(socket: Socket, data: any) {
    const state = this.getClientState(socket.id);

    const { difficulty, questionTypes, context, interval } = data;

    state.mockInterviewActive = true;
    state.mockInterviewData = {
      questions: [],
      answers: [],
      difficulty,
      questionTypes,
      interval: interval || 120
    };

    socket.emit('status-update', {
      status: 'mock-interview',
      message: 'Mock interview started',
      timestamp: Date.now()
    });

    // Generate first question
    await this.generateMockQuestion(socket, state, context);
  }

  /**
   * Generate and send a mock interview question
   */
  private async generateMockQuestion(socket: Socket, state: ClientState, context?: UserContext) {
    if (!state.mockInterviewData) return;

    try {
      // Pick random question type from selected types
      const types = state.mockInterviewData.questionTypes;
      const type = types[Math.floor(Math.random() * types.length)];

      // Generate question
      const question = await this.mockInterviewService.generateQuestion(
        state.mockInterviewData.difficulty,
        type,
        'openai',
        'gpt-4',
        context
      );

      state.mockInterviewData.questions.push(question);

      socket.emit('mock-question', {
        question,
        type,
        difficulty: state.mockInterviewData.difficulty,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error generating mock question:', error);
      socket.emit('error', {
        code: 'MOCK_QUESTION_FAILED',
        message: 'Failed to generate mock interview question',
        severity: 'error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle mock next question
   */
  private async handleMockNextQuestion(socket: Socket) {
    const state = this.getClientState(socket.id);

    if (!state.mockInterviewActive || !state.mockInterviewData) {
      return;
    }

    await this.generateMockQuestion(socket, state);
  }

  /**
   * Handle stop mock interview
   */
  private handleStopMockInterview(socket: Socket) {
    const state = this.getClientState(socket.id);

    if (!state.mockInterviewActive || !state.mockInterviewData) {
      return;
    }

    state.mockInterviewActive = false;

    const { questions, answers } = state.mockInterviewData;

    socket.emit('mock-interview-ended', {
      questions,
      answers,
      duration: 0, // Calculate if timer was tracked
      timestamp: Date.now()
    });

    socket.emit('status-update', {
      status: 'idle',
      message: 'Mock interview ended',
      timestamp: Date.now()
    });

    // Clear timer if exists
    if (state.mockInterviewData.timer) {
      clearTimeout(state.mockInterviewData.timer);
    }

    state.mockInterviewData = undefined;
  }

  /**
   * Handle request for mock feedback
   */
  private async handleRequestMockFeedback(socket: Socket, data: any) {
    try {
      const { questions, answers, context } = data;

      socket.emit('status-update', {
        status: 'processing',
        message: 'Analyzing your answers...',
        timestamp: Date.now()
      });

      const feedback = await this.mockInterviewService.analyzeAnswers(
        questions,
        answers,
        'openai',
        'gpt-4',
        context
      );

      socket.emit('mock-feedback-ready', {
        ...feedback,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error generating mock feedback:', error);
      socket.emit('error', {
        code: 'MOCK_FEEDBACK_FAILED',
        message: 'Failed to generate feedback',
        severity: 'error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle get session history
   */
  private handleGetSessionHistory(socket: Socket, data: any) {
    const { limit } = data;
    const sessions = this.sessionHistoryService.getSessions(limit || 10);

    socket.emit('session-history', {
      sessions,
      timestamp: Date.now()
    });
  }

  /**
   * Handle export sessions
   */
  private handleExportSessions(socket: Socket, data: any) {
    const { format } = data;
    const content = this.sessionHistoryService.exportSessions(format);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `interview-sessions-${timestamp}.${format}`;

    socket.emit('sessions-exported', {
      format,
      content,
      filename,
      timestamp: Date.now()
    });
  }

  /**
   * Handle pause listening
   */
  private handlePauseListening(socket: Socket) {
    const state = this.getClientState(socket.id);
    state.isPaused = true;

    socket.emit('listening-paused', {
      timestamp: Date.now()
    });

    socket.emit('status-update', {
      status: 'paused',
      message: 'Listening paused',
      timestamp: Date.now()
    });
  }

  /**
   * Handle resume listening
   */
  private handleResumeListening(socket: Socket) {
    const state = this.getClientState(socket.id);
    state.isPaused = false;

    socket.emit('listening-resumed', {
      timestamp: Date.now()
    });

    socket.emit('status-update', {
      status: 'listening',
      message: 'Listening resumed',
      timestamp: Date.now()
    });
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(socket: Socket) {
    console.log('Client disconnected:', socket.id);

    const state = this.getClientState(socket.id);

    // End session if exists
    if (state.sessionId) {
      this.sessionHistoryService.endSession(state.sessionId);
    }

    // Clear mock interview timer if exists
    if (state.mockInterviewData?.timer) {
      clearTimeout(state.mockInterviewData.timer);
    }

    // Clean up client state
    this.clientStates.delete(socket.id);
  }
}
