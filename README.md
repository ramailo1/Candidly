# 🎯 Candidly - AI Interview Assistant

> **Your Personal AI-Powered Interview Coach** 🚀

Welcome to Candidly! An intelligent desktop application that provides real-time assistance during interview practice sessions. Get instant AI-generated answers, practice with mock interviews, and receive detailed feedback—all while maintaining your interview flow.

---

## ✨ What Makes Candidly Special

### 🎤 Real-Time Intelligence
- **Live Audio Transcription** - Capture and transcribe interview questions as you speak
- **Screen Intelligence** - Detect questions displayed on your screen using advanced OCR
- **Instant Answers** - Get AI-generated responses in seconds, tailored to your needs

### 🎯 Smart Practice Mode
- **Mock Interviews** - Practice with AI-generated questions across multiple difficulty levels
- **4 Question Types** - Behavioral, Technical, Coding & System Design
- **Constructive Feedback** - Receive detailed analysis of your answers with specific improvement suggestions

### 🛠️ Powerful Features
- **Multi-AI Support** - Choose from OpenAI, Google Gemini, or Anthropic Claude
- **Answer Modes** - Switch between Full Answers and Quick Hints on the fly
- **Session History** - Automatically save and review all your practice sessions
- **Custom Context** - Tailor answers to your specific job role and company
- **Global Shortcuts** - Control the app without losing focus on your interview

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18 or higher
- **npm** (included with Node.js)
- **One API key** from: OpenAI, Google Gemini, or Anthropic Claude
- **Deepgram API key** for audio transcription

### 1️⃣ Set Up the Backend

\`\`\`bash
cd backend

# Install dependencies
npm install

# Configure your API keys
cp .env.example .env
# Edit .env and add your API keys

# Start the server
npm run dev
\`\`\`

### 2️⃣ Launch the Desktop App

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Start Candidly
npm start
\`\`\`

### 3️⃣ Configure & Start Practicing

1. Open the **Settings** window
2. Add at least one AI provider API key
3. Add your Deepgram API key (for audio)
4. Click **Start** in the overlay
5. Begin your interview practice!

---

## 🎓 How to Use

### Regular Interview Mode
Perfect for practicing real interview scenarios:

1. **Start Listening** - Click the "Start" button
2. **Speak or Display Questions** - Ask questions verbally or show them on screen
3. **Get Instant Answers** - AI detects and answers your questions automatically
4. **Toggle Modes** - Switch between Full Answers and Hints anytime
5. **Copy to Clipboard** - One-click copy of answers and code snippets

### Mock Interview Mode
Practice with AI-generated questions:

1. **Click "Mock Interview"** - Enter practice mode
2. **Answer Questions** - AI asks you questions; you respond
3. **Navigate Questions** - Use "Next Question" or click "End Interview"
4. **Get Feedback** (Optional) - Request detailed analysis of your performance

### Keyboard Shortcuts
Make your workflow seamless:

- \`Ctrl+Shift+L\` - Start/Stop listening
- \`Ctrl+Shift+P\` - Pause/Resume
- \`Ctrl+Shift+M\` - Toggle Answer Mode
- \`Ctrl+Shift+C\` - Copy last answer

---

## 🎯 The 4 Question Types

Candidly covers all interview question categories:

### 1️⃣ **Behavioral Interviews**
Focus on soft skills, past experiences, and how you handle situations.

**Example:** *"Tell me about a time when you had to work with a difficult team member."*

- 🎓 Best for: Communication, teamwork, problem-solving
- ✅ What you'll practice: STAR method, conflict resolution, leadership
- 💡 Tip: Use specific examples from your work experience

### 2️⃣ **Technical Interviews**
Test knowledge of concepts, architecture, and best practices.

**Example:** *"Explain the difference between REST and GraphQL APIs."*

- 🧠 Best for: Deep technical knowledge, design patterns
- ✅ What you'll practice: System concepts, trade-offs, architecture decisions
- 💡 Tip: Explain the "why" behind your knowledge

### 3️⃣ **Coding Interviews**
Solve programming problems with optimal algorithms and clean code.

**Example:** *"Write a function to find the longest substring without repeating characters."*

- 💻 Best for: Problem-solving, algorithm design, coding speed
- ✅ What you'll practice: Algorithms, data structures, optimization
- 💡 Tip: Think out loud and explain your approach before coding

### 4️⃣ **System Design Interviews**
Design large-scale systems with scalability and reliability in mind.

**Example:** *"Design a URL shortening service for 100M+ users."*

- 🏗️ Best for: Architecture, scalability, trade-offs
- ✅ What you'll practice: System design patterns, databases, caching
- 💡 Tip: Discuss trade-offs and justify your design choices

---

## 📖 Documentation

- **[Example Mock Interviews](EXAMPLE_INTERVIEWS.md)** - See real examples from all 4 question types
- **[Mock Interview Guide](MOCK_INTERVIEW_GUIDE.md)** - Complete feature documentation

---

## 🔐 Security & Privacy

Your data stays safe:
- ✅ **Encrypted API Keys** - AES-256-GCM encryption
- ✅ **Local Storage Only** - Session history stored on your machine
- ✅ **No Recording** - Audio transcribed, not stored
- ✅ **Screenshots Not Saved** - Processed in real-time only

---

## 📋 System Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows, macOS, or Linux |
| **Node.js** | v18.0.0 or higher |
| **RAM** | 4GB minimum (8GB recommended) |
| **Storage** | 500MB for app + dependencies |
| **Internet** | Required for API calls |
| **Microphone** | For audio capture |

---

## 🆘 Troubleshooting

### Backend won't start?
- Verify Node.js version: \`node --version\` (need v18+)
- Check port 3000 isn't in use
- Ensure all API keys are in \`.env\` file

### No audio transcription?
- Verify \`DEEPGRAM_API_KEY\` is set
- Check microphone permissions
- Test microphone in system settings

### Answers not generating?
- Confirm at least one AI provider key is configured
- Verify the API key isn't expired
- Check you have API quota remaining

---

## 📄 License

MIT License - Free to use for personal and commercial purposes.

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- **[Electron](https://www.electronjs.org/)** - Desktop app framework
- **[React](https://react.dev/)** - UI library
- **[Socket.IO](https://socket.io/)** - Real-time communication
- **[Deepgram](https://deepgram.com/)** - Speech-to-text
- **[OpenAI](https://openai.com/)** / **[Google](https://ai.google.dev/)** / **[Anthropic](https://anthropic.com/)** - AI models

---

<div align="center">

### Made with ❤️ for interview preparation

**Happy Interviewing! 🎉**

</div>
