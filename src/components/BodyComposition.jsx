import React, { useState } from 'react';

export default function BodyComposition({ measurements = [], user = {}, onAddMeasurement }) {
  const latest = measurements[measurements.length - 1] || {
    weight: user.weight || 63.5,
    body_fat: 20.1,
    muscle_mass: 49.3,
    chest_cm: 93,
    waist_cm: 69,
    hips_cm: 94,
    bicep_cm: 31
  };
     
  const heightM = (user.height || 168) / 100;
  const bmi = (latest.weight / (heightM * heightM)).toFixed(1);

  const [w, setW] = useState(latest.weight);
  const [bf, setBf] = useState(latest.body_fat);
  const [mm, setMm] = useState(latest.muscle_mass);
  const [chest, setChest] = useState(latest.chest_cm);
  const [waist, setWaist] = useState(latest.waist_cm);
  const [bicep, setBicep] = useState(latest.bicep_cm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMeasurement({
      date: new Date().toISOString().slice(0, 10),
      weight: Number(w),
      body_fat: Number(bf),
      muscle_mass: Number(mm),
      chest_cm: Number(chest),
      waist_cm: Number(waist),
      hips_cm: Number(waist) + 25,
      bicep_cm: Number(bicep)
    });
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Body Composition & Measurements</h1>
          <p className="page-subtitle">Track body fat percentage, lean muscle mass, BMI, and body girth metrics.</p>
        </div>
      </header>

      <div className="grid grid-4 gap-3 mb-4">
        <div className="card text-center">
          <span className="stat-lbl">BODY WEIGHT</span>
          <div className="stat-num my-2 text-cyan">{latest.weight} kg</div>
          <span className="stat-lbl">Target: 62.0 kg</span>
        </div>
        <div className="card text-center">
          <span className="stat-lbl">BODY FAT %</span>
          <div className="stat-num my-2 text-emerald">{latest.body_fat}%</div>
          <span className="badge badge-success">Fit / Athletic</span>
        </div>
        <div className="card text-center">
          <span className="stat-lbl">LEAN MUSCLE MASS</span>
          <div className="stat-num my-2 text-amber">{latest.muscle_mass} kg</div>
          <span className="stat-lbl">77.6% of Body Mass</span>
        </div>
        <div className="card text-center">
          <span className="stat-lbl">BODY MASS INDEX (BMI)</span>
          <div className="stat-num my-2 text-purple">{bmi}</div>
          <span className="badge badge-accent">Normal Range</span>
        </div>
      </div>

      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-title mb-3">Current Girth Circumferences</h3>
          <div className="grid grid-2 gap-3">
            <div className="stat-box">
              <span className="stat-num">{latest.chest_cm} cm</span>
              <span className="stat-lbl">CHEST</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{latest.waist_cm} cm</span>
              <span className="stat-lbl">WAIST</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{latest.hips_cm} cm</span>
              <span className="stat-lbl">HIPS</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{latest.bicep_cm} cm</span>
              <span className="stat-lbl">BICEPS</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-3">Log New Measurements</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="input-label">Weight (kg)</label>
              <input type="number" step="0.1" className="input-field" value={w} onChange={(e) => setW(e.target.value)} required />
            </div>
            <div>
              <label className="input-label">Body Fat %</label>
              <input type="number" step="0.1" className="input-field" value={bf} onChange={(e) => setBf(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Muscle Mass (kg)</label>
              <input type="number" step="0.1" className="input-field" value={mm} onChange={(e) => setMm(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Chest (cm)</label>
              <input type="number" className="input-field" value={chest} onChange={(e) => setChest(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Waist (cm)</label>
              <input type="number" className="input-field" value={waist} onChange={(e) => setWaist(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Bicep (cm)</label>
              <input type="number" className="input-field" value={bicep} onChange={(e) => setBicep(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Save Entry
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-3">Measurement History Log</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Body Fat</th>
              <th>Muscle Mass</th>
              <th>Waist</th>
              <th>Bicep</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m) => (
              <tr key={m.measurement_id}>
                <td>{m.date}</td>
                <td>{m.weight} kg</td>
                <td>{m.body_fat}%</td>
                <td>{m.muscle_mass} kg</td>
                <td>{m.waist_cm} cm</td>
                <td>{m.bicep_cm} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
