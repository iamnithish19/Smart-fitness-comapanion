import React, { useState } from 'react';

export default function HealthTracker({ records, onAdd, onDelete }) {
  const [form, setForm] = useState({ heart_rate: '', steps: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.heart_rate) return;
    onAdd({
      heart_rate: Number(form.heart_rate),
      steps: Number(form.steps) || 0,
      timestamp: new Date().toISOString()
    });
    setForm({ heart_rate: '', steps: '' });
  };

  const sorted = [...records].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">User records →</div>
          <h1 className="page-title">Health Tracker</h1>
          <p className="page-desc">
            Entity: <code>HealthTracker</code> — heart rate, step count, and timestamp readings
            logged against the user.
          </p>
        </div>
      </div>

      <div className="card section">
        {sorted.length === 0 ? (
          <div className="empty-state">No readings recorded yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>record_id</th>
                <th>heart_rate</th>
                <th>steps</th>
                <th>timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.record_id}>
                  <td>#{r.record_id}</td>
                  <td>{r.heart_rate} bpm</td>
                  <td>{r.steps.toLocaleString()}</td>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td>
                    <button className="icon-btn" onClick={() => onDelete(r.record_id)}>
                      delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form className="inline-form" onSubmit={submit}>
          <div className="field">
            <label>Heart rate (bpm)</label>
            <input
              type="number"
              value={form.heart_rate}
              onChange={(e) => setForm((f) => ({ ...f, heart_rate: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Steps</label>
            <input
              type="number"
              value={form.steps}
              onChange={(e) => setForm((f) => ({ ...f, steps: e.target.value }))}
            />
          </div>
          <button className="btn" type="submit">
            + log reading
          </button>
        </form>
      </div>
    </div>
  );
}