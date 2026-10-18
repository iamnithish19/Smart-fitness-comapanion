import React, { useState } from 'react';
import * as aiService from '../services/aiService.js';

export default function SleepAnalytics({ sleepLogs = [], onAddSleep, user }) {
  const [hours, setHours] = useState('7.5');
  const [rem, setRem] = useState('1.8');
  const [deep, setDeep] = useState('2.0');
  const [quality, setQuality] = useState('Optimal');
  const [aiAdvice, setAiAdvice] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const latestLog = sleepLogs[sleepLogs.length - 1] || {
    duration_hours: 8.0,
    score: 88,
    rem_hours: 2.0,
    deep_hours: 2.2,
    light_hours: 3.8,
    quality: 'Optimal'
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const h = Number(hours);
    const score = Math.min(100, Math.round((h / 8) * 90));
    onAddSleep({
      date: new Date().toISOString().slice(0, 10),
      duration_hours: h,
      rem_hours: Number(rem),
      deep_hours: Number(deep),
      light_hours: Math.max(0, Number((h - Number(rem) - Number(deep)).toFixed(1))),
      score,
      quality
    });
  };

  const handleFetchAiAdvice = async () => {
    setLoadingAi(true);
    try {
      const res = await aiService.generateSleepRecoveryAdvice({ user, metrics: { sleepLogs } });
      setAiAdvice(res);
    } catch (err) {
      setAiAdvice(`🌙 **Gemini Recovery Protocol**: Maintain a dark, quiet room at 18°C. Aim for consistent bedtimes to optimize circadian alignment and maximize deep sleep percentage!`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header flex-between align-center flex-wrap gap-2">
        <div>
          <h1 className="page-title">Sleep & Recovery</h1>
          <p className="page-subtitle">Track sleep duration, quality scores, and recovery trends.</p>
        </div>
        <button
          className="btn btn-primary text-xs flex align-center gap-1"
          onClick={handleFetchAiAdvice}
          disabled={loadingAi}
        >
          {loadingAi ? '⏳ Analyzing...' : '🌙 AI Sleep Insights'}
        </button>
      </header>

      {aiAdvice && (
        <div className="card mb-4 p-4 border-primary bg-surface">
          <h3 className="section-title text-md flex align-center gap-2 mb-2">
            <span>🤖</span> AI Sleep Recovery Insight
          </h3>
          <div className="text-sm text-secondary leading-relaxed">
            {aiAdvice.split('\n').map((l, idx) => (
              <p key={idx} className="my-1">{l}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-3 gap-3 mb-4">
        <div className="card text-center">
          <span className="stat-lbl">SLEEP QUALITY SCORE</span>
          <div className="score-ring-lg my-2 text-cyan">{latestLog.score}</div>
          <span className="badge badge-success">{latestLog.quality} Recovery</span>
        </div>

        <div className="card text-center">
          <span className="stat-lbl">TOTAL SLEEP DURATION</span>
          <div className="stat-num my-2">{latestLog.duration_hours} hrs</div>
          <span className="stat-lbl">Target: 8.0 hrs</span>
        </div>

        <div className="card text-center">
          <span className="stat-lbl">RECOVERY READINESS</span>
          <div className="stat-num my-2 text-cyan">94%</div>
          <span className="badge badge-accent">Ready for High Intensity</span>
        </div>
      </div>


      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-title mb-3">Sleep Stages Breakdown</h3>
          <div className="stage-bar-container mb-3">
            <div
              className="stage-segment rem"
              style={{ width: `${(latestLog.rem_hours / latestLog.duration_hours) * 100}%` }}
              title={`REM: ${latestLog.rem_hours}h`}
            />
            <div
              className="stage-segment deep"
              style={{ width: `${(latestLog.deep_hours / latestLog.duration_hours) * 100}%` }}
              title={`Deep: ${latestLog.deep_hours}h`}
            />
            <div
              className="stage-segment light"
              style={{ width: `${(latestLog.light_hours / latestLog.duration_hours) * 100}%` }}
              title={`Light: ${latestLog.light_hours}h`}
            />
          </div>

          <div className="stage-legend">
            <div className="legend-item">
              <span className="dot rem-dot"></span>
              <span>REM Sleep ({latestLog.rem_hours}h)</span>
            </div>
            <div className="legend-item">
              <span className="dot deep-dot"></span>
              <span>Deep Sleep ({latestLog.deep_hours}h)</span>
            </div>
            <div className="legend-item">
              <span className="dot light-dot"></span>
              <span>Light Sleep ({latestLog.light_hours}h)</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-3">Log Nightly Sleep Session</h3>
          <form onSubmit={handleAdd} className="form-grid">
            <div>
              <label className="input-label">Total Duration (Hours)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label">REM Sleep (Hours)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={rem}
                onChange={(e) => setRem(e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Deep Sleep (Hours)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={deep}
                onChange={(e) => setDeep(e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Overall Rest Quality</label>
              <select className="select-input" value={quality} onChange={(e) => setQuality(e.target.value)}>
                <option value="Optimal">Optimal</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Restless">Restless</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Save Sleep Log
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-3">Recent Sleep Logs History</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Score</th>
              <th>REM / Deep</th>
              <th>Quality</th>
            </tr>
          </thead>
          <tbody>
            {sleepLogs.map((log) => (
              <tr key={log.sleep_id}>
                <td>{log.date}</td>
                <td>{log.duration_hours} hrs</td>
                <td><span className="badge badge-accent">{log.score} / 100</span></td>
                <td>{log.rem_hours}h REM / {log.deep_hours}h Deep</td>
                <td>{log.quality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
