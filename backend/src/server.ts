import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config/environment';
import { socketServer } from './websocket/socket-server';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Candidly Backend',
    version: '1.0.0',
    status: 'running'
  });
});

// API health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO server
socketServer.initialize(httpServer, {
  deepgramApiKey: config.deepgramApiKey,
  openaiApiKey: config.openaiApiKey,
  geminiApiKey: config.geminiApiKey,
  claudeApiKey: config.anthropicApiKey,
  googleVisionApiKey: config.googleVisionApiKey
});

// Start server
const PORT = config.port;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   Candidly Backend Server                                      ║
║                                                                ║
║   Port: ${PORT}                                                    ║
║   Environment: ${config.nodeEnv}                               ║
║   WebSocket: Enabled                                           ║
║                                                                ║
║   API Keys configured:                                         ║
║   - OpenAI: ${config.openaiApiKey ? '✓' : '✗'}                                             ║
║   - Deepgram: ${config.deepgramApiKey ? '✓' : '✗'}                                           ║
║   - Claude: ${config.anthropicApiKey ? '✓' : '✗'}                                             ║
║   - Gemini: ${config.geminiApiKey ? '✓' : '✗'}                                             ║
║   - Google Vision: ${config.googleVisionApiKey ? '✓' : '✗'}                                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    socketServer.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    socketServer.close();
    process.exit(0);
  });
});

export default app;
