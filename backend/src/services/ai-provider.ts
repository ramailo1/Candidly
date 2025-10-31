import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export type AIProvider = 'openai' | 'gemini' | 'claude';
export type AnswerMode = 'full' | 'hints';

export interface UserContext {
  enabled: boolean;
  jobTitle?: string;
  field?: string;
  jobDescription?: string;
  companyInfo?: string;
  additionalNotes?: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface GenerateAnswerResponse {
  answer: string;
  codeSnippets?: CodeSnippet[];
  error?: string;
}

export class AIProviderService {
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private claudeClient: Anthropic | null = null;

  constructor(
    openaiApiKey?: string,
    geminiApiKey?: string,
    claudeApiKey?: string
  ) {
    if (openaiApiKey) {
      this.openaiClient = new OpenAI({ apiKey: openaiApiKey });
    }
    if (geminiApiKey) {
      this.geminiClient = new GoogleGenerativeAI(geminiApiKey);
    }
    if (claudeApiKey) {
      this.claudeClient = new Anthropic({ apiKey: claudeApiKey });
    }
  }

  /**
   * Build system prompt based on mode and context
   */
  private buildSystemPrompt(mode: AnswerMode, context?: UserContext): string {
    const hintsPrompt = `You are an interview coach assistant. Provide brief, concise hints to help answer the question.
Format:
- 3-5 key points maximum
- Each point should be one sentence
- If it's a coding question, include a short code example
- Be direct and helpful`;

    const fullPrompt = `You are an interview coach assistant. Provide a comprehensive, detailed answer to help during an interview.
Format:
- Explain the concept thoroughly
- Include examples
- If it's a coding question, include complete code examples with explanations
- Structure: Introduction → Explanation → Example → Key Takeaways`;

    const basePrompt = mode === 'hints' ? hintsPrompt : fullPrompt;

    // Build context section if enabled
    if (context?.enabled) {
      const contextParts: string[] = [];
      if (context.jobTitle) contextParts.push(`Job Title: ${context.jobTitle}`);
      if (context.field) contextParts.push(`Field/Domain: ${context.field}`);
      if (context.jobDescription) contextParts.push(`Job Description: ${context.jobDescription}`);
      if (context.companyInfo) contextParts.push(`Company: ${context.companyInfo}`);
      if (context.additionalNotes) contextParts.push(`Additional Context: ${context.additionalNotes}`);

      if (contextParts.length > 0) {
        const contextSection = `\n\nContext about the user:\n${contextParts.join('\n')}\n\nPlease tailor your answer to be relevant for this specific role and context.`;
        return basePrompt + contextSection;
      }
    }

    return basePrompt;
  }

  /**
   * Detect if question is coding-related
   */
  private isCodingQuestion(question: string): boolean {
    const lowerQuestion = question.toLowerCase();
    const codingKeywords = [
      'code', 'implement', 'function', 'method', 'class', 'algorithm',
      'data structure', 'write a program', 'debug', 'fix', 'refactor',
      'optimize', 'python', 'javascript', 'java', 'c++', 'ruby', 'go',
      'rust', 'typescript', 'react', 'node', 'api', 'database', 'sql',
      'array', 'loop', 'recursion', 'sort', 'search', 'tree', 'graph',
      'hash', 'stack', 'queue'
    ];

    return codingKeywords.some(keyword => lowerQuestion.includes(keyword));
  }

  /**
   * Extract code blocks from markdown response
   */
  private extractCodeSnippets(text: string): { answer: string; codeSnippets: CodeSnippet[] } {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeSnippets: CodeSnippet[] = [];
    let cleanAnswer = text;

    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      codeSnippets.push({ language, code });
    }

    // Remove code blocks from answer text
    cleanAnswer = cleanAnswer.replace(codeBlockRegex, '\n[Code snippet]\n').trim();

    return { answer: cleanAnswer, codeSnippets };
  }

  /**
   * Generate answer using OpenAI
   */
  private async generateWithOpenAI(
    question: string,
    mode: AnswerMode,
    model: string,
    systemPrompt: string
  ): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const maxTokens = mode === 'hints' ? 500 : 1500;

    const completion = await this.openaiClient.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || '';
  }

  /**
   * Generate answer using Google Gemini
   */
  private async generateWithGemini(
    question: string,
    systemPrompt: string
  ): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `${systemPrompt}\n\nQuestion: ${question}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Generate answer using Anthropic Claude
   */
  private async generateWithClaude(
    question: string,
    mode: AnswerMode,
    model: string,
    systemPrompt: string
  ): Promise<string> {
    if (!this.claudeClient) {
      throw new Error('Claude client not initialized');
    }

    const maxTokens = mode === 'hints' ? 500 : 1500;

    const message = await this.claudeClient.messages.create({
      model: model,
      max_tokens: maxTokens,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\nQuestion: ${question}` }
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return '';
  }

  /**
   * Retry logic with exponential backoff for rate limits
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;
    const delays = [1000, 2000, 5000]; // 1s, 2s, 5s

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error
        if (error.status === 429 && i < maxRetries - 1) {
          const delay = delays[i];
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Main method: Generate answer using specified provider
   */
  async generateAnswer(
    question: string,
    mode: AnswerMode,
    provider: AIProvider,
    model: string,
    context?: UserContext
  ): Promise<GenerateAnswerResponse> {
    try {
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(mode, context);

      // Add coding instruction if needed
      const isCoding = this.isCodingQuestion(question);
      const finalPrompt = isCoding
        ? `${systemPrompt}\n\nInclude working code examples with syntax highlighting indicators (use markdown code blocks).`
        : systemPrompt;

      // Generate answer based on provider
      let responseText: string;

      try {
        responseText = await this.retryWithBackoff(async () => {
          switch (provider) {
            case 'openai':
              return await this.generateWithOpenAI(question, mode, model, finalPrompt);
            case 'gemini':
              return await this.generateWithGemini(question, finalPrompt);
            case 'claude':
              return await this.generateWithClaude(question, mode, model, finalPrompt);
            default:
              throw new Error(`Unknown provider: ${provider}`);
          }
        });
      } catch (error: any) {
        // Map error to user-friendly message
        if (error.status === 401 || error.status === 403) {
          return {
            answer: '',
            error: `API_KEY_MISSING: API key for ${provider} is not configured or invalid. Please check Settings.`
          };
        }
        if (error.status === 429) {
          return {
            answer: '',
            error: `API_RATE_LIMIT: Rate limit exceeded for ${provider}. Please wait a moment and try again.`
          };
        }
        return {
          answer: '',
          error: `API_ERROR: Error communicating with ${provider}. Please check your connection.`
        };
      }

      // Extract code snippets if present
      if (isCoding) {
        const { answer, codeSnippets } = this.extractCodeSnippets(responseText);
        return {
          answer,
          codeSnippets: codeSnippets.length > 0 ? codeSnippets : undefined
        };
      }

      return { answer: responseText };

    } catch (error: any) {
      console.error('Error generating answer:', error);
      return {
        answer: '',
        error: `INVALID_RESPONSE: Received invalid response from ${provider}. Please try again.`
      };
    }
  }
}
