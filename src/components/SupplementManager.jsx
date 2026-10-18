import React, { useState } from 'react';

export default function SupplementManager({ supplements = [], onAddSupplement, onToggleTaken }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('Morning');
  const [stock, setStock] = useState('30');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddSupplement({
      name,
      dosage,
      timing,
      taken_today: false,
      stock_count: Number(stock)
    });
    setName('');
    setDosage('');
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Supplement & Medication Manager</h1>
          <p className="page-subtitle">Organize your daily supplement stack, dosages, timing, and inventory levels.</p>
        </div>
      </header>

      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-title mb-3">Today's Supplement Schedule</h3>
          <div className="supplements-list">
            {supplements.map((supp) => {
              const defaultSuppImg = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=300&q=80';
              return (
                <div
                  key={supp.supp_id}
                  className={`supp-item p-3 mb-3 border-radius flex-between align-center flex-wrap gap-2 ${supp.taken_today ? 'taken' : ''}`}
                >
                  <div className="flex align-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 font-bold text-xl flex items-center justify-center shrink-0">
                      💊
                    </div>
                    <div>
                      <div className="flex-gap align-center mb-1">
                        <span className="badge badge-accent">{supp.timing}</span>
                        <span className="stat-lbl">Dosage: {supp.dosage}</span>
                      </div>
                      <h4 className="font-bold text-lg">{supp.name}</h4>
                      <span className={`text-xs ${supp.stock_count < 10 ? 'text-rose font-bold' : 'stat-lbl'}`}>
                        📦 Inventory Stock: {supp.stock_count} servings remaining
                      </span>
                    </div>
                  </div>

                  <button
                    className={`btn ${supp.taken_today ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => onToggleTaken(supp.supp_id, !supp.taken_today)}
                  >
                    {supp.taken_today ? '✓ Taken Today' : 'Mark Taken'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-3">Add Supplement to Stack</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="input-label">Supplement Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Creatine Monohydrate"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label">Dosage</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 5g or 2 Capsules"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label">Recommended Timing</label>
              <select className="select-input" value={timing} onChange={(e) => setTiming(e.target.value)}>
                <option value="Morning">Morning</option>
                <option value="Pre-Workout">Pre-Workout</option>
                <option value="Post-Workout">Post-Workout</option>
                <option value="With Lunch">With Lunch</option>
                <option value="Before Bed">Before Bed</option>
              </select>
            </div>
            <div>
              <label className="input-label">Current Stock Count</label>
              <input
                type="number"
                className="input-field"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Add Supplement
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
