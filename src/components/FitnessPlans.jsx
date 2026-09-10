import React, { useState } from 'react';
import * as aiService from '../services/aiService.js';
import { calculatePersonalBmiAnalysis } from '../services/bmiAnalysis.js';

function ExerciseList({ exercises, onAdd, onDelete }) {
  const [form, setForm] = useState({ name: '', sets: '', reps: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onAdd({ name: form.name, sets: Number(form.sets) || 0, reps: Number(form.reps) || 0 });
    setForm({ name: '', sets: '', reps: '' });
  };

  return (
    <div style={{ marginTop: 10 }}>
      {exercises.map((ex) => (
        <span key={ex.exercise_id} className="exercise-tag" style={{ fontWeight: 800, padding: '4px 8px', borderRadius: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', marginRight: '6px', marginBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {ex.name} · {ex.sets}×{ex.reps}
          <button
            className="icon-btn"
            style={{ padding: '1px 6px', fontSize: 10, cursor: 'pointer', background: 'none', border: 'none', color: '#dc2626', fontWeight: 900 }}
            onClick={() => onDelete(ex.exercise_id)}
          >
            ✕
          </button>
        </span>
      ))}
      <form onSubmit={submit} style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-field-sm"
          placeholder="exercise name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          style={{ width: 150, padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
        />
        <input
          className="input-field-sm"
          placeholder="sets"
          type="number"
          value={form.sets}
          onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
          style={{ width: 65, padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
        />
        <input
          className="input-field-sm"
          placeholder="reps"
          type="number"
          value={form.reps}
          onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
          style={{ width: 65, padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
        />
        <button className="icon-btn" type="submit" style={{ padding: '0.45rem 0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 900, cursor: 'pointer' }}>
          + exercise
        </button>
      </form>
    </div>
  );
}

function WorkoutBlock({ workout, exercises, onAddExercise, onDeleteExercise, onDeleteWorkout }) {
  const defaultWorkoutImg = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80';
  return (
    <div className="workout-row mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
      <div className="workout-head flex-between align-center mb-2">
        <div className="flex align-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={workout.image || defaultWorkoutImg}
            alt={workout.type}
            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <strong style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>{workout.type}</strong>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="pill" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
            {workout.duration_minutes} min
          </span>{' '}
          <button className="icon-btn" style={{ color: '#dc2626', fontWeight: 900, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onDeleteWorkout(workout.workout_id)}>
            🗑️ delete
          </button>
        </span>
      </div>
      <ExerciseList
        exercises={exercises}
        onAdd={(payload) => onAddExercise(workout.workout_id, payload)}
        onDelete={onDeleteExercise}
      />
    </div>
  );
}

function PlanCard({ plan, workouts, exercises, actions }) {
  const [form, setForm] = useState({ type: '', duration_minutes: '' });
  const defaultPlanImg = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80';

  const submit = (e) => {
    e.preventDefault();
    if (!form.type) return;
    actions.onAddWorkout(plan.plan_id, {
      type: form.type,
      duration_minutes: Number(form.duration_minutes) || 30
    });
    setForm({ type: '', duration_minutes: '' });
  };

  return (
    <div className="plan-block p-0 overflow-hidden mb-4" style={{ overflow: 'hidden', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
      <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
        <img
          src={plan.image || defaultPlanImg}
          alt={plan.plan_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            color: '#fff'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>{plan.plan_name}</h3>
            <div className="plan-meta" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.8rem' }}>
              plan_id #{plan.plan_id} · starts {plan.start_date}
            </div>
          </div>
          <button className="icon-btn text-rose" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 900, cursor: 'pointer', border: 'none' }} onClick={() => actions.onDeletePlan(plan.plan_id)}>
            🗑️ delete plan
          </button>
        </div>
      </div>

      <div className="p-4" style={{ padding: '1.25rem' }}>
        {workouts.length === 0 && <div className="empty-state" style={{ color: '#64748b', fontWeight: 700 }}>No workouts in this plan yet. Add one below.</div>}

        {workouts.map((w) => (
          <WorkoutBlock
            key={w.workout_id}
            workout={w}
            exercises={exercises.filter((e) => e.workout_id === w.workout_id)}
            onAddExercise={actions.onAddExercise}
            onDeleteExercise={actions.onDeleteExercise}
            onDeleteWorkout={actions.onDeleteWorkout}
          />
        ))}

        <form className="inline-form" onSubmit={submit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <div className="field" style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>WORKOUT TYPE</label>
            <input
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              placeholder="e.g. Leg Day & Power Squats"
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>
          <div className="field" style={{ width: '120px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>DURATION (MIN)</label>
            <input
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
              placeholder="45"
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>
          <button className="btn" type="submit" style={{ padding: '0.6rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>
            + workout
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FitnessPlans({ plans, workouts, exercises, actions, user }) {
  const [form, setForm] = useState({ plan_name: '', start_date: '' });
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiGoal, setAiGoal] = useState('Hypertrophy & Lean Muscle Gain');

  // Personal BMI Analysis
  const bmiAnalysis = calculatePersonalBmiAnalysis(user);

  const submitPlan = (e) => {
    e.preventDefault();
    if (!form.plan_name || !form.start_date) return;
    actions.onAddPlan(form);
    setForm({ plan_name: '', start_date: '' });
  };

  const handleApplyBmiRecommendedRoutine = () => {
    const today = new Date().toISOString().slice(0, 10);
    const plan = actions.onAddPlan({
      plan_name: `📊 Auto-BMI (${bmiAnalysis.bmiCategory}) Plan`,
      start_date: today
    });

    if (plan && plan.plan_id) {
      actions.onAddWorkout(plan.plan_id, {
        type: bmiAnalysis.workoutFocus,
        duration_minutes: 45
      });
    }

    alert(`✅ Added Recommended BMI Exercise Routine!\nPlan: Auto-BMI (${bmiAnalysis.bmiCategory}) Plan\nWorkout Routine: ${bmiAnalysis.workoutFocus}`);
  };

  const handleAiGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const generated = await aiService.generateAiWorkoutPlan({
        goal: aiGoal,
        durationWeeks: 4,
        user
      });

      if (generated && generated.plan_name) {
        const today = new Date().toISOString().slice(0, 10);
        actions.onAddPlan({
          plan_name: `🤖 ${generated.plan_name}`,
          start_date: today
        });
      }
    } catch (err) {
      const today = new Date().toISOString().slice(0, 10);
      actions.onAddPlan({
        plan_name: `🤖 AI Custom ${aiGoal} Plan`,
        start_date: today
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 900, color: '#ca8a04', textTransform: 'uppercase' }}>
            WORKOUT TELEMETRY & PLANS →
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Fitness Plans & Exercise Recommender
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Custom plans and exercises built manually, suggested automatically by your personal BMI & Age analysis, or generated by Gemini AI.
          </p>
        </div>
        <div className="flex align-center gap-2 flex-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field-sm"
            style={{ width: '220px', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem' }}
            placeholder="Target Goal (e.g. Endurance)"
            value={aiGoal}
            onChange={(e) => setAiGoal(e.target.value)}
          />
          <button
            className="btn btn-primary text-xs flex align-center gap-1"
            onClick={handleAiGeneratePlan}
            disabled={isGeneratingPlan}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', height: '100%' }}
          >
            {isGeneratingPlan ? '⏳ Gemini Generating...' : '🤖 AI Generate Plan'}
          </button>
        </div>
      </div>

      {/* AUTOMATIC BMI & AGE EXERCISE RECOMMENDER BANNER */}
      <div
        className="card mb-6 p-4"
        style={{
          borderRadius: '16px',
          border: `2px solid ${bmiAnalysis.bmiColor}`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
        }}
      >
        <div className="flex-between align-center flex-wrap gap-2 mb-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🏋️</span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                RECOMMENDED EXERCISE ROUTINE FOR YOUR BMI ({bmiAnalysis.bmi}) & AGE ({bmiAnalysis.age} YRS)
              </h3>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                Category: <strong>{bmiAnalysis.bmiCategory}</strong> • Workout Focus: <strong>{bmiAnalysis.workoutFocus}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={handleApplyBmiRecommendedRoutine}
            style={{
              padding: '0.65rem 1.1rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
            }}
          >
            ⚡ Add Recommended BMI Exercise Routine
          </button>
        </div>

        {/* Recommended Exercise Chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {bmiAnalysis.recommendedExercises.map((e, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ color: '#0f172a', fontWeight: 900, display: 'block', fontSize: '0.9rem' }}>{e.name}</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Focus: {e.focus}</span>
              </div>
              <span
                style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px'
                }}
              >
                {e.sets} x {e.reps}
              </span>
            </div>
          ))}
        </div>
      </div>

      {plans.length === 0 && (
        <div className="empty-state card p-4 text-center mb-4" style={{ borderRadius: '12px', color: '#64748b', fontWeight: 700 }}>
          No fitness plans yet — click "Add Recommended BMI Exercise Routine" above or build one below!
        </div>
      )}

      {plans.map((plan) => (
        <PlanCard
          key={plan.plan_id}
          plan={plan}
          workouts={workouts.filter((w) => w.plan_id === plan.plan_id)}
          exercises={exercises}
          actions={actions}
        />
      ))}

      <div className="card p-4 mt-4" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
          ➕ Add Custom Fitness Plan
        </h3>
        <form className="inline-form" style={{ borderTop: 'none', paddingTop: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }} onSubmit={submitPlan}>
          <div className="field">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>PLAN NAME</label>
            <input
              value={form.plan_name}
              onChange={(e) => setForm((f) => ({ ...f, plan_name: e.target.value }))}
              placeholder="e.g. Marathon & Core Prep"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>
          <div className="field">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>START DATE</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 900, height: '42px' }}>
            + Create Plan
          </button>
        </form>
      </div>
    </div>
  );
}
