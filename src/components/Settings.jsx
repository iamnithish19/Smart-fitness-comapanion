import React, { useState, useEffect } from 'react';
import * as db from '../services/db';
import * as aiService from '../services/aiService';

export default function Settings({ onRefreshData }) {
  const [units, setUnits] = useState('metric');
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  // AI State
  const [apiKey, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModelInput] = useState(aiService.DEFAULT_MODEL);
  const [selectedPersona, setSelectedPersonaInput] = useState(aiService.getSelectedPersona());
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState({ loading: false, msg: '', type: '' });

  useEffect(() => {
    setApiKeyInput(aiService.getApiKey());
    setSelectedModelInput(aiService.getSelectedModel());
    setSelectedPersonaInput(aiService.getSelectedPersona());
  }, []);

  const handleSaveApiKey = () => {
    aiService.setApiKey(apiKey);
    aiService.setSelectedModel(selectedModel);
    aiService.setSelectedPersona(selectedPersona);
    setTestStatus({ loading: false, msg: 'Settings saved successfully!', type: 'success' });
    setTimeout(() => setTestStatus({ loading: false, msg: '', type: '' }), 3000);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus({ loading: false, msg: 'Please enter a Gemini API Key to test.', type: 'error' });
      return;
    }

    setTestStatus({ loading: true, msg: 'Testing Gemini API Connection...', type: 'info' });
    try {
      aiService.setApiKey(apiKey);
      aiService.setSelectedModel(selectedModel);
      aiService.setSelectedPersona(selectedPersona);
      await aiService.testApiKey(apiKey);
      setTestStatus({ loading: false, msg: '✅ API Key is valid! Gemini AI connected successfully.', type: 'success' });
    } catch (err) {
      setTestStatus({ loading: false, msg: `❌ Connection failed: ${err.message}`, type: 'error' });
    }
  };

  const handleClearApiKey = () => {
    aiService.clearApiKey();
    setApiKeyInput('');
    setTestStatus({ loading: false, msg: 'API Key cleared. AI Coach will run in demo mode.', type: 'info' });
  };

  const handleExportDB = () => {
    const data = db.exportDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sfc_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReseed = () => {
    if (confirm('Are you sure you want to reset all data back to original seed defaults?')) {
      db.resetDatabase();
      onRefreshData();
      alert('Database successfully restored to default state!');
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings & System Preferences</h1>
          <p className="page-subtitle">Manage AI integration, system units, database state, and telemetry preferences.</p>
        </div>
      </header>

      {/* AI Integration Card */}
      <div className="card mb-4 border-primary">
        <div className="flex-between align-center mb-3">
          <div>
            <h3 className="section-title">🤖 AI Virtual Coach Integration (Google Gemini API)</h3>
            <p className="stat-lbl">Connect your free Google Gemini API key to activate live personalized AI coaching.</p>
          </div>
          <span className={`badge ${apiKey ? 'badge-success' : 'badge-warning'}`}>
            {apiKey ? '🟢 Gemini Connected' : '🟡 Free API Key Needed'}
          </span>
        </div>

        <div className="form-grid gap-3">
          <div>
            <label className="input-label flex-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary"
                style={{ textDecoration: 'underline' }}
              >
                🔗 Get Free API Key (Google AI Studio)
              </a>
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                className="input-field flex-1"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary text-xs"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            <div>
              <label className="input-label">AI Model Tier</label>
              <select
                className="select-input"
                value={selectedModel}
                onChange={(e) => setSelectedModelInput(e.target.value)}
              >
                {aiService.AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Default Coach Persona</label>
              <select
                className="select-input"
                value={selectedPersona}
                onChange={(e) => setSelectedPersonaInput(e.target.value)}
              >
                {aiService.COACH_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>


        {testStatus.msg && (
          <div
            className={`p-3 mt-3 border-radius text-sm ${
              testStatus.type === 'success'
                ? 'bg-success-light text-success'
                : testStatus.type === 'error'
                ? 'bg-danger-light text-danger'
                : 'bg-surface text-secondary'
            }`}
            style={{
              backgroundColor: testStatus.type === 'success' ? '#10B98122' : testStatus.type === 'error' ? '#EF444422' : '#1E293B',
              border: `1px solid ${testStatus.type === 'success' ? '#10B981' : testStatus.type === 'error' ? '#EF4444' : '#334155'}`
            }}
          >
            {testStatus.msg}
          </div>
        )}

        <div className="flex gap-3 mt-4 flex-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handleSaveApiKey} style={{ fontWeight: 900, padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            💾 Save Key & Model
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={testStatus.loading}
            style={{ fontWeight: 900, padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {testStatus.loading ? 'Testing...' : '⚡ Test Connection'}
          </button>
          {apiKey && (
            <button className="btn btn-danger" onClick={handleClearApiKey} style={{ fontWeight: 900, padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              🗑️ Clear Key
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Application Preferences Card */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 className="section-title mb-3" style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', margin: '0 0 1rem 0' }}>Application Preferences</h3>
          <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="input-label" style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '0.35rem' }}>Measurement System</label>
              <select
                className="select-input"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem', background: '#ffffff' }}
              >
                <option value="metric">Metric System (kg, cm, ml)</option>
                <option value="imperial">Imperial System (lbs, inches, oz)</option>
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                gap: '1rem'
              }}
            >
              <div>
                <strong style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Push & Daily Habit Reminders</strong>
                <p className="stat-lbl" style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Receive notifications for hydration, workouts, and supplements.</p>
              </div>
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0 }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                gap: '1rem'
              }}
            >
              <div>
                <strong style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Background Device Auto-Sync</strong>
                <p className="stat-lbl" style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Sync wearable pulse and steps automatically every 15 minutes.</p>
              </div>
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0 }}
              />
            </div>
          </div>
        </div>

        {/* Database & Text Storage Tools Card */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 className="section-title mb-2" style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.3rem 0' }}>Database & Text Storage Tools</h3>
          <p className="stat-lbl mb-4" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
            All your health, workout, and sleep telemetry is stored locally in your browser's persistent database and auto-synchronized to plain text files (`.txt`).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => db.exportLoginHistoryAsText()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                📜
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Export User Login History (.txt)</strong>
                <span className="stat-lbl" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, display: 'block', marginTop: '0.15rem' }}>Download text log (`user_logins.txt`) with {db.getAll('userLogins').length} user entries.</span>
              </div>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => db.exportDatabaseAsText()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef9c3', color: '#854d0e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                📄
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Export Full Database (.txt)</strong>
                <span className="stat-lbl" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, display: 'block', marginTop: '0.15rem' }}>Download plain text snapshot of all database tables.</span>
              </div>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportDB}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                📥
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Export Local Database (JSON)</strong>
                <span className="stat-lbl" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, display: 'block', marginTop: '0.15rem' }}>Download full raw JSON backup of all tables.</span>
              </div>
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleReseed}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                🔄
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', color: '#dc2626' }}>Reset Database to Seed Defaults</strong>
                <span className="stat-lbl" style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 500, display: 'block', marginTop: '0.15rem' }}>Wipes custom modifications and restores initial seed.</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
