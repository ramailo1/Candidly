import React from 'react';

interface SessionStatsProps {
  sessionTime: number;
  questionCount: number;
  status: string;
  isPaused: boolean;
}

export default function SessionStats({
  sessionTime,
  questionCount,
  status,
  isPaused
}: SessionStatsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusClass = () => {
    if (isPaused) return 'status-paused';
    return `status-${status}`;
  };

  const getStatusText = () => {
    if (isPaused) return 'PAUSED';
    return status.toUpperCase();
  };

  return (
    <div className="stats">
      <div className="stat-item">
        <span className="stat-icon">⏱️</span>
        <span className="stat-value">{formatTime(sessionTime)}</span>
      </div>

      <div className="stat-item">
        <span className="stat-icon">❓</span>
        <span className="stat-value">{questionCount}</span>
      </div>

      <div className={`stat-status ${getStatusClass()}`}>
        <div className="status-indicator"></div>
        <span className="status-text">{getStatusText()}</span>
      </div>
    </div>
  );
}
