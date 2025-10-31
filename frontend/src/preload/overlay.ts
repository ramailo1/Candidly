import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // WebSocket
  wsEmit: (eventName: string, data: any) => {
    ipcRenderer.send('ws-emit', { eventName, data });
  },

  onWSMessage: (callback: (event: string, data: any) => void) => {
    ipcRenderer.on('ws-message', (_, { event, data }) => {
      callback(event, data);
    });
  },

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  updateSetting: (path: string, value: any) =>
    ipcRenderer.invoke('update-setting', { path, value }),

  // UI Actions
  openSettings: () => ipcRenderer.invoke('open-settings'),

  // Capture
  startAudioCapture: () => ipcRenderer.invoke('start-audio-capture'),
  stopAudioCapture: () => ipcRenderer.invoke('stop-audio-capture'),
  startScreenCapture: () => ipcRenderer.invoke('start-screen-capture'),
  stopScreenCapture: () => ipcRenderer.invoke('stop-screen-capture'),

  // Clipboard
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),

  // Hotkeys
  onHotkeyStartStop: (callback: () => void) => {
    ipcRenderer.on('hotkey-start-stop', callback);
  },
  onHotkeyToggleMode: (callback: () => void) => {
    ipcRenderer.on('hotkey-toggle-mode', callback);
  },
  onHotkeyCopyAnswer: (callback: () => void) => {
    ipcRenderer.on('hotkey-copy-answer', callback);
  },
  onHotkeyPauseResume: (callback: () => void) => {
    ipcRenderer.on('hotkey-pause-resume', callback);
  }
});
