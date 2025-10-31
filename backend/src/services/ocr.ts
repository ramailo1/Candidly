import Tesseract from 'tesseract.js';
import vision from '@google-cloud/vision';

export type OCRProvider = 'tesseract' | 'google';

export class OCRService {
  private googleVisionClient: vision.ImageAnnotatorClient | null = null;

  constructor(googleVisionApiKey?: string) {
    if (googleVisionApiKey) {
      try {
        this.googleVisionClient = new vision.ImageAnnotatorClient({
          keyFilename: googleVisionApiKey,
        });
      } catch (error) {
        console.error('Failed to initialize Google Vision client:', error);
        this.googleVisionClient = null;
      }
    }
  }

  /**
   * Extract text from image using Tesseract (local, offline)
   */
  async extractTextLocal(imageBuffer: Buffer): Promise<string> {
    try {
      const result = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: () => {}, // Suppress logs
      });
      return result.data.text.trim();
    } catch (error) {
      console.error('Tesseract OCR failed:', error);
      return '';
    }
  }

  /**
   * Extract text from image using Google Cloud Vision
   */
  async extractTextGoogle(imageBuffer: Buffer): Promise<string> {
    if (!this.googleVisionClient) {
      console.error('Google Vision client not initialized');
      return '';
    }

    try {
      const [result] = await this.googleVisionClient.textDetection(imageBuffer);
      const detections = result.textAnnotations;

      if (detections && detections.length > 0) {
        // First annotation contains all detected text
        return detections[0].description?.trim() || '';
      }

      return '';
    } catch (error) {
      console.error('Google Vision OCR failed:', error);
      return '';
    }
  }

  /**
   * Main interface: Extract text using specified provider
   */
  async extractText(imageBuffer: Buffer, provider: OCRProvider): Promise<string> {
    switch (provider) {
      case 'tesseract':
        return this.extractTextLocal(imageBuffer);
      case 'google':
        return this.extractTextGoogle(imageBuffer);
      default:
        console.error('Unknown OCR provider:', provider);
        return '';
    }
  }
}
