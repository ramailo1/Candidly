export interface QuestionDetectionResult {
  isQuestion: boolean;
  question: string | null;
  confidence: number;
}

export class QuestionDetectionService {
  private readonly questionKeywords = [
    'what', 'why', 'how', 'when', 'where', 'who',
    'can you', 'could you', 'would you', 'will you',
    'explain', 'describe', 'tell me'
  ];

  private readonly imperativeKeywords = [
    'implement', 'write a function', 'create', 'solve',
    'build', 'design', 'develop', 'code', 'program'
  ];

  /**
   * Detect if text contains a question
   */
  detectQuestion(text: string): QuestionDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        isQuestion: false,
        question: null,
        confidence: 0
      };
    }

    const trimmedText = text.trim();
    const lowerText = trimmedText.toLowerCase();

    // Calculate confidence score
    let confidence = 0.5; // Base score

    // Check for question mark
    const hasQuestionMark = trimmedText.includes('?');
    if (hasQuestionMark) {
      confidence += 0.3;
    }

    // Check for question keywords at start
    const startsWithQuestionKeyword = this.questionKeywords.some(keyword =>
      lowerText.startsWith(keyword)
    );
    if (startsWithQuestionKeyword) {
      confidence += 0.2;
    }

    // Check for multiple question indicators
    const questionIndicatorCount = this.questionKeywords.filter(keyword =>
      lowerText.includes(keyword)
    ).length;
    if (questionIndicatorCount > 1) {
      const bonus = Math.min(questionIndicatorCount - 1, 3) * 0.1;
      confidence += bonus;
    }

    // Check for imperative coding keywords
    const hasImperativeKeywords = this.imperativeKeywords.some(keyword =>
      lowerText.includes(keyword)
    );
    if (hasImperativeKeywords) {
      confidence += 0.2;
    }

    // Penalize very short text
    const wordCount = trimmedText.split(/\s+/).length;
    if (wordCount < 10) {
      confidence -= 0.2;
    }

    // Clamp confidence between 0 and 1
    confidence = Math.max(0, Math.min(1, confidence));

    // Only consider it a question if confidence >= 0.7
    const isQuestion = confidence >= 0.7;

    return {
      isQuestion,
      question: isQuestion ? trimmedText : null,
      confidence
    };
  }

  /**
   * Extract the most likely question from a longer text
   * Useful when text contains multiple sentences
   */
  extractQuestion(text: string): QuestionDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        isQuestion: false,
        question: null,
        confidence: 0
      };
    }

    // Split by sentence boundaries
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Find the sentence with highest question confidence
    let bestResult: QuestionDetectionResult = {
      isQuestion: false,
      question: null,
      confidence: 0
    };

    for (const sentence of sentences) {
      const result = this.detectQuestion(sentence);
      if (result.confidence > bestResult.confidence) {
        bestResult = result;
      }
    }

    // If no clear question found, try the full text
    if (!bestResult.isQuestion) {
      bestResult = this.detectQuestion(text);
    }

    return bestResult;
  }
}
