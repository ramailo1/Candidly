import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to settings window
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  updateSetting: (path: string, value: any) =>
    ipcRenderer.invoke('update-setting', { path, value }),

  // WebSocket for testing connection
  wsEmit: (eventName: string, data: any) => {
    ipcRenderer.send('ws-emit', { eventName, data });
  },

  onWSMessage: (callback: (event: string, data: any) => void) => {
    ipcRenderer.on('ws-message', (_, { event, data }) => {
      callback(event, data);
    });
  }
});
