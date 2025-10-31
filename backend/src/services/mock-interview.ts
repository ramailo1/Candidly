import { AIProviderService, UserContext, AIProvider } from './ai-provider';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'behavioral' | 'technical' | 'coding' | 'system-design';

export interface MockInterviewFeedback {
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

export class MockInterviewService {
  constructor(private aiProvider: AIProviderService) {}

  /**
   * Build context section for prompts
   */
  private buildContextSection(context?: UserContext): string {
    if (!context?.enabled) {
      return '';
    }

    const parts: string[] = [];
    if (context.jobTitle) parts.push(`Job Title: ${context.jobTitle}`);
    if (context.field) parts.push(`Field: ${context.field}`);
    if (context.jobDescription) parts.push(`Job Description: ${context.jobDescription}`);
    if (context.companyInfo) parts.push(`Company: ${context.companyInfo}`);

    if (parts.length === 0) {
      return '';
    }

    return `\nContext:\n${parts.join('\n')}\n`;
  }

  /**
   * Generate an interview question
   */
  async generateQuestion(
    difficulty: QuestionDifficulty,
    type: QuestionType,
    provider: AIProvider = 'openai',
    model: string = 'gpt-4',
    context?: UserContext
  ): Promise<string> {
    const contextSection = this.buildContextSection(context);

    let prompt = '';

    switch (type) {
      case 'behavioral':
        prompt = `Generate a ${difficulty} behavioral interview question${
          context?.enabled ? ` for a ${context.jobTitle} position in ${context.field}` : ''
        }.
Use the STAR method format.${contextSection}
Return only the question, no additional text.`;
        break;

      case 'technical':
        prompt = `Generate a ${difficulty} technical interview question${
          context?.enabled ? ` for a ${context.jobTitle} position in ${context.field}` : ''
        }.
Focus on concepts, architecture, and best practices.${contextSection}
Return only the question, no additional text.`;
        break;

      case 'coding':
        prompt = `Generate a ${difficulty} coding interview question${
          context?.enabled ? ` for a ${context.jobTitle} position in ${context.field}` : ''
        }.
Include problem description and constraints.${contextSection}
Return only the question, no additional text.`;
        break;

      case 'system-design':
        prompt = `Generate a ${difficulty} system design interview question${
          context?.enabled ? ` for a ${context.jobTitle} position in ${context.field}` : ''
        }.
Focus on scalability, architecture, and trade-offs.${contextSection}
Return only the question, no additional text.`;
        break;
    }

    const result = await this.aiProvider.generateAnswer(
      prompt,
      'full',
      provider,
      model,
      undefined // Don't pass context to generateAnswer since we already built it into the prompt
    );

    if (result.error) {
      throw new Error(result.error);
    }

    return result.answer.trim();
  }

  /**
   * Analyze mock interview answers and provide feedback
   */
  async analyzeAnswers(
    questions: string[],
    answers: string[],
    provider: AIProvider = 'openai',
    model: string = 'gpt-4',
    context?: UserContext
  ): Promise<MockInterviewFeedback> {
    if (questions.length !== answers.length) {
      throw new Error('Questions and answers arrays must have the same length');
    }

    const contextSection = this.buildContextSection(context);

    // Build question-answer pairs
    const qaPairs = questions
      .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i]}`)
      .join('\n\n');

    const prompt = `You are an interview coach. Analyze the following mock interview answers.
${contextSection}
Questions and Answers:
${qaPairs}

Provide:
1. Overall score (0-100)
2. Overall performance summary (2-3 sentences)
3. Top 3 strengths
4. Top 3 areas for improvement
5. For each answer:
   - Score (0-100)
   - Specific feedback
   - 2-3 concrete suggestions for improvement

Format as JSON matching this structure:
{
  "overallScore": number,
  "summary": "string",
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "answerFeedback": [
    {
      "question": "string",
      "answer": "string",
      "score": number,
      "feedback": "string",
      "suggestions": ["string", "string"]
    }
  ]
}`;

    const result = await this.aiProvider.generateAnswer(
      prompt,
      'full',
      provider,
      model,
      undefined
    );

    if (result.error) {
      throw new Error(result.error);
    }

    // Try to parse JSON from the response
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = result.answer;
      const jsonMatch = result.answer.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const feedback: MockInterviewFeedback = JSON.parse(jsonText);

      // Validate the structure
      if (
        typeof feedback.overallScore !== 'number' ||
        typeof feedback.summary !== 'string' ||
        !Array.isArray(feedback.strengths) ||
        !Array.isArray(feedback.improvements) ||
        !Array.isArray(feedback.answerFeedback)
      ) {
        throw new Error('Invalid feedback structure');
      }

      return feedback;
    } catch (error) {
      console.error('Failed to parse AI feedback:', error);

      // Return a fallback structure
      return {
        overallScore: 70,
        summary: result.answer.substring(0, 200),
        strengths: ['Analysis complete'],
        improvements: ['See full feedback below'],
        answerFeedback: questions.map((q, i) => ({
          question: q,
          answer: answers[i],
          score: 70,
          feedback: 'Unable to parse detailed feedback. Please see summary.',
          suggestions: ['Review your answer', 'Practice more']
        }))
      };
    }
  }
}
