import React, { useState } from 'react';

export default function HydrationTracker({ hydrationLogs = [], onAddHydration }) {
  const currentLog = hydrationLogs[hydrationLogs.length - 1] || { amount_ml: 2250, target_ml: 3000 };
  const [customMl, setCustomMl] = useState('250');

  const pct = Math.min(100, Math.round((currentLog.amount_ml / currentLog.target_ml) * 100));

  const handleAdd = (ml) => {
    const newAmount = currentLog.amount_ml + Number(ml);
    onAddHydration({
      date: new Date().toISOString().slice(0, 10),
      amount_ml: newAmount,
      target_ml: currentLog.target_ml
    });
  }; 
 
  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Water & Hydration Tracker</h1>
          <p className="page-subtitle">Monitor fluid intake, set daily hydration targets, and log water consumption.</p>
        </div>
      </header>

      <div className="grid grid-2 gap-4 mb-4">
        <div className="card text-center flex-center flex-col p-4">
          <h3 className="section-title mb-3">Daily Hydration Progress</h3>
          <div className="hydration-ring-wrapper my-3">
            <div className="score-ring-lg text-cyan">{pct}%</div>
          </div>
          <div className="text-xl font-bold mt-2">
            {currentLog.amount_ml} <span className="stat-lbl">/ {currentLog.target_ml} ml</span>
          </div>
          <p className="stat-lbl mt-1">{currentLog.target_ml - currentLog.amount_ml > 0 ? `${currentLog.target_ml - currentLog.amount_ml} ml remaining to hit goal` : '🎉 Goal Achieved!'}</p>
        </div>

        <div className="card">
          <h3 className="section-title mb-3" style={{ fontWeight: 900, color: '#0f172a' }}>Quick Fluid Intake Options</h3>
          <div className="grid grid-3 gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleAdd(250)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 0.5rem',
                minHeight: '110px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <span style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>🥛</span>
              <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1e40af' }}>+250 ml</span>
              <span className="stat-lbl" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.2rem' }}>Glass of Water</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => handleAdd(500)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 0.5rem',
                minHeight: '110px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <span style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>🧴</span>
              <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1e40af' }}>+500 ml</span>
              <span className="stat-lbl" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.2rem' }}>Water Bottle</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => handleAdd(750)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 0.5rem',
                minHeight: '110px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <span style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>🍾</span>
              <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1e40af' }}>+750 ml</span>
              <span className="stat-lbl" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.2rem' }}>Sports Flask</span>
            </button>
          </div>

          <hr className="divider my-3" style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0' }} />

          <h4 className="input-label mb-2" style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.4rem' }}>Custom Intake Logger</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="number"
              className="input-field"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              placeholder="Amount in ml"
              style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleAdd(customMl)}
              style={{
                padding: '0.7rem 1.25rem',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              💧 Log Intake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    