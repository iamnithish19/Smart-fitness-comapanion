import React, { useState } from 'react';

export default function GoalsMilestones({ goals = [], onAddGoal, onToggleGoal }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Body Composition');
  const [targetVal, setTargetVal] = useState('');
  const [currentVal, setCurrentVal] = useState('');
  const [deadline, setDeadline] = useState('2026-10-31');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddGoal({
      title,
      category,
      target_value: targetVal,
      current_value: currentVal,
      status: 'In Progress',
      deadline
    });
    setTitle('');
    setTargetVal('');
    setCurrentVal('');
  };
   
  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Goal Setting & Milestones</h1>
          <p className="page-subtitle">Establish target milestones, track deadline countdowns, and celebrate fitness victories.</p>
        </div>
      </header>

      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-title mb-3">Create New Milestone Goal</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="input-label">Goal Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Bench Press 80kg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select className="select-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Body Composition">Body Composition</option>
                <option value="Cardio Endurance">Cardio Endurance</option>
                <option value="Strength & Power">Strength & Power</option>
                <option value="Habit & Routine">Habit & Routine</option>
              </select>
            </div>
            <div>
              <label className="input-label">Current Starting Value</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 65kg"
                value={currentVal}
                onChange={(e) => setCurrentVal(e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Target Goal Value</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 80kg"
                value={targetVal}
                onChange={(e) => setTargetVal(e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Target Deadline</label>
              <input
                type="date"
                className="input-field"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Save Goal Milestone
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="section-title mb-3">Goal Performance Summary</h3>
          <div className="grid grid-2 gap-3 mb-3">
            <div className="stat-box">
              <span className="stat-num text-cyan">{goals.length}</span>
              <span className="stat-lbl">TOTAL GOALS</span>
            </div>
            <div className="stat-box">
              <span className="stat-num text-emerald">{goals.filter((g) => g.status === 'Achieved').length}</span>
              <span className="stat-lbl">ACHIEVED VICTORIES</span>
            </div>
          </div>
          <p className="stat-lbl">
            Consistent milestone tracking increases long-term adherence by 78%! Keep pushing towards your target values.
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-3">Active & Achieved Goals</h3>
        <div className="goals-list">
          {goals.map((g) => {
            const isDone = g.status === 'Achieved';
            return (
              <div key={g.goal_id} className={`goal-item p-3 mb-3 border-radius flex-between align-center flex-wrap gap-2 ${isDone ? 'done-goal' : ''}`}>
                <div>
                  <div className="flex-gap align-center mb-1">
                    <span className={`badge ${isDone ? 'badge-success' : 'badge-accent'}`}>{g.category}</span>
                    <span className="stat-lbl">Target: {g.deadline}</span>
                  </div>
                  <h4 className="text-lg font-bold">{g.title}</h4>
                  <div className="stat-lbl mt-1">
                    Current: <strong>{g.current_value}</strong> ➜ Target: <strong>{g.target_value}</strong>
                  </div>
                </div>
                <button
                  className={`btn ${isDone ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => onToggleGoal(g.goal_id, isDone ? 'In Progress' : 'Achieved')}
                >
                  {isDone ? '✓ Achieved!' : 'Mark Achieved'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
