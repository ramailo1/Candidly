import React, { useState, useEffect } from 'react';
import './styles.css';
import MockInterviewPanel from './MockInterviewPanel';
import FeedbackModal from './FeedbackModal';
import SessionStats from './SessionStats';
import CopyButtons from './CopyButtons';

interface Question {
  text: string;
  source: 'audio' | 'screen';
  confidence: number;
}

interface Answer {
  text: string;
  codeSnippets?: { language: string; code: string }[];
}

interface MockQuestion {
  text: string;
  type: string;
  difficulty: string;
}

interface FeedbackData {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  answerFeedback: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }>;
}

declare global {
  interface Window {
    electronAPI: any;
  }
}

export default function App() {
  // Regular mode state
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState('idle');
  const [mode, setMode] = useState<'full' | 'hints'>('full');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  // Mock interview state
  const [isMockMode, setIsMockMode] = useState(false);
  const [mockQuestion, setMockQuestion] = useState<MockQuestion | null>(null);
  const [mockQuestionNumber, setMockQuestionNumber] = useState(1);
  const [mockQuestionsHistory, setMockQuestionsHistory] = useState<string[]>([]);
  const [mockAnswersHistory, setMockAnswersHistory] = useState<string[]>([]);

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    // Handle WebSocket messages from backend
    window.electronAPI.onWSMessage((event: string, data: any) => {
      switch (event) {
        case 'question-detected':
          if (!isMockMode) {
            setCurrentQuestion({
              text: data.question,
              source: data.source,
              confidence: data.confidence
            });
            setQuestionCount(prev => prev + 1);
            // Auto-generate answer
            window.electronAPI.wsEmit('generate-answer', {
              question: data.question,
              mode,
              provider: 'openai',
              model: 'gpt-4',
              context: { enabled: false }
            });
          }
          break;

        case 'answer-ready':
          setCurrentAnswer({
            text: data.answer,
            codeSnippets: data.codeSnippets
          });
          break;

        case 'status-update':
          setStatus(data.status);
          if (data.status === 'mock-interview') {
            setIsMockMode(true);
          }
          break;

        case 'listening-paused':
          setIsPaused(true);
          break;

        case 'listening-resumed':
          setIsPaused(false);
          break;

        case 'mock-question':
          setMockQuestion({
            text: data.question,
            type: data.type,
            difficulty: data.difficulty
          });
          setMockQuestionsHistory(prev => [...prev, data.question]);
          break;

        case 'mock-interview-ended':
          setIsMockMode(false);
          setShowFeedbackModal(true);
          // Store the questions and answers for feedback
          setMockQuestionsHistory(data.questions || []);
          setMockAnswersHistory(data.answers || []);
          break;

        case 'mock-feedback-ready':
          setFeedback(data);
          setFeedbackLoading(false);
          break;
      }
    });

    // Setup hotkeys
    window.electronAPI.onHotkeyStartStop(handleStartStop);
    window.electronAPI.onHotkeyToggleMode(handleToggleMode);
    window.electronAPI.onHotkeyCopyAnswer(handleCopyAnswer);
    window.electronAPI.onHotkeyPauseResume(handlePauseResume);

    // Session timer
    const timer = setInterval(() => {
      if (isListening && !isPaused) {
        setSessionTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isListening, isPaused, mode]);

  const handleStartStop = () => {
    if (isListening) {
      // Stop
      setIsListening(false);
      setStatus('idle');
      window.electronAPI.stopAudioCapture();
      window.electronAPI.stopScreenCapture();
    } else {
      // Start
      setIsListening(true);
      setStatus('listening');
      setSessionTime(0);
      setQuestionCount(0);
      window.electronAPI.startAudioCapture();
      window.electronAPI.startScreenCapture();
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      window.electronAPI.wsEmit('resume-listening', {});
    } else {
      window.electronAPI.wsEmit('pause-listening', {});
    }
  };

  const handleToggleMode = () => {
    setMode(prev => prev === 'full' ? 'hints' : 'full');
  };

  const handleCopyAnswer = () => {
    if (currentAnswer) {
      window.electronAPI.copyToClipboard(currentAnswer.text);
    }
  };

  const handleStartMockInterview = () => {
    // Start mock interview with default settings
    setIsMockMode(true);
    setMockQuestionNumber(1);
    setMockQuestionsHistory([]);
    setMockAnswersHistory([]);
    setFeedback(null);

    window.electronAPI.wsEmit('start-mock-interview', {
      difficulty: 'medium',
      questionTypes: ['behavioral', 'technical', 'coding'],
      context: { enabled: false },
      interval: 120
    });
  };

  const handleNextMockQuestion = () => {
    setMockQuestionNumber(prev => prev + 1);
    window.electronAPI.wsEmit('mock-next-question', {});
  };

  const handleStopMockInterview = () => {
    window.electronAPI.wsEmit('stop-mock-interview', {});
  };

  const handleRequestFeedback = () => {
    setFeedbackLoading(true);
    window.electronAPI.wsEmit('request-mock-feedback', {
      questions: mockQuestionsHistory,
      answers: mockAnswersHistory,
      context: { enabled: false }
    });
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedback(null);
    setFeedbackLoading(false);
  };

  return (
    <div className="overlay-container">
      <div className="draggable-header">
        <h2>Candidly AI Assistant</h2>
      </div>

      <div className="controls">
        <button
          className={isListening ? 'btn-stop' : 'btn-start'}
          onClick={handleStartStop}
        >
          {isListening ? 'Stop' : 'Start'}
        </button>

        {isListening && (
          <>
            <button onClick={handlePauseResume}>
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={handleToggleMode}>
              Mode: {mode}
            </button>
          </>
        )}

        <button onClick={() => window.electronAPI.openSettings()}>
          Settings
        </button>
      </div>

      <div className="stats">
        <span>Time: {formatTime(sessionTime)}</span>
        <span>Questions: {questionCount}</span>
        <span className={`status status-${status}`}>
          {isPaused ? 'PAUSED' : status}
        </span>
      </div>

      {currentQuestion && (
        <div className="question-section">
          <div className="section-header">
            <h3>Question Detected</h3>
            <span className="source-badge">{currentQuestion.source}</span>
          </div>
          <p>{currentQuestion.text}</p>
        </div>
      )}

      {currentAnswer && (
        <div className="answer-section">
          <div className="section-header">
            <h3>Suggested Answer</h3>
            <button onClick={handleCopyAnswer} className="btn-copy">
              Copy
            </button>
          </div>
          <div className="answer-content">
            <p>{currentAnswer.text}</p>

            {currentAnswer.codeSnippets && currentAnswer.codeSnippets.map((snippet, idx) => (
              <div key={idx} className="code-snippet">
                <div className="code-header">{snippet.language}</div>
                <pre><code>{snippet.code}</code></pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-message">PAUSED</div>
        </div>
      )}
    </div>
  );
}
