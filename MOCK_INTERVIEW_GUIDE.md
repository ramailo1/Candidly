# Mock Interview Feature Guide

## Overview

The Mock Interview feature allows you to practice interview questions with AI-generated questions and receive detailed feedback on your performance.

## Features

### 1. Mock Interview Mode
- **AI-Generated Questions** - Behavioral, Technical, Coding, and System Design questions
- **Adjustable Difficulty** - Easy, Medium, or Hard
- **Question Counter** - Track how many questions you've answered
- **Visual Indicators** - Question type and difficulty badges

### 2. Feedback System (Optional)
After completing a mock interview, you have the **option** to request AI-powered feedback:

- **Overall Score** - 0-100 score with visual circular indicator
- **Performance Summary** - 2-3 sentences summarizing your performance
- **Strengths** - Top 3 things you did well
- **Areas for Improvement** - Top 3 areas to work on
- **Answer-by-Answer Breakdown** - Detailed feedback for each question:
  - Individual score (0-100)
  - Specific feedback on your answer
  - 2-3 concrete suggestions for improvement

## How to Use

### Starting a Mock Interview

1. **Click "Mock Interview" button** in the overlay
2. The app enters Mock Interview Mode (indicated by purple "🎯 Mock Interview Mode Active" banner)
3. First question appears automatically

### During the Interview

**Question Display shows:**
- Question number (e.g., "Question #1")
- Difficulty badge (Easy/Medium/Hard) with color coding
- Question type (Behavioral/Technical/Coding/System Design)
- The actual question text
- Instructions reminder

**Controls:**
- **Next Question** - Generate and move to the next question
- **End Interview** - Stop the mock interview session

**Tips:**
- Answer each question out loud (your audio is captured for later review)
- Take your time to think before answering
- The app records your spoken responses for feedback analysis

### Ending the Interview

When you click "End Interview":

1. **Feedback Prompt Modal appears** with two options:
   - **Get Feedback** - Request AI analysis of your answers
   - **No Thanks** - Close without feedback

2. **If you choose "Get Feedback":**
   - Loading spinner appears: "Analyzing your answers..."
   - AI processes all your questions and responses
   - Comprehensive feedback appears in the modal

3. **Feedback Display includes:**
   - Overall score with circular progress indicator
   - Summary of your overall performance
   - Strengths section (✓) with top 3 positive aspects
   - Areas for Improvement (↑) with top 3 areas to work on
   - Answer-by-Answer Feedback with:
     - Question number and individual score
     - Your question
     - Your answer (as captured)
     - Specific feedback
     - Actionable suggestions

## UI Components

### Mock Interview Panel
```
┌─────────────────────────────────────────┐
│ Mock Interview Mode       Question #3   │
│─────────────────────────────────────────│
│ [MEDIUM] [Technical]                    │
│                                         │
│ Question text appears here...           │
│                                         │
│ 💡 Answer this question out loud        │
│ ⏱️ Take your time to provide a complete │
│    answer                               │
│                                         │
│ [Next Question]  [End Interview]        │
└─────────────────────────────────────────┘
```

### Feedback Modal
```
┌─────────────────────────────────────────┐
│ Mock Interview Complete              [×]│
│─────────────────────────────────────────│
│                                         │
│  Your mock interview session has ended. │
│                                         │
│  Would you like to receive detailed    │
│  feedback on your answers?              │
│                                         │
│     [Get Feedback]  [No Thanks]         │
│                                         │
│  AI will analyze your responses and     │
│  provide constructive feedback          │
│                                         │
└─────────────────────────────────────────┘
```

### Feedback Results
```
┌─────────────────────────────────────────┐
│ Mock Interview Complete              [×]│
│─────────────────────────────────────────│
│                                         │
│  ┌───┐                                  │
│  │75 │ Overall Score                    │
│  └───┘ Summary: You demonstrated...    │
│                                         │
│  ✓ Strengths                            │
│  • Clear communication                  │
│  • Good technical knowledge             │
│  • Strong examples                      │
│                                         │
│  ↑ Areas for Improvement                │
│  • Structure your answers better        │
│  • Include more specific examples       │
│  • Pace yourself                        │
│                                         │
│  📝 Answer-by-Answer Feedback           │
│  ┌─────────────────────────────────┐   │
│  │ Q1                    Score: 80 │   │
│  │ Question: ...                   │   │
│  │ Your Answer: ...                │   │
│  │ Feedback: ...                   │   │
│  │ Suggestions:                    │   │
│  │  • Tip 1                        │   │
│  │  • Tip 2                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│                          [Close]        │
└─────────────────────────────────────────┘
```

## Settings Configuration

Configure Mock Interview settings in **Settings → Mock Interview**:

- **Difficulty Level** - Easy / Medium / Hard
- **Question Types** - Select from:
  - Behavioral
  - Technical
  - Coding
  - System Design
- **Question Interval** - Time between questions (default: 120 seconds)

## Color Coding

### Difficulty Badges
- **Easy** - Green (#4caf50)
- **Medium** - Orange (#ff9800)
- **Hard** - Red (#f44336)

### Question Types
- All types use gray badge (#424242)
- Displayed as capitalized text

### Mock Interview UI
- Primary color: Purple (#9c27b0)
- Used for borders, buttons, and indicators

## Keyboard Shortcuts

Mock Interview mode doesn't interfere with regular shortcuts:
- Regular shortcuts remain active
- Mock mode is clearly indicated in the UI

## Technical Details

### Backend Events
- `start-mock-interview` - Initiate mock interview session
- `mock-next-question` - Request next question
- `stop-mock-interview` - End session
- `request-mock-feedback` - Request AI feedback
- `mock-question` - Receive generated question
- `mock-interview-ended` - Session ended notification
- `mock-feedback-ready` - Feedback analysis complete

### Data Flow
1. User starts mock interview
2. Backend generates questions using AI
3. Frontend displays questions one by one
4. User answers verbally (audio captured)
5. Session ends when user clicks "End Interview"
6. **Optional**: User requests feedback
7. Backend sends Q&A to AI for analysis
8. Detailed feedback returned and displayed

## Best Practices

1. **Prepare Environment** - Find a quiet space
2. **Answer Fully** - Speak complete answers, not just keywords
3. **Use Examples** - Reference real experiences when possible
4. **Review Feedback** - Read all suggestions carefully
5. **Practice Regularly** - Use mock mode multiple times for improvement

## Troubleshooting

**No questions appearing:**
- Ensure backend is running and connected
- Check that AI provider API key is configured

**Feedback not loading:**
- Wait for analysis to complete (may take 30-60 seconds)
- Ensure you answered questions verbally
- Check backend logs for AI API errors

**Audio not captured:**
- Verify microphone permissions
- Check Deepgram API key is configured
- Ensure audio device is selected in settings

## Future Enhancements

Potential additions (not yet implemented):
- Custom question pools
- Industry-specific question sets
- Timed questions with countdown
- Video recording option
- Export feedback as PDF
- Historical performance tracking

---

**Note:** Mock Interview mode is designed for practice. Always be honest and authentic in real interviews.
