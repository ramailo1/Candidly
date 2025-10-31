import { AIProviderService, AIProvider, UserContext } from './ai-provider';

export class AICoachService {
  constructor(private aiProvider: AIProviderService) {}

  /**
   * Generate a hint for answering a question
   */
  async generateHint(
    question: string,
    provider: AIProvider = 'openai',
    model: string = 'gpt-4',
    context?: UserContext
  ): Promise<string> {
    const result = await this.aiProvider.generateAnswer(
      question,
      'hints',
      provider,
      model,
      context
    );

    if (result.error) {
      console.error('Error generating hint:', result.error);
      return '';
    }

    return result.answer;
  }

  /**
   * Score a user's response (placeholder for future enhancement)
   * Can be enhanced later with AI-based scoring
   */
  async scoreResponse(
    question: string,
    answer: string,
    provider?: AIProvider,
    model?: string
  ): Promise<number> {
    // For now, return a placeholder score
    // This can be enhanced later to use AI for actual scoring
    return 7.5;
  }
}
