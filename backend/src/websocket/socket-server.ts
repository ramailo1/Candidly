import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { TranscriptionService } from '../services/transcription';
import { OCRService } from '../services/ocr';
import { AIProviderService } from '../services/ai-provider';
import { QuestionDetectionService } from '../services/question-detection';
import { SessionHistoryService } from '../services/session-history';
import { MockInterviewService } from '../services/mock-interview';
import { WebSocketHandlers } from './handlers';

export class SocketServer {
  private io: SocketIOServer | null = null;
  private handlers: WebSocketHandlers | null = null;

  /**
   * Initialize Socket.IO server with HTTP server
   */
  initialize(
    httpServer: HttpServer,
    apiKeys: {
      deepgramApiKey?: string;
      openaiApiKey?: string;
      geminiApiKey?: string;
      claudeApiKey?: string;
      googleVisionApiKey?: string;
    }
  ): SocketIOServer {
    // Create Socket.IO server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Allow all origins for local development
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    // Initialize services
    const transcriptionService = new TranscriptionService(
      apiKeys.deepgramApiKey || ''
    );

    const ocrService = new OCRService(apiKeys.googleVisionApiKey);

    const aiProviderService = new AIProviderService(
      apiKeys.openaiApiKey,
      apiKeys.geminiApiKey,
      apiKeys.claudeApiKey
    );

    const questionDetectionService = new QuestionDetectionService();

    const sessionHistoryService = new SessionHistoryService();

    const mockInterviewService = new MockInterviewService(aiProviderService);

    // Create handlers
    this.handlers = new WebSocketHandlers(
      transcriptionService,
      ocrService,
      aiProviderService,
      questionDetectionService,
      sessionHistoryService,
      mockInterviewService
    );

    // Handle connections
    this.io.on('connection', (socket) => {
      if (this.handlers) {
        this.handlers.handleConnection(socket);
      }
    });

    console.log('Socket.IO server initialized');

    return this.io;
  }

  /**
   * Get the Socket.IO server instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Close the Socket.IO server
   */
  close(): void {
    if (this.io) {
      this.io.close();
      console.log('Socket.IO server closed');
    }
  }
}

// Export singleton instance
export const socketServer = new SocketServer();
