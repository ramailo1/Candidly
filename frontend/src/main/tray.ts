import { Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

let tray: Tray | null = null;

export function setupTray(
  overlayWindow: BrowserWindow,
  onOpenSettings: () => void
): void {
  // Create a simple icon (in production, use actual icon files)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide Overlay',
      click: () => {
        if (overlayWindow.isVisible()) {
          overlayWindow.hide();
        } else {
          overlayWindow.show();
        }
      }
    },
    {
      label: 'Open Settings',
      click: onOpenSettings
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        process.exit(0);
      }
    }
  ]);

  tray.setToolTip('Candidly Interview Assistant');
  tray.setContextMenu(contextMenu);
}
