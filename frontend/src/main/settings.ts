import Store from 'electron-store';
import { encryptApiKey, decryptApiKey } from './crypto';

export interface UserSettings {
  aiProvider: {
    active: 'openai' | 'gemini' | 'claude';
    openai: {
      apiKey: string;
      model: 'gpt-4' | 'gpt-3.5-turbo';
    };
    gemini: {
      apiKey: string;
      model: 'gemini-pro';
    };
    claude: {
      apiKey: string;
      model: 'claude-3-opus' | 'claude-3-sonnet';
    };
  };
  ocrProvider: {
    active: 'tesseract' | 'google';
    googleVision: {
      apiKey: string;
    };
  };
  transcription: {
    deepgramApiKey: string;
  };
  screenCapture: {
    mode: 'fullscreen' | 'region';
    region?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    interval: 1000 | 2000 | 3000 | 5000 | 10000;
  };
  audioCapture: {
    deviceId: string;
    sampleRate: 16000 | 44100 | 48000;
  };
  overlay: {
    opacity: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    defaultMode: 'full' | 'hints';
  };
  backend: {
    url: string;
  };
  context: {
    enabled: boolean;
    jobTitle: string;
    jobDescription: string;
    field: string;
    companyInfo: string;
    additionalNotes: string;
  };
  history: {
    enabled: boolean;
    maxSessions: number;
  };
  hotkeys: {
    startStop: string;
    toggleMode: string;
    copyLastAnswer: string;
    pauseResume: string;
  };
  mockInterview: {
    enabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    questionTypes: string[];
    questionInterval: number;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  aiProvider: {
    active: 'openai',
    openai: { apiKey: '', model: 'gpt-4' },
    gemini: { apiKey: '', model: 'gemini-pro' },
    claude: { apiKey: '', model: 'claude-3-sonnet' }
  },
  ocrProvider: {
    active: 'tesseract',
    googleVision: { apiKey: '' }
  },
  transcription: {
    deepgramApiKey: ''
  },
  screenCapture: {
    mode: 'fullscreen',
    interval: 3000
  },
  audioCapture: {
    deviceId: 'default',
    sampleRate: 16000
  },
  overlay: {
    opacity: 90,
    position: { x: 100, y: 100 },
    size: { width: 500, height: 600 },
    defaultMode: 'full'
  },
  backend: {
    url: 'ws://localhost:3000'
  },
  context: {
    enabled: false,
    jobTitle: '',
    jobDescription: '',
    field: '',
    companyInfo: '',
    additionalNotes: ''
  },
  history: {
    enabled: true,
    maxSessions: 50
  },
  hotkeys: {
    startStop: 'CommandOrControl+Shift+L',
    toggleMode: 'CommandOrControl+Shift+M',
    copyLastAnswer: 'CommandOrControl+Shift+C',
    pauseResume: 'CommandOrControl+Shift+P'
  },
  mockInterview: {
    enabled: false,
    difficulty: 'medium',
    questionTypes: ['behavioral', 'technical', 'coding'],
    questionInterval: 120
  }
};

export class SettingsManager {
  private store: Store<UserSettings>;

  constructor() {
    this.store = new Store<UserSettings>({
      defaults: DEFAULT_SETTINGS,
      name: 'candidly-settings'
    });
  }

  loadSettings(): UserSettings {
    return this.store.store;
  }

  saveSettings(settings: UserSettings): void {
    this.store.store = settings;
  }

  updateSetting(path: string, value: any): void {
    this.store.set(path, value);
  }

  getSetting(path: string): any {
    return this.store.get(path);
  }

  resetToDefaults(): void {
    this.store.clear();
  }

  isFirstRun(): boolean {
    return this.store.get('aiProvider.openai.apiKey', '') === '' &&
           this.store.get('aiProvider.gemini.apiKey', '') === '' &&
           this.store.get('aiProvider.claude.apiKey', '') === '';
  }
}
