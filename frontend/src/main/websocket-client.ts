import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export class WebSocketClient extends EventEmitter {
  private socket: Socket | null = null;
  private url: string;

  constructor(url: string) {
    super();
    this.url = url;
    this.connect();
  }

  connect(): void {
    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to backend');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from backend');
      this.emit('disconnected');
    });

    // Forward all events from backend
    const events = [
      'connected', 'question-detected', 'answer-ready', 'transcription-result',
      'error', 'status-update', 'mock-question', 'session-history',
      'sessions-exported', 'listening-paused', 'listening-resumed',
      'mock-interview-ended', 'mock-feedback-ready'
    ];

    events.forEach(event => {
      this.socket?.on(event, (data) => {
        this.emit('message', event, data);
      });
    });
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}
