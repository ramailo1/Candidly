import { config } from '../config/environment';
export class TranscriptionService { async transcribeRealTime() { if (!config) throw new Error('DEEPGRAM_API_KEY not configured'); return 'Mock transcription'; }}
