import React, { useState } from 'react';
import * as db from '../services/db.js';

export default function GymMasterPortal({ currentUser, allUsers, fitnessPlans, workouts, healthTrackers, nutritionPlans, progressReports, sleepLogs, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  
  // Modals state
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // Form states for Plan Assignment
  const [planName, setPlanName] = useState('');
  const [workoutType, setWorkoutType] = useState('Power Hypertrophy Routine');
  const [durationMinutes, setDurationMinutes] = useState(45);

  // Form states for Nutrition Assignment
  const [dietType, setDietType] = useState('High Protein Athlete');
  const [dailyCalories, setDailyCalories] = useState(2500);
  const [proteinG, setProteinG] = useState(160);
  const [carbsG, setCarbsG] = useState(250);
  const [fatsG, setFatsG] = useState(70);

  const [notification, setNotification] = useState('');

  const members = (allUsers || []).filter((u) => u.role !== 'gym_master');
  const analytics = db.getGymAnalytics();

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'All' || m.fitness_level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const handleAssignPlan = (e) => {
    e.preventDefault();
    if (!selectedMember || !planName.trim()) return;

    db.assignPlanToMember(selectedMember.user_id, planName.trim(), workoutType, durationMinutes);
    showToast(`✅ Workout plan "${planName}" assigned to ${selectedMember.name}!`);
    setShowPlanModal(false);
    setPlanName('');
    onRefresh();
  };

  const handleAssignNutrition = (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    db.assignNutritionToMember(selectedMember.user_id, {
      diet_type: dietType,
      daily_calories: dailyCalories,
      protein_g: proteinG,
      carbs_g: carbsG,
      fats_g: fatsG
    });
    showToast(`🥗 Nutrition targets updated for ${selectedMember.name}!`);
    setShowNutritionModal(false);
    onRefresh();
  };

  return (
    <div className="gym-master-portal p-6" style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#ca8a04',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 800,
            zIndex: 9999,
            boxShadow: '0 10px 25px rgba(202, 138, 4, 0.3)'
          }}
        >
          {notification}
        </div>
      )}

      {/* Top Banner Header (Light Theme) */}
      <div
        className="master-banner mb-6"
        style={{
          background: 'linear-gradient(135deg, #fef9c3 0%, #ffffff 100%)',
          border: '1px solid #fef08a',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #ca8a04',
              boxShadow: '0 4px 12px rgba(202, 138, 4, 0.2)'
            }}
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=250&q=80'}
              alt={currentUser.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {currentUser.name}
              </h1>
              <span
                style={{
                  background: '#ca8a04',
                  color: '#ffffff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  textTransform: 'uppercase'
                }}
              >
                👑 GYM MASTER / COACH
              </span>
            </div>
            <p style={{ color: '#475569', margin: '0.25rem 0 0 0', fontSize: '0.9rem', fontWeight: 600 }}>
              {currentUser.gym_name || 'Iron Forge Performance Gym'} • {currentUser.specialty || 'Head Performance Coach'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn"
            onClick={() => {
              if (members.length) {
                setSelectedMember(members[0]);
                setShowPlanModal(true);
              }
            }}
            style={{
              background: '#ca8a04',
              color: '#ffffff',
              fontWeight: 800,
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(202, 138, 4, 0.2)'
            }}
          >
            ➕ Assign New Plan
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div
        className="analytics-grid mb-6"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div
          className="stat-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
            🏋️ ACTIVE GYM MEMBERS
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563eb', marginTop: '0.5rem' }}>
            {analytics.totalMembers}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, marginTop: '0.25rem' }}>
            ● All accounts registered & active
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
            📋 ACTIVE WORKOUT PLANS
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ca8a04', marginTop: '0.5rem' }}>
            {analytics.totalActivePlans}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginTop: '0.25rem' }}>
            {analytics.totalWorkouts} total routines assigned
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
            📈 AVG MEMBER PROGRESS
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', marginTop: '0.5rem' }}>
            {analytics.avgCompletionRate}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginTop: '0.25rem' }}>
            Based on completed report milestones
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
            🔥 TOTAL GYM ACTIVITY
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#dc2626', marginTop: '0.5rem' }}>
            {analytics.totalGymSteps.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginTop: '0.25rem' }}>
            Combined member step activity
          </div>
        </div>
      </div>

      {/* Member Management Roster Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            🏋️ Member Management Roster
          </h2>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.2rem 0 0 0', fontWeight: 500 }}>
            Select any member to assign customized workout plans, update nutrition, or audit vitals.
          </p>
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search member name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.55rem 1rem',
              color: '#0f172a',
              fontSize: '0.85rem',
              width: '240px'
            }}
          />

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.55rem 1rem',
              color: '#0f172a',
              fontSize: '0.85rem'
            }}
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {filteredMembers.map((m) => {
          const userPlans = (fitnessPlans || []).filter((p) => p.user_id === m.user_id);
          const userVitals = (healthTrackers || []).filter((h) => h.user_id === m.user_id).slice(-1)[0];
          const userNutri = (nutritionPlans || []).filter((n) => n.user_id === m.user_id).slice(-1)[0];
          const userReport = (progressReports || []).filter((pr) => pr.user_id === m.user_id).slice(-1)[0];

          return (
            <div
              key={m.user_id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <div>
                {/* Member Profile Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #2563eb'
                    }}
                  >
                    <img
                      src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
                      alt={m.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    {/* BOLD BLACK MEMBER NAME */}
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#000000' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>{m.email}</div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontWeight: 800,
                        marginTop: '0.2rem',
                        display: 'inline-block'
                      }}
                    >
                      {m.fitness_level || 'Member'} • {m.age} yrs • {m.weight} kg
                    </span>
                  </div>
                </div>

                {/* Member Metrics summary */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    fontSize: '0.8rem'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Latest Heart Rate:</span>
                    <div style={{ fontWeight: 900, color: '#dc2626' }}>
                      {userVitals ? `❤️ ${userVitals.heart_rate} BPM` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Daily Steps:</span>
                    <div style={{ fontWeight: 900, color: '#16a34a' }}>
                      {userVitals ? `👟 ${userVitals.steps.toLocaleString()}` : '0 steps'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Active Plans:</span>
                    <div style={{ fontWeight: 900, color: '#ca8a04' }}>
                      {userPlans.length ? `${userPlans.length} Active` : 'None'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Target Calories:</span>
                    <div style={{ fontWeight: 900, color: '#2563eb' }}>
                      {userNutri ? `🥗 ${userNutri.daily_calories} kcal` : 'Unassigned'}
                    </div>
                  </div>
                </div>

                {/* Completion Bar */}
                {userReport && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', marginBottom: '0.25rem', fontWeight: 600 }}>
                      <span>Report Progress Score</span>
                      <span style={{ fontWeight: 900, color: '#16a34a' }}>{userReport.completion_percentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${userReport.completion_percentage}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #16a34a)', borderRadius: '3px' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Master */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSelectedMember(m);
                    setShowPlanModal(true);
                  }}
                  style={{
                    background: '#fef9c3',
                    border: '1px solid #fef08a',
                    color: '#854d0e',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    textAlign: 'center'
                  }}
                >
                  📋 Assign Workout
                </button>
                <button
                  onClick={() => {
                    setSelectedMember(m);
                    setShowNutritionModal(true);
                  }}
                  style={{
                    background: '#dbeafe',
                    border: '1px solid #bfdbfe',
                    color: '#1e40af',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    textAlign: 'center'
                  }}
                >
                  🥗 Assign Nutrition
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PLAN ASSIGNMENT MODAL (LIGHT THEME) */}
      {showPlanModal && selectedMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #ca8a04',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#854d0e', fontSize: '1.25rem', fontWeight: 900 }}>
                📋 ASSIGN WORKOUT PLAN
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                style={{ background: 'none', border: 'none', color: '#0f172a', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', fontWeight: 500 }}>
              Assigning new routine directly to member: <strong style={{ color: '#000000' }}>{selectedMember.name}</strong>
            </p>

            <form onSubmit={handleAssignPlan}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                  PLAN NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Power Shred v2"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                  WORKOUT ROUTINE TYPE
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a'
                  }}
                >
                  <option value="Power Hypertrophy Routine">Power Hypertrophy Routine</option>
                  <option value="HIIT Conditioning Circuit">HIIT Conditioning Circuit</option>
                  <option value="Strength & Mobility Focus">Strength & Mobility Focus</option>
                  <option value="Endurance Cardio Burner">Endurance Cardio Burner</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                  DURATION (MINUTES)
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#ca8a04',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(202, 138, 4, 0.2)'
                }}
              >
                CONFIRM & ASSIGN PLAN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NUTRITION ASSIGNMENT MODAL (LIGHT THEME) */}
      {showNutritionModal && selectedMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #2563eb',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1e40af', fontSize: '1.25rem', fontWeight: 900 }}>
                🥗 ASSIGN NUTRITION TARGETS
              </h3>
              <button
                onClick={() => setShowNutritionModal(false)}
                style={{ background: 'none', border: 'none', color: '#0f172a', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', fontWeight: 500 }}>
              Configuring diet & macro goals for <strong style={{ color: '#000000' }}>{selectedMember.name}</strong>
            </p>

            <form onSubmit={handleAssignNutrition}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                  DIET TYPE
                </label>
                <input
                  type="text"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                    DAILY CALORIES
                  </label>
                  <input
                    type="number"
                    value={dailyCalories}
                    onChange={(e) => setDailyCalories(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                    PROTEIN (G)
                  </label>
                  <input
                    type="number"
                    value={proteinG}
                    onChange={(e) => setProteinG(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                    CARBS (G)
                  </label>
                  <input
                    type="number"
                    value={carbsG}
                    onChange={(e) => setCarbsG(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                    FATS (G)
                  </label>
                  <input
                    type="number"
                    value={fatsG}
                    onChange={(e) => setFatsG(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                }}
              >
                APPLY NUTRITION TARGETS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
