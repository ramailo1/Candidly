import React from 'react';

interface MockInterviewPanelProps {
  isActive: boolean;
  currentQuestion: {
    text: string;
    type: string;
    difficulty: string;
  } | null;
  onNext: () => void;
  onStop: () => void;
  questionNumber: number;
}

export default function MockInterviewPanel({
  isActive,
  currentQuestion,
  onNext,
  onStop,
  questionNumber
}: MockInterviewPanelProps) {
  if (!isActive) return null;

  return (
    <div className="mock-interview-panel">
      <div className="mock-header">
        <h3>Mock Interview Mode</h3>
        <span className="question-counter">Question #{questionNumber}</span>
      </div>

      {currentQuestion && (
        <>
          <div className="mock-meta">
            <span className={`difficulty-badge difficulty-${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty}
            </span>
            <span className="type-badge">{currentQuestion.type}</span>
          </div>

          <div className="mock-question-display">
            <p className="mock-question-text">{currentQuestion.text}</p>
          </div>

          <div className="mock-instructions">
            <p>💡 Answer this question out loud. Your response is being recorded.</p>
            <p>⏱️ Take your time to think and provide a complete answer.</p>
          </div>
        </>
      )}

      <div className="mock-controls">
        <button onClick={onNext} className="btn-next-question">
          Next Question
        </button>
        <button onClick={onStop} className="btn-stop-mock">
          End Interview
        </button>
      </div>
    </div>
  );
}
