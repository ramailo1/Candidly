import { globalShortcut, BrowserWindow } from 'electron';

export function setupKeyboardShortcuts(overlayWindow: BrowserWindow): void {
  // Start/Stop listening
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    overlayWindow.webContents.send('hotkey-start-stop');
  });

  // Toggle mode
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    overlayWindow.webContents.send('hotkey-toggle-mode');
  });

  // Copy last answer
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    overlayWindow.webContents.send('hotkey-copy-answer');
  });

  // Pause/Resume
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    overlayWindow.webContents.send('hotkey-pause-resume');
  });
}
