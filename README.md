# Candidly - Real-Time AI Interview Assistant

A powerful desktop application that provides real-time AI assistance during interviews using speech-to-text transcription, screen capture OCR, and multi-provider AI answer generation.

## Features

### Core Capabilities
- **Real-time Audio Transcription** - Captures and transcribes interview audio using Deepgram
- **Screen Capture & OCR** - Detects questions displayed on screen using Tesseract or Google Vision
- **Multi-Provider AI** - Generate answers using OpenAI, Google Gemini, or Anthropic Claude
- **Dual Answer Modes** - Switch between Full Answer and Hints modes
- **Context Customization** - Tailor answers to your specific job role and field

### Advanced Features
- **Session History** - Automatically save Q&A pairs with export to JSON/CSV
- **Mock Interview Mode** - Practice with AI-generated questions
- **Keyboard Shortcuts** - Control the app without losing focus
- **Pause/Resume** - Temporarily pause listening during sensitive discussions
- **Always-on-Top Overlay** - Draggable, resizable window with adjustable opacity

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. Configure & Use
- Open Settings and add at least one AI provider API key
- Add Deepgram API key for audio transcription
- Click "Start" in the overlay window
- Speak questions or display them on screen
- AI answers appear automatically

## Configuration

### Required API Keys
At least one AI provider key is required:
- `OPENAI_API_KEY` - https://platform.openai.com/api-keys
- `ANTHROPIC_API_KEY` - https://console.anthropic.com/
- `GEMINI_API_KEY` - https://makersuite.google.com/app/apikey
- `DEEPGRAM_API_KEY` - https://console.deepgram.com/ (required for audio)

## Architecture

**Backend (Node.js/TypeScript):**
- WebSocket server for real-time communication
- Multiple AI providers (OpenAI, Gemini, Claude)
- Deepgram audio transcription
- Tesseract/Google Vision OCR
- Session history and mock interviews

**Frontend (Electron/React):**
- Always-on-top overlay window
- Settings management
- Screen and audio capture
- Real-time WebSocket client

## Development

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev && npm start

# Build
npm run build
```

## License

MIT License

---

**Note:** This is a development tool for interview practice. Use ethically and responsibly.
