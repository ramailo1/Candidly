import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { UserSettings } from './settings';

export function createOverlayWindow(settings: UserSettings): BrowserWindow {
  const { position, size, opacity } = settings.overlay;

  const window = new BrowserWindow({
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    minWidth: 300,
    minHeight: 200,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    opacity: opacity / 100,
    webPreferences: {
      preload: path.join(__dirname, '../preload/overlay.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load renderer
  if (process.env.NODE_ENV === 'development') {
    window.loadURL('http://localhost:5173/overlay.html');
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    window.loadFile(path.join(__dirname, '../renderer/overlay.html'));
  }

  // Save position and size on move/resize
  window.on('moved', () => {
    const [x, y] = window.getPosition();
    // Save to settings
  });

  window.on('resized', () => {
    const [width, height] = window.getSize();
    // Save to settings
  });

  return window;
}

export function createSettingsWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 700,
    height: 500,
    resizable: true,
    frame: true,
    modal: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/settings.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load renderer
  if (process.env.NODE_ENV === 'development') {
    window.loadURL('http://localhost:5173/settings.html');
  } else {
    window.loadFile(path.join(__dirname, '../renderer/settings.html'));
  }

  return window;
}
