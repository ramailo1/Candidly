import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createOverlayWindow, createSettingsWindow } from './windows';
import { setupTray } from './tray';
import { setupKeyboardShortcuts } from './keyboard-shortcuts';
import { SettingsManager } from './settings';
import { WebSocketClient } from './websocket-client';

let overlayWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let wsClient: WebSocketClient | null = null;

const settingsManager = new SettingsManager();

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus overlay window if someone tries to run second instance
    if (overlayWindow) {
      if (overlayWindow.isMinimized()) overlayWindow.restore();
      overlayWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Initialize settings
    const settings = settingsManager.loadSettings();

    // Create overlay window
    overlayWindow = createOverlayWindow(settings);

    // Setup system tray
    setupTray(overlayWindow, () => {
      if (!settingsWindow || settingsWindow.isDestroyed()) {
        settingsWindow = createSettingsWindow();
      } else {
        settingsWindow.focus();
      }
    });

    // Setup keyboard shortcuts
    setupKeyboardShortcuts(overlayWindow);

    // Initialize WebSocket client
    const backendUrl = settings.backend.url || 'ws://localhost:3000';
    wsClient = new WebSocketClient(backendUrl);

    // Forward WebSocket messages to renderer
    wsClient.on('message', (event, data) => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('ws-message', { event, data });
      }
    });

    // Handle IPC from renderer
    setupIPCHandlers();

    console.log('Candidly Interview Assistant started');
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      overlayWindow = createOverlayWindow(settingsManager.loadSettings());
    }
  });

  app.on('before-quit', () => {
    if (wsClient) {
      wsClient.disconnect();
    }
  });
}

function setupIPCHandlers() {
  // WebSocket emit
  ipcMain.on('ws-emit', (event, { eventName, data }) => {
    if (wsClient) {
      wsClient.emit(eventName, data);
    }
  });

  // Settings
  ipcMain.handle('get-settings', () => {
    return settingsManager.loadSettings();
  });

  ipcMain.handle('save-settings', (event, settings) => {
    settingsManager.saveSettings(settings);
    return { success: true };
  });

  ipcMain.handle('update-setting', (event, { path, value }) => {
    settingsManager.updateSetting(path, value);
    return { success: true };
  });

  // Open settings window
  ipcMain.handle('open-settings', () => {
    if (!settingsWindow || settingsWindow.isDestroyed()) {
      settingsWindow = createSettingsWindow();
    } else {
      settingsWindow.focus();
    }
    return { success: true };
  });

  // Audio capture
  ipcMain.handle('start-audio-capture', async () => {
    // Implementation would use desktopCapturer or getUserMedia via renderer
    return { success: true };
  });

  ipcMain.handle('stop-audio-capture', async () => {
    return { success: true };
  });

  // Screen capture
  ipcMain.handle('start-screen-capture', async () => {
    // Implementation would use desktopCapturer
    return { success: true };
  });

  ipcMain.handle('stop-screen-capture', async () => {
    return { success: true };
  });

  // Clipboard
  ipcMain.handle('copy-to-clipboard', async (event, text) => {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return { success: true };
  });
}
