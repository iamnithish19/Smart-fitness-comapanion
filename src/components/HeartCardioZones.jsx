import React, { useState } from 'react';

export default function HeartCardioZones({ user = {} }) {
  const age = user.age || 28;
  const maxHR = 220 - age;
  const [restingHR, setRestingHR] = useState(62);

  const hrReserve = maxHR - restingHR;
  const zones = [
    { name: 'Warmup & Light', pct: '50-60%', min: Math.round(restingHR + hrReserve * 0.5), max: Math.round(restingHR + hrReserve * 0.6), color: '#38bdf8', desc: 'Active recovery and light aerobic maintenance.' },
    { name: 'Fat Burn & Fitness', pct: '60-70%', min: Math.round(restingHR + hrReserve * 0.6), max: Math.round(restingHR + hrReserve * 0.7), color: '#34d399', desc: 'Optimal intensity for fat metabolism and endurance building.' },
    { name: 'Aerobic & Endurance', pct: '70-80%', min: Math.round(restingHR + hrReserve * 0.7), max: Math.round(restingHR + hrReserve * 0.8), color: '#fbbf24', desc: 'Increases aerobic capacity and cardiovascular efficiency.' },
    { name: 'Anaerobic & Speed', pct: '80-90%', min: Math.round(restingHR + hrReserve * 0.8), max: Math.round(restingHR + hrReserve * 0.9), color: '#f97316', desc: 'High intensity effort, improves lactic acid tolerance.' },
    { name: 'Peak Effort / Redline', pct: '90-100%', min: Math.round(restingHR + hrReserve * 0.9), max: maxHR, color: '#ef4444', desc: 'Maximum effort sprints and short interval peaks.' }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Heart Rate & Cardio Zones</h1>
          <p className="page-subtitle">Customized training zones based on your age ({age}) and physiological markers.</p>
        </div>
      </header>

      <div className="grid grid-3 gap-3 mb-4">
        <div className="card text-center">
          <span className="stat-lbl">MAX HEART RATE</span>
          <div className="stat-num my-2 text-rose">{maxHR} BPM</div>
          <span className="stat-lbl">Formula: 220 - Age</span>
        </div>

        <div className="card text-center">
          <span className="stat-lbl">RESTING HEART RATE</span>
          <div className="stat-num my-2 text-cyan">{restingHR} BPM</div>
          <div className="flex-center gap-2 mt-1">
            <label className="input-label">Adjust RHR:</label>
            <input
              type="number"
              className="input-field-sm"
              value={restingHR}
              onChange={(e) => setRestingHR(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="card text-center">
          <span className="stat-lbl">ESTIMATED VO2 MAX</span>
          <div className="stat-num my-2 text-emerald">48.5 ml/kg/min</div>
          <span className="badge badge-success">Superior Fitness Rank</span>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-3">5 Personal Heart Rate Zones</h3>
        <div className="zones-list">
          {zones.map((zone, idx) => (
            <div key={zone.name} className="zone-row p-3 mb-3 border-radius" style={{ borderLeft: `6px solid ${zone.color}` }}>
              <div className="flex-between align-center flex-wrap gap-2">
                <div>
                  <span className="badge" style={{ backgroundColor: zone.color, color: '#090d16' }}>Zone {idx + 1}</span>
                  <strong className="ml-2 text-lg">{zone.name}</strong>
                  <p className="stat-lbl mt-1">{zone.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: zone.color }}>
                    {zone.min} - {zone.max} BPM
                  </div>
                  <span className="stat-lbl">{zone.pct} Max HR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
