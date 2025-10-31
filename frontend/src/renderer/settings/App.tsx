import React, { useState, useEffect } from 'react';
import './styles.css';

declare global {
  interface Window {
    electronAPI: any;
  }
}

export default function SettingsApp() {
  const [settings, setSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('ai-provider');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await window.electronAPI.getSettings();
    setSettings(loadedSettings);
  };

  const handleSave = async () => {
    await window.electronAPI.saveSettings(settings);
    setSaveStatus('Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  if (!settings) return <div className="loading">Loading settings...</div>;

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <button onClick={handleSave} className="btn-save">
          Save Changes
        </button>
      </div>

      {saveStatus && <div className="save-status">{saveStatus}</div>}

      <div className="settings-content">
        <div className="tabs">
          <button
            className={activeTab === 'ai-provider' ? 'tab-active' : ''}
            onClick={() => setActiveTab('ai-provider')}
          >
            AI Provider
          </button>
          <button
            className={activeTab === 'capture' ? 'tab-active' : ''}
            onClick={() => setActiveTab('capture')}
          >
            Capture
          </button>
          <button
            className={activeTab === 'context' ? 'tab-active' : ''}
            onClick={() => setActiveTab('context')}
          >
            Context
          </button>
          <button
            className={activeTab === 'connection' ? 'tab-active' : ''}
            onClick={() => setActiveTab('connection')}
          >
            Connection
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'ai-provider' && (
            <div className="tab-panel">
              <h2>AI Provider Configuration</h2>

              <div className="form-group">
                <label>Active Provider</label>
                <select
                  value={settings.aiProvider.active}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiProvider: { ...settings.aiProvider, active: e.target.value }
                    })
                  }
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="claude">Anthropic Claude</option>
                </select>
              </div>

              <div className="form-group">
                <label>OpenAI API Key</label>
                <input
                  type="password"
                  value={settings.aiProvider.openai.apiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiProvider: {
                        ...settings.aiProvider,
                        openai: { ...settings.aiProvider.openai, apiKey: e.target.value }
                      }
                    })
                  }
                  placeholder="sk-..."
                />
              </div>

              <div className="form-group">
                <label>OpenAI Model</label>
                <select
                  value={settings.aiProvider.openai.model}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiProvider: {
                        ...settings.aiProvider,
                        openai: { ...settings.aiProvider.openai, model: e.target.value }
                      }
                    })
                  }
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Deepgram API Key (Audio Transcription)</label>
                <input
                  type="password"
                  value={settings.transcription.deepgramApiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      transcription: { deepgramApiKey: e.target.value }
                    })
                  }
                  placeholder="Deepgram API key"
                />
              </div>
            </div>
          )}

          {activeTab === 'capture' && (
            <div className="tab-panel">
              <h2>Capture Settings</h2>

              <div className="form-group">
                <label>Screen Capture Mode</label>
                <select
                  value={settings.screenCapture.mode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      screenCapture: { ...settings.screenCapture, mode: e.target.value }
                    })
                  }
                >
                  <option value="fullscreen">Full Screen</option>
                  <option value="region">Selected Region</option>
                </select>
              </div>

              <div className="form-group">
                <label>Capture Interval</label>
                <select
                  value={settings.screenCapture.interval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      screenCapture: {
                        ...settings.screenCapture,
                        interval: parseInt(e.target.value)
                      }
                    })
                  }
                >
                  <option value="1000">1 second</option>
                  <option value="2000">2 seconds</option>
                  <option value="3000">3 seconds</option>
                  <option value="5000">5 seconds</option>
                  <option value="10000">10 seconds</option>
                </select>
              </div>

              <div className="form-group">
                <label>OCR Provider</label>
                <select
                  value={settings.ocrProvider.active}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ocrProvider: { ...settings.ocrProvider, active: e.target.value }
                    })
                  }
                >
                  <option value="tesseract">Tesseract (Local, Free)</option>
                  <option value="google">Google Cloud Vision (Requires API Key)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'context' && (
            <div className="tab-panel">
              <h2>Custom Context</h2>
              <p className="help-text">
                Enable custom context to get more relevant, tailored answers for your specific role.
              </p>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.context.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        context: { ...settings.context, enabled: e.target.checked }
                      })
                    }
                  />
                  Enable Custom Context
                </label>
              </div>

              {settings.context.enabled && (
                <>
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      value={settings.context.jobTitle}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          context: { ...settings.context, jobTitle: e.target.value }
                        })
                      }
                      placeholder="e.g., Senior Frontend Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label>Field/Domain</label>
                    <input
                      type="text"
                      value={settings.context.field}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          context: { ...settings.context, field: e.target.value }
                        })
                      }
                      placeholder="e.g., Frontend Development, Machine Learning"
                    />
                  </div>

                  <div className="form-group">
                    <label>Job Description</label>
                    <textarea
                      value={settings.context.jobDescription}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          context: { ...settings.context, jobDescription: e.target.value }
                        })
                      }
                      placeholder="Brief description of the role"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'connection' && (
            <div className="tab-panel">
              <h2>Backend Connection</h2>

              <div className="form-group">
                <label>Backend URL</label>
                <input
                  type="text"
                  value={settings.backend.url}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      backend: { url: e.target.value }
                    })
                  }
                  placeholder="ws://localhost:3000"
                />
              </div>

              <p className="help-text">
                The backend server must be running for the application to work.
                Default: ws://localhost:3000
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
