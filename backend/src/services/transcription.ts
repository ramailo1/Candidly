import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export class TranscriptionService {
  private deepgramApiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Deepgram API key not configured');
    }
    this.deepgramApiKey = apiKey;
  }

  /**
   * Transcribe audio buffer in real-time
   */
  async transcribeRealTime(audioBuffer: Buffer): Promise<string> {
    if (!this.deepgramApiKey) {
      console.error('Deepgram API key missing');
      return '';
    }

    try {
      const deepgram = createClient(this.deepgramApiKey);

      // Use Deepgram's prerecorded transcription for audio buffers
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          smart_format: true,
          language: 'en',
        }
      );

      if (error) {
        console.error('Deepgram transcription error:', error);
        return '';
      }

      // Extract transcription text
      const transcript = result.results?.channels[0]?.alternatives[0]?.transcript;
      return transcript?.trim() || '';

    } catch (error) {
      console.error('Deepgram API failed:', error);
      return '';
    }
  }

  /**
   * Create a live transcription connection (for streaming audio)
   * Returns a connection object that can be used to send audio chunks
   */
  createLiveConnection(): any {
    const deepgram = createClient(this.deepgramApiKey);

    const connection = deepgram.listen.live({
      model: 'nova-2',
      language: 'en',
      smart_format: true,
      interim_results: false,
    });

    return connection;
  }

  /**
   * Transcribe streaming audio (alternative approach)
   * This method sets up event listeners for live transcription
   */
  async transcribeStream(
    onTranscript: (text: string) => void,
    onError: (error: any) => void
  ): Promise<any> {
    try {
      const connection = this.createLiveConnection();

      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened');
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives[0]?.transcript;
        if (transcript && transcript.trim().length > 0) {
          onTranscript(transcript.trim());
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('Deepgram connection error:', error);
        onError(error);
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed');
      });

      return connection;

    } catch (error) {
      console.error('Failed to create Deepgram stream:', error);
      onError(error);
      return null;
    }
  }
}
