import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from './ai-provider';

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  codeSnippets?: { language: string; code: string }[];
  source: 'audio' | 'screen';
  mode: 'full' | 'hints';
  provider: string;
  timestamp: number;
}

export interface Session {
  id: string;
  startTime: number;
  endTime?: number;
  questions: QuestionAnswer[];
  context?: UserContext;
}

export class SessionHistoryService {
  private readonly dataDir: string;
  private readonly sessionsFile: string;
  private sessions: Session[] = [];
  private maxSessions: number = 50;

  constructor(dataDir: string = path.join(__dirname, '../../data')) {
    this.dataDir = dataDir;
    this.sessionsFile = path.join(dataDir, 'sessions.json');
    this.loadSessions();
  }

  /**
   * Load sessions from disk
   */
  private async loadSessions(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });

      // Try to read sessions file
      const data = await fs.readFile(this.sessionsFile, 'utf-8');
      this.sessions = JSON.parse(data);
    } catch (error: any) {
      // File doesn't exist yet or is invalid, start with empty array
      if (error.code === 'ENOENT') {
        this.sessions = [];
        await this.saveSessions();
      } else {
        console.error('Error loading sessions:', error);
        this.sessions = [];
      }
    }
  }

  /**
   * Save sessions to disk
   */
  private async saveSessions(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.writeFile(
        this.sessionsFile,
        JSON.stringify(this.sessions, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  /**
   * Trim old sessions if exceeding maxSessions
   */
  private async trimSessions(): Promise<void> {
    if (this.sessions.length > this.maxSessions) {
      // Keep only the most recent maxSessions
      this.sessions = this.sessions
        .sort((a, b) => b.startTime - a.startTime)
        .slice(0, this.maxSessions);
      await this.saveSessions();
    }
  }

  /**
   * Create a new session
   */
  createSession(context?: UserContext): Session {
    const session: Session = {
      id: uuidv4(),
      startTime: Date.now(),
      questions: [],
      context
    };

    this.sessions.push(session);
    this.saveSessions();

    return session;
  }

  /**
   * Add a question-answer pair to a session
   */
  addQuestion(sessionId: string, qa: Omit<QuestionAnswer, 'id' | 'timestamp'>): void {
    const session = this.sessions.find(s => s.id === sessionId);

    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return;
    }

    const questionAnswer: QuestionAnswer = {
      ...qa,
      id: uuidv4(),
      timestamp: Date.now()
    };

    session.questions.push(questionAnswer);
    this.saveSessions();
  }

  /**
   * End a session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.find(s => s.id === sessionId);

    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return;
    }

    session.endTime = Date.now();
    this.saveSessions();
    this.trimSessions();
  }

  /**
   * Get recent sessions
   */
  getSessions(limit: number = 10): Session[] {
    return this.sessions
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * Get a specific session
   */
  getSession(sessionId: string): Session | null {
    return this.sessions.find(s => s.id === sessionId) || null;
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): void {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    this.saveSessions();
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.sessions = [];
    this.saveSessions();
  }

  /**
   * Export sessions as JSON
   */
  exportSessionsJSON(): string {
    return JSON.stringify(this.sessions, null, 2);
  }

  /**
   * Export sessions as CSV
   */
  exportSessionsCSV(): string {
    const headers = [
      'Session ID',
      'Timestamp',
      'Question',
      'Answer',
      'Code Snippets',
      'Source',
      'Mode',
      'Provider'
    ];

    const rows: string[] = [headers.join(',')];

    for (const session of this.sessions) {
      for (const qa of session.questions) {
        const row = [
          session.id,
          new Date(qa.timestamp).toISOString(),
          this.escapeCSV(qa.question),
          this.escapeCSV(qa.answer),
          qa.codeSnippets
            ? this.escapeCSV(JSON.stringify(qa.codeSnippets))
            : '',
          qa.source,
          qa.mode,
          qa.provider
        ];
        rows.push(row.join(','));
      }
    }

    return rows.join('\n');
  }

  /**
   * Export sessions in specified format
   */
  exportSessions(format: 'json' | 'csv'): string {
    return format === 'json'
      ? this.exportSessionsJSON()
      : this.exportSessionsCSV();
  }

  /**
   * Escape CSV values
   */
  private escapeCSV(value: string): string {
    // Escape double quotes and wrap in quotes if contains comma, newline, or quote
    const escaped = value.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  }

  /**
   * Set maximum number of sessions to keep
   */
  setMaxSessions(max: number): void {
    this.maxSessions = max;
    this.trimSessions();
  }
}
