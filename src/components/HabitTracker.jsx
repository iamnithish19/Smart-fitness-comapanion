import React, { useState } from 'react';

export default function HabitTracker({ habits = [], onAddHabit, onToggleHabit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Health');

  const completedCount = habits.filter((h) => h.completed_today).length;
  const totalCount = habits.length;
  const scorePct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit({
      name,
      category,
      streak: 1,
      completed_today: false
    });
    setName('');
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Habit Streak & Routine Planner</h1>
          <p className="page-subtitle">Build healthy lifestyle habits, track daily streaks, and maintain daily discipline.</p>
        </div>
      </header>

      <div className="grid grid-3 gap-3 mb-4">
        <div className="card text-center">
          <span className="stat-lbl">TODAY'S HABIT SCORE</span>
          <div className="score-ring-lg my-2 text-cyan">{scorePct}%</div>
          <span className="stat-lbl">{completedCount} of {totalCount} completed</span>
        </div>

        <div className="card text-center">
          <span className="stat-lbl">LONGEST ACTIVE STREAK</span>
          <div className="stat-num my-2 text-amber">
            🔥 {habits.reduce((max, h) => Math.max(max, h.streak || 0), 0)} Days
          </div>
          <span className="badge badge-accent">Unstoppable Discipline</span>
        </div>

        <div className="card text-center">
          <span className="stat-lbl">DAILY ROUTINE STATUS</span>
          <div className="stat-num my-2 text-emerald">
            {completedCount === totalCount && totalCount > 0 ? 'COMPLETE' : 'IN PROGRESS'}
          </div>
          <span className="stat-lbl">Check off all items below</span>
        </div>
      </div>

      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-title mb-3">Add Custom Daily Habit</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="input-label">Habit Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 10 Minute Mobility Warmup"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select className="select-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Health">Health</option>
                <option value="Recovery">Recovery</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Rest">Rest</option>
                <option value="Mindset">Mindset</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Create Habit
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="section-title mb-3">Habit Checklist for Today</h3>
          <div className="habits-list">
            {habits.map((h) => (
              <div
                key={h.habit_id}
                className={`habit-row p-3 mb-2 border-radius flex-between align-center ${h.completed_today ? 'completed' : ''}`}
              >
                <div className="flex-gap align-center">
                  <input
                    type="checkbox"
                    className="checkbox-custom"
                    checked={h.completed_today}
                    onChange={() => onToggleHabit(h.habit_id, !h.completed_today)}
                  />
                  <div>
                    <h4 className="font-bold text-md mb-0">{h.name}</h4>
                    <span className="badge badge-secondary text-xs">{h.category}</span>
                  </div>
                </div>

                <div className="flex-gap align-center">
                  <span className="streak-badge">🔥 {h.streak} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
