import React from 'react';

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

interface FeedbackModalProps {
  isOpen: boolean;
  isLoading: boolean;
  feedback: FeedbackData | null;
  onRequestFeedback: () => void;
  onClose: () => void;
}

export default function FeedbackModal({
  isOpen,
  isLoading,
  feedback,
  onRequestFeedback,
  onClose
}: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content feedback-modal">
        <div className="modal-header">
          <h2>Mock Interview Complete</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="modal-body">
          {!feedback && !isLoading && (
            <div className="feedback-prompt">
              <p className="prompt-message">
                Your mock interview session has ended.
              </p>
              <p className="prompt-question">
                Would you like to receive detailed feedback on your answers?
              </p>

              <div className="prompt-actions">
                <button
                  onClick={onRequestFeedback}
                  className="btn-primary btn-large"
                >
                  Get Feedback
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary btn-large"
                >
                  No Thanks
                </button>
              </div>

              <p className="prompt-note">
                AI will analyze your responses and provide constructive feedback
              </p>
            </div>
          )}

          {isLoading && (
            <div className="feedback-loading">
              <div className="spinner"></div>
              <p>Analyzing your answers...</p>
              <p className="loading-subtext">This may take a moment</p>
            </div>
          )}

          {feedback && (
            <div className="feedback-results">
              {/* Overall Score */}
              <div className="overall-score-section">
                <div className="score-circle">
                  <div className="score-value">{feedback.overallScore}</div>
                  <div className="score-label">Overall Score</div>
                </div>
                <div className="score-summary">
                  <p>{feedback.summary}</p>
                </div>
              </div>

              {/* Strengths */}
              <div className="feedback-section">
                <h3 className="section-title positive">✓ Strengths</h3>
                <ul className="feedback-list">
                  {feedback.strengths.map((strength, idx) => (
                    <li key={idx} className="strength-item">{strength}</li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="feedback-section">
                <h3 className="section-title improvement">↑ Areas for Improvement</h3>
                <ul className="feedback-list">
                  {feedback.improvements.map((improvement, idx) => (
                    <li key={idx} className="improvement-item">{improvement}</li>
                  ))}
                </ul>
              </div>

              {/* Detailed Answer Feedback */}
              <div className="feedback-section">
                <h3 className="section-title">📝 Answer-by-Answer Feedback</h3>
                {feedback.answerFeedback.map((item, idx) => (
                  <div key={idx} className="answer-feedback-item">
                    <div className="answer-header">
                      <span className="answer-number">Q{idx + 1}</span>
                      <span className="answer-score">{item.score}/100</span>
                    </div>
                    <div className="answer-question">
                      <strong>Question:</strong> {item.question}
                    </div>
                    <div className="answer-your-response">
                      <strong>Your Answer:</strong> {item.answer}
                    </div>
                    <div className="answer-feedback-text">
                      <strong>Feedback:</strong> {item.feedback}
                    </div>
                    <div className="answer-suggestions">
                      <strong>Suggestions:</strong>
                      <ul>
                        {item.suggestions.map((suggestion, sidx) => (
                          <li key={sidx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button onClick={onClose} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
