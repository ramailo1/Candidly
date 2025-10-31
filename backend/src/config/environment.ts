import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;

  // API Keys
  openaiApiKey?: string;
  deepgramApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  googleVisionApiKey?: string;

  // AWS (optional, for storage service)
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  awsS3Bucket?: string;
}

/**
 * Load and validate environment configuration
 */
function loadConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // API Keys
    openaiApiKey: process.env.OPENAI_API_KEY,
    deepgramApiKey: process.env.DEEPGRAM_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,

    // AWS
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    awsS3Bucket: process.env.AWS_S3_BUCKET,
  };

  // Validate that at least one AI provider key is present
  const hasAIProvider =
    config.openaiApiKey || config.anthropicApiKey || config.geminiApiKey;

  if (!hasAIProvider) {
    console.warn(
      'WARNING: No AI provider API keys configured. At least one of OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY should be set.'
    );
  }

  // Validate Deepgram key
  if (!config.deepgramApiKey) {
    console.warn(
      'WARNING: DEEPGRAM_API_KEY not configured. Audio transcription will not work.'
    );
  }

  return config;
}

export const config = loadConfig();

// Export utility function to check if specific provider is configured
export function hasProviderKey(provider: 'openai' | 'gemini' | 'claude'): boolean {
  switch (provider) {
    case 'openai':
      return !!config.openaiApiKey;
    case 'gemini':
      return !!config.geminiApiKey;
    case 'claude':
      return !!config.anthropicApiKey;
    default:
      return false;
  }
}
