import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';

export default function WorkoutTemplates({ user, currentUser, onNavigate, onRefresh }) {
  const activeUser = currentUser || user;
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('Weight Loss');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [exercisesText, setExercisesText] = useState('Barbell Squats, 4, 10\nBench Press, 4, 10\nPlank Hold, 3, 60s');

  const refreshData = () => {
    const tmpls = db.getAll('workoutTemplates') || [];
    setTemplates(tmpls);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedExercises = exercisesText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split(',');
        return {
          name: parts[0]?.trim() || 'Exercise',
          sets: Number(parts[1]?.trim()) || 3,
          reps: parts[2]?.trim() || '10'
        };
      });

    const newTemplate = {
      name: name.trim(),
      description: description.trim() || 'Custom workout plan template.',
      goal,
      difficulty,
      duration_weeks: Number(durationWeeks) || 4,
      trainer_id: activeUser?.user_id || 2,
      created_date: new Date().toISOString().slice(0, 10),
      exercises: parsedExercises
    };

    if (selectedTemplate && selectedTemplate.template_id) {
      db.update('workoutTemplates', selectedTemplate.template_id, newTemplate);
      showToast(`✅ Template "${newTemplate.name}" updated!`);
    } else {
      db.insert('workoutTemplates', newTemplate);
      showToast(`✅ Created new template "${newTemplate.name}"!`);
    }

    setShowModal(false);
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    refreshData();
    if (onRefresh) onRefresh();
  };

  const handleDuplicate = (tmpl) => {
    const dup = {
      ...tmpl,
      name: `${tmpl.name} (Copy)`,
      created_date: new Date().toISOString().slice(0, 10)
    };
    delete dup.template_id;
    db.insert('workoutTemplates', dup);
    showToast(`📋 Duplicated "${tmpl.name}" template!`);
    refreshData();
    if (onRefresh) onRefresh();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this workout template?')) {
      db.remove('workoutTemplates', id);
      showToast('🗑️ Template deleted.');
      refreshData();
      if (onRefresh) onRefresh();
    }
  };

  const openCreateModal = () => {
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    setGoal('Weight Loss');
    setDifficulty('Beginner');
    setDurationWeeks(4);
    setExercisesText('Barbell Squats, 4, 10\nBench Press, 4, 10\nPlank Hold, 3, 60s');
    setShowModal(true);
  };

  const openEditModal = (tmpl) => {
    setSelectedTemplate(tmpl);
    setName(tmpl.name);
    setDescription(tmpl.description || '');
    setGoal(tmpl.goal || 'Weight Loss');
    setDifficulty(tmpl.difficulty || 'Beginner');
    setDurationWeeks(tmpl.duration_weeks || 4);
    const exStr = (tmpl.exercises || []).map((e) => `${e.name}, ${e.sets}, ${e.reps}`).join('\n');
    setExercisesText(exStr || 'Barbell Squats, 4, 10');
    setShowModal(true);
  };

  const isConsultant = activeUser?.role === 'consultant';

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: isConsultant ? '#7c3aed' : '#ca8a04',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 800,
            zIndex: 9999,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          {notification}
        </div>
      )}

      <header className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: isConsultant ? '#7c3aed' : '#ca8a04', textTransform: 'uppercase' }}>
            {isConsultant ? '💼 GYM CONSULTANT DEDICATED WORKSPACE' : 'TRAINER & MASTER CONTROL'}
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Workout Plan Templates
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            {isConsultant
              ? 'Author, design, and provide standardized workout plan templates for the gym ecosystem.'
              : 'Create reusable workout plan templates and bulk assign them to gym members.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={openCreateModal}
            style={{
              padding: '0.65rem 1.25rem',
              background: isConsultant ? '#7c3aed' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            ➕ Create New Template
          </button>
          {!isConsultant && (
            <button
              onClick={() => onNavigate && onNavigate('bulk-assign')}
              style={{
                padding: '0.65rem 1.25rem',
                background: '#ca8a04',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🚀 Bulk Assign Templates
            </button>
          )}
        </div>
      </header>

      {isConsultant && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            border: '1.5px solid rgba(124, 58, 237, 0.25)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.6rem' }}>💼</span>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6d28d9', marginBottom: '2px' }}>
                Gym Consultant Role Active
              </div>
              <div style={{ fontSize: '0.84rem', color: '#4b5563', fontWeight: 600 }}>
                This login is exclusively dedicated to providing workout templates. All other modules and client views have been removed from this profile.
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              background: '#7c3aed',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '9999px',
              letterSpacing: '0.05em'
            }}
          >
            WORKOUT TEMPLATES ONLY
          </span>
        </div>
      )}

      {/* TEMPLATES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {templates.map((tmpl) => (
          <div
            key={tmpl.template_id}
            className="card p-5"
            style={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 900,
                    padding: '0.2rem 0.60rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {tmpl.goal || 'General Fitness'}
                </span>

                <span
                  style={{
                    background: tmpl.difficulty === 'Beginner' ? '#dcfce7' : tmpl.difficulty === 'Intermediate' ? '#fef9c3' : '#fef2f2',
                    color: tmpl.difficulty === 'Beginner' ? '#166534' : tmpl.difficulty === 'Intermediate' ? '#854d0e' : '#dc2626',
                    fontWeight: 900,
                    padding: '0.2rem 0.60rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem'
                  }}
                >
                  {tmpl.difficulty}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                {tmpl.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, margin: '0 0 1rem 0', lineHeight: 1.45 }}>
                {tmpl.description}
              </p>

              {/* EXERCISES SNIPPET */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  EXERCISES ({tmpl.exercises?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {(tmpl.exercises || []).map((ex, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      <span>• {ex.name}</span>
                      <span style={{ color: '#2563eb', fontWeight: 900 }}>{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD ACTION BUTTONS */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => openEditModal(tmpl)}
                style={{ flex: 1, padding: '0.45rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDuplicate(tmpl)}
                style={{ flex: 1, padding: '0.45rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                📋 Duplicate
              </button>
              <button
                onClick={() => handleDelete(tmpl.template_id)}
                style={{ padding: '0.45rem 0.6rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '560px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                {selectedTemplate ? '✏️ Edit Template' : '➕ Create Workout Plan Template'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>TEMPLATE NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muscle Building Hypertrophy"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe goal and focus of this routine..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>GOAL</label>
                  <select value={goal} onChange={(e) => setGoal(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Strength Training">Strength Training</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Home Workout">Home Workout</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>DIFFICULTY</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>DURATION (WKS)</label>
                  <input type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                  EXERCISES (One per line: Name, Sets, Reps)
                </label>
                <textarea
                  value={exercisesText}
                  onChange={(e) => setExercisesText(e.target.value)}
                  rows={4}
                  placeholder="Barbell Squats, 4, 10&#10;Bench Press, 4, 10"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', background: '#2563eb' }}>Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
