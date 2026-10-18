import React, { useState } from 'react';
import * as db from '../services/db.js';
import RevenueDashboard from './RevenueDashboard.jsx';
import BulkAssignPlans from './BulkAssignPlans.jsx';
import WorkoutTemplates from './WorkoutTemplates.jsx';
import MessagingSystem from './MessagingSystem.jsx';
import Challenges from './Challenges.jsx';

export default function GymMasterPortal({
  currentUser,
  allUsers = [],
  fitnessPlans = [],
  workouts = [],
  exercises = [],
  healthTrackers = [],
  nutritionPlans = [],
  progressReports = [],
  sleepLogs = [],
  devices = [],
  deviceSyncLogs = [],
  onRefresh,
  activeTab: externalTab,
  onNavigate
}) {
  const [activeTab, setActiveTab] = useState(externalTab || 'dashboard');
  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'gym_owner';
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterProgress, setFilterProgress] = useState('All');

  // Modals state
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewingProgressMember, setViewingProgressMember] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // Form states for Single Exercise Assignment
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState('Chest / Upper Body');
  const [exerciseSets, setExerciseSets] = useState(3);
  const [exerciseReps, setExerciseReps] = useState('12');
  const [exerciseTargetWorkout, setExerciseTargetWorkout] = useState('');

  // Form states for Plan Assignment
  const [planName, setPlanName] = useState('');
  const [workoutType, setWorkoutType] = useState('Power Hypertrophy Routine');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [customExerciseLines, setCustomExerciseLines] = useState('Barbell Bench Press, 4, 10\nIncline Dumbbell Flyes, 3, 12\nTricep Rope Pushdowns, 3, 15');

  // Form states for Nutrition Assignment
  const [dietType, setDietType] = useState('High Protein Athlete');
  const [dailyCalories, setDailyCalories] = useState(2500);
  const [proteinG, setProteinG] = useState(160);
  const [carbsG, setCarbsG] = useState(250);
  const [fatsG, setFatsG] = useState(70);

  const [notification, setNotification] = useState('');

  const members = (allUsers || []).filter((u) => u.role !== 'gym_master');
  const trainers = (allUsers || []).filter((u) => u.role === 'trainer');
  const analytics = db.getGymAnalytics ? db.getGymAnalytics() : {
    totalMembers: members.length,
    totalActivePlans: fitnessPlans.length,
    totalWorkouts: workouts.length,
    avgCompletionRate: 82,
    totalGymSteps: 125000
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'All' || m.fitness_level === filterLevel;

    const userReport = (progressReports || []).filter((pr) => pr.user_id === m.user_id).slice(-1)[0];
    const comp = userReport ? userReport.completion_percentage : 50;
    let matchesProgress = true;
    if (filterProgress === 'high') matchesProgress = comp >= 75;
    if (filterProgress === 'medium') matchesProgress = comp >= 40 && comp < 75;
    if (filterProgress === 'low') matchesProgress = comp < 40;

    return matchesSearch && matchesLevel && matchesProgress;
  });

  // Handle assigning an exercise
  const handleAssignExercise = (e) => {
    e.preventDefault();
    if (!selectedMember || !exerciseName.trim()) return;

    db.assignExerciseToMember(selectedMember.user_id, {
      name: exerciseName.trim(),
      sets: exerciseSets,
      reps: exerciseReps,
      workoutType: exerciseTargetWorkout || `${exerciseCategory} Routine`
    });

    showToast(`💪 Exercise "${exerciseName}" assigned to ${selectedMember.name}!`);
    setShowExerciseModal(false);
    setExerciseName('');
    if (onRefresh) onRefresh();
  };

  // Handle assigning a full workout plan
  const handleAssignPlan = (e) => {
    e.preventDefault();
    if (!selectedMember || !planName.trim()) return;

    const parsedExercises = customExerciseLines
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => {
        const parts = l.split(',');
        return {
          name: parts[0]?.trim() || 'Exercise',
          sets: Number(parts[1]?.trim()) || 3,
          reps: parts[2]?.trim() || '10'
        };
      });

    db.assignPlanToMember(
      selectedMember.user_id,
      planName.trim(),
      workoutType,
      durationMinutes,
      parsedExercises
    );

    showToast(`✅ Workout plan "${planName}" assigned to ${selectedMember.name}!`);
    setShowPlanModal(false);
    setPlanName('');
    if (onRefresh) onRefresh();
  };

  // Handle nutrition assignment
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
    if (onRefresh) onRefresh();
  };

  const allTabItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: '📊' },
    { id: 'members', label: 'Member Progress & Roster', icon: '👥', count: members.length },
    { id: 'trainers', label: 'Trainers', icon: '🧑‍🏫', count: trainers.length },
    ...(isOwner ? [{ id: 'revenue', label: 'Financials & Revenue', icon: '📈' }] : []),
    { id: 'templates', label: 'Workout Templates', icon: '📋' },
    { id: 'bulk-assign', label: 'Bulk Assign Routine', icon: '⚡' },
    { id: 'challenges', label: 'Gym Challenges', icon: '⚔️' },
    { id: 'messages', label: 'Member Messages', icon: '💬' }
  ];
  const tabItems = allTabItems;

  const quickExercises = [
    { name: 'Barbell Bench Press', cat: 'Chest', sets: 4, reps: 10 },
    { name: 'Incline Dumbbell Press', cat: 'Chest', sets: 3, reps: 12 },
    { name: 'Barbell Back Squats', cat: 'Legs', sets: 4, reps: 8 },
    { name: 'Romanian Deadlifts', cat: 'Legs/Glutes', sets: 3, reps: 10 },
    { name: 'Lat Pulldowns', cat: 'Back', sets: 4, reps: 10 },
    { name: 'Overhead Shoulder Press', cat: 'Shoulders', sets: 3, reps: 12 },
    { name: 'Hanging Leg Raises', cat: 'Core', sets: 3, reps: 15 },
    { name: 'Dumbbell Bicep Curls', cat: 'Arms', sets: 3, reps: 12 }
  ];

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '14px',
            zIndex: 99999,
            boxShadow: '0 12px 28px rgba(202, 138, 4, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span>✨</span>
          <span>{notification}</span>
        </div>
      )}

      {/* 1. TOP GYM MASTER HERO BANNER */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fefce8 100%)',
          border: '1.5px solid #fef08a',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(234, 179, 8, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(234, 179, 8, 0.3)',
              border: '2px solid #ffffff'
            }}
          >
            {(currentUser?.name || 'M').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                {currentUser?.name || 'Coach Marcus Vance'}
              </h1>
              <span
                style={{
                  background: '#eab308',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '0.05em'
                }}
              >
                👑 GYM MASTER PORTAL
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              {currentUser?.gym_name || 'Iron Forge Elite Gym'} • {currentUser?.specialty || 'Head Strength & Conditioning Coach'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={() => {
              if (members.length) {
                setSelectedMember(members[0]);
                setShowExerciseModal(true);
              }
            }}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
              padding: '0 18px',
              height: '42px',
              borderRadius: '10px'
            }}
          >
            💪 + Assign Exercise
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (members.length) {
                setSelectedMember(members[0]);
                setShowPlanModal(true);
              }
            }}
            style={{
              padding: '0 18px',
              height: '42px',
              borderRadius: '10px'
            }}
          >
            📋 + Assign Full Routine
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGATION BAR */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        {tabItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: isActive ? '1px solid #ca8a04' : '1px solid #e2e8f0',
                background: isActive ? '#eab308' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 3px 10px rgba(234, 179, 8, 0.3)' : '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 900
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: FINANCIALS — Owner Only */}
      {activeTab === 'revenue' && isOwner && <RevenueDashboard user={currentUser} />}

      {/* TAB CONTENT: TEMPLATES */}
      {activeTab === 'templates' && <WorkoutTemplates currentUser={currentUser} onRefresh={onRefresh} />}

      {/* TAB CONTENT: BULK ASSIGN */}
      {activeTab === 'bulk-assign' && <BulkAssignPlans currentUser={currentUser} onRefresh={onRefresh} />}

      {/* TAB CONTENT: MESSAGES */}
      {activeTab === 'messages' && <MessagingSystem user={currentUser} currentUser={currentUser} onRefresh={onRefresh} />}

      {/* TAB CONTENT: CHALLENGES */}
      {activeTab === 'challenges' && <Challenges user={currentUser} currentUser={currentUser} onRefresh={onRefresh} />}

      {/* TAB CONTENT: TRAINERS */}
      {activeTab === 'trainers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Gym Coaching Staff ({trainers.length})</h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Assigned coaches managing member workout programs</p>
            </div>
          </div>
          <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {trainers.map((trainer) => (
              <div key={trainer.user_id || trainer.id} className="card p-4" style={{ borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>
                    {(trainer.name || 'T').charAt(0)}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '15px' }}>{trainer.name}</strong>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>{trainer.specialty || 'Fitness Trainer'}</span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>Email: <strong style={{ color: '#0f172a' }}>{trainer.email}</strong></div>
                  <div style={{ marginTop: '4px', color: '#16a34a', fontWeight: 800 }}>● Active Certified Trainer</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DASHBOARD & MEMBER PROGRESS (DEFAULT) */}
      {(activeTab === 'dashboard' || activeTab === 'members') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 3. FOUR KPI STAT CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Stat 1 */}
            <div
              className="card"
              style={{
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TOTAL GYM MEMBERS
                </span>
                <span style={{ fontSize: '20px' }}>👥</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#2563eb', margin: '6px 0 2px' }}>
                {analytics.totalMembers}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                ✓ 100% Active Profiles
              </div>
            </div>

            {/* Stat 2 */}
            <div
              className="card"
              style={{
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #fef08a',
                background: '#fefce8',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ACTIVE ROUTINES
                </span>
                <span style={{ fontSize: '20px' }}>🏋️</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#ca8a04', margin: '6px 0 2px' }}>
                {analytics.totalActivePlans}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#854d0e' }}>
                {analytics.totalWorkouts || workouts.length} configured plans
              </div>
            </div>

            {/* Stat 3 */}
            <div
              className="card"
              style={{
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AVG PROGRESS SCORE
                </span>
                <span style={{ fontSize: '20px' }}>📊</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a', margin: '6px 0 2px' }}>
                {analytics.avgCompletionRate}%
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                Member target completion rate
              </div>
            </div>

            {/* Stat 4 */}
            <div
              className="card"
              style={{
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TOTAL GYM STEPS
                </span>
                <span style={{ fontSize: '20px' }}>🔥</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#e11d48', margin: '6px 0 2px' }}>
                {analytics.totalGymSteps.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                Smart tracker synced total
              </div>
            </div>
          </div>

          {/* 4. MEMBER PROGRESS & ROSTER DIRECTORY */}
          <div
            className="card"
            style={{
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            {/* Header & Filter Controls Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                paddingBottom: '18px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '20px'
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                  Member Progress & Direct Routine Management
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Track individual progress, vital readings, active routines, and assign new exercises directly.
                </p>
              </div>

              {/* Search & Filter Inputs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search member name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      width: '240px',
                      fontWeight: 700
                    }}
                  />
                </div>

                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Fitness Tiers</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <select
                  value={filterProgress}
                  onChange={(e) => setFilterProgress(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Progress Rates</option>
                  <option value="high">High Progress (≥ 75%)</option>
                  <option value="medium">Moderate (40 - 74%)</option>
                  <option value="low">Needs Attention (&lt; 40%)</option>
                </select>
              </div>
            </div>

            {/* MEMBER CARDS GRID */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}
            >
              {filteredMembers.map((m) => {
                const userPlans = (fitnessPlans || []).filter((p) => p.user_id === m.user_id);
                const userPlanIds = userPlans.map((p) => p.plan_id);
                const userWorkouts = (workouts || []).filter((w) => userPlanIds.includes(w.plan_id));
                const workoutIds = userWorkouts.map((w) => w.workout_id);
                const userExercises = (exercises || []).filter((e) => workoutIds.includes(e.workout_id));
                const userVitals = (healthTrackers || []).filter((h) => h.user_id === m.user_id).slice(-1)[0];
                const userNutri = (nutritionPlans || []).filter((n) => n.user_id === m.user_id).slice(-1)[0];
                const userReport = (progressReports || []).filter((pr) => pr.user_id === m.user_id).slice(-1)[0];
                const compPercentage = userReport ? userReport.completion_percentage : 75;

                return (
                  <div
                    key={m.user_id}
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Top User Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 3px 8px rgba(37, 99, 235, 0.25)'
                            }}
                          >
                            {(m.name || 'M').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>
                              {m.name}
                            </strong>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{m.email}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 800
                          }}
                        >
                          {m.fitness_level || 'Member'}
                        </span>
                      </div>

                      {/* Bio Stats Tag */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#ffffff',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#475569'
                        }}
                      >
                        <span>🎂 {m.age || 26} yrs</span>
                        <span>•</span>
                        <span>⚖️ {m.weight || 68} kg</span>
                        <span>•</span>
                        <span>📏 {m.height || 175} cm</span>
                      </div>

                      {/* Vital Metrics Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          background: '#ffffff',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontSize: '11px'
                        }}
                      >
                        <div>
                          <span style={{ color: '#64748b', fontWeight: 700, display: 'block' }}>Heart Rate</span>
                          <strong style={{ color: '#e11d48', fontSize: '13px', display: 'block', marginTop: '2px' }}>
                            ❤️ {userVitals ? `${userVitals.heart_rate} BPM` : '74 BPM'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontWeight: 700, display: 'block' }}>Daily Steps</span>
                          <strong style={{ color: '#16a34a', fontSize: '13px', display: 'block', marginTop: '2px' }}>
                            👟 {userVitals ? `${userVitals.steps.toLocaleString()}` : '6,200'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontWeight: 700, display: 'block' }}>Active Plans</span>
                          <strong style={{ color: '#ca8a04', fontSize: '13px', display: 'block', marginTop: '2px' }}>
                            🏋️ {userPlans.length} ({userExercises.length} Ex.)
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontWeight: 700, display: 'block' }}>Calorie Target</span>
                          <strong style={{ color: '#2563eb', fontSize: '13px', display: 'block', marginTop: '2px' }}>
                            🥗 {userNutri ? `${userNutri.daily_calories} kcal` : '2,200 kcal'}
                          </strong>
                        </div>
                      </div>

                      {/* Progress Score Bar */}
                      <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
                          <span style={{ color: '#64748b' }}>Routine Completion:</span>
                          <span style={{ color: compPercentage >= 75 ? '#16a34a' : '#ca8a04' }}>{compPercentage}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${compPercentage}%`,
                              background: compPercentage >= 75 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #eab308, #ca8a04)',
                              borderRadius: '6px'
                            }}
                          />
                        </div>
                      </div>

                      {/* Current Assigned Exercises Preview */}
                      <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>Assigned Exercises:</span>
                          <span style={{ fontSize: '10px', fontWeight: 900, color: '#2563eb' }}>{userExercises.length} Total</span>
                        </div>

                        {userExercises.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '72px', overflowY: 'auto' }}>
                            {userExercises.slice(0, 3).map((ex, idx) => (
                              <span
                                key={ex.exercise_id || idx}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#1e293b',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                {ex.name} ({ex.sets}×{ex.reps})
                              </span>
                            ))}
                            {userExercises.length > 3 && (
                              <span style={{ background: '#fef9c3', color: '#854d0e', padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 900 }}>
                                +{userExercises.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No custom exercises assigned yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setShowExerciseModal(true);
                          }}
                          style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '9px 10px',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
                          }}
                        >
                          💪 + Exercise
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setShowPlanModal(true);
                          }}
                          style={{
                            background: '#eab308',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '9px 10px',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(234, 179, 8, 0.2)'
                          }}
                        >
                          📋 Full Plan
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setShowNutritionModal(true);
                          }}
                          className="btn-secondary"
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          🥗 Set Diet
                        </button>
                        <button
                          onClick={() => setViewingProgressMember(m)}
                          className="btn-secondary"
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: '#ca8a04'
                          }}
                        >
                          👁️ View Progress
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMembers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <p style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 6px' }}>No members found matching filter criteria.</p>
                <p style={{ fontSize: '13px', margin: 0 }}>Try clearing the search term or switching the fitness tier filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: DIRECT EXERCISE ASSIGNMENT */}
      {showExerciseModal && selectedMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 99999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #3b82f6',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb', margin: 0 }}>
                  ASSIGN NEW EXERCISE
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                  Assigning directly to: <strong style={{ color: '#0f172a' }}>{selectedMember.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowExerciseModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            {/* Quick Pick Presets */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                ⚡ QUICK PRESET EXERCISES
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickExercises.map((qe, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setExerciseName(qe.name);
                      setExerciseSets(qe.sets);
                      setExerciseReps(String(qe.reps));
                      setExerciseCategory(qe.cat);
                    }}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: '#1e293b'
                    }}
                  >
                    + {qe.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAssignExercise} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                  EXERCISE NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incline Dumbbell Press"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    SETS
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={exerciseSets}
                    onChange={(e) => setExerciseSets(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    REPS / TIME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12 or 45s"
                    value={exerciseReps}
                    onChange={(e) => setExerciseReps(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                  ROUTINE FOCUS (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Upper Body Hypertrophy"
                  value={exerciseTargetWorkout}
                  onChange={(e) => setExerciseTargetWorkout(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowExerciseModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, height: '42px', borderRadius: '8px', fontWeight: 800 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ flex: 2, background: '#2563eb', color: '#fff', height: '42px', borderRadius: '8px', fontWeight: 900 }}
                >
                  ✓ Assign Exercise Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL WORKOUT ROUTINE ASSIGNMENT */}
      {showPlanModal && selectedMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 99999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #eab308',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#ca8a04', margin: 0 }}>
                  ASSIGN FULL WORKOUT ROUTINE
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                  Assigning to: <strong style={{ color: '#0f172a' }}>{selectedMember.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignPlan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                  PLAN / ROUTINE NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Shred & Power v2"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    ROUTINE TYPE
                  </label>
                  <select
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700 }}
                  >
                    <option value="Power Hypertrophy Routine">Power Hypertrophy Routine</option>
                    <option value="HIIT Conditioning Circuit">HIIT Conditioning Circuit</option>
                    <option value="Strength & Mobility Focus">Strength & Mobility Focus</option>
                    <option value="Endurance Cardio Burner">Endurance Cardio Burner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    DURATION (MINS)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="120"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a' }}>
                    EXERCISES (NAME, SETS, REPS)
                  </label>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>1 per line</span>
                </div>
                <textarea
                  rows={4}
                  value={customExerciseLines}
                  onChange={(e) => setCustomExerciseLines(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, height: '42px', borderRadius: '8px', fontWeight: 800 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, height: '42px', borderRadius: '8px', fontWeight: 900 }}
                >
                  ✓ Confirm & Assign Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NUTRITION TARGETS ASSIGNMENT */}
      {showNutritionModal && selectedMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 99999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #16a34a',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a', margin: 0 }}>
                  ASSIGN NUTRITION TARGETS
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                  Target for: <strong style={{ color: '#0f172a' }}>{selectedMember.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowNutritionModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignNutrition} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                  DIET TYPE
                </label>
                <input
                  type="text"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    DAILY CALORIES
                  </label>
                  <input
                    type="number"
                    value={dailyCalories}
                    onChange={(e) => setDailyCalories(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    PROTEIN (G)
                  </label>
                  <input
                    type="number"
                    value={proteinG}
                    onChange={(e) => setProteinG(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    CARBS (G)
                  </label>
                  <input
                    type="number"
                    value={carbsG}
                    onChange={(e) => setCarbsG(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    FATS (G)
                  </label>
                  <input
                    type="number"
                    value={fatsG}
                    onChange={(e) => setFatsG(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNutritionModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, height: '40px', borderRadius: '8px', fontWeight: 800 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, background: '#16a34a', color: '#fff', border: 'none', height: '40px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}
                >
                  ✓ Apply Diet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAILED MEMBER PROGRESS DRILLDOWN */}
      {viewingProgressMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 99999
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#eab308', color: '#fff', fontSize: '22px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(viewingProgressMember.name || 'M').charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                    {viewingProgressMember.name}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    {viewingProgressMember.email} • {viewingProgressMember.fitness_level || 'Member'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingProgressMember(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Weight</span>
                <strong style={{ fontSize: '15px' }}>{viewingProgressMember.weight || 68} kg</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Age</span>
                <strong style={{ fontSize: '15px' }}>{viewingProgressMember.age || 26} yrs</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Heart Rate</span>
                <strong style={{ fontSize: '15px', color: '#e11d48' }}>
                  {((healthTrackers || []).filter((h) => h.user_id === viewingProgressMember.user_id).slice(-1)[0]?.heart_rate || 72)} BPM
                </strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Daily Steps</span>
                <strong style={{ fontSize: '15px', color: '#16a34a' }}>
                  {((healthTrackers || []).filter((h) => h.user_id === viewingProgressMember.user_id).slice(-1)[0]?.steps || 5000).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Plans List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>
                Assigned Workout Plans & Exercises
              </h4>

              {(() => {
                const uPlans = (fitnessPlans || []).filter((p) => p.user_id === viewingProgressMember.user_id);
                if (uPlans.length === 0) {
                  return (
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                      No workout plans assigned yet.
                    </div>
                  );
                }

                return uPlans.map((plan) => {
                  const pWorkouts = (workouts || []).filter((w) => w.plan_id === plan.plan_id);
                  const pWorkoutIds = pWorkouts.map((w) => w.workout_id);
                  const pExercises = (exercises || []).filter((e) => pWorkoutIds.includes(e.workout_id));

                  return (
                    <div key={plan.plan_id} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{plan.plan_name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Assigned on {plan.start_date}</span>
                        </div>
                        <span style={{ background: '#fef9c3', color: '#854d0e', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                          {pWorkouts[0]?.type || 'Active Routine'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {pExercises.map((ex, i) => (
                          <div key={ex.exercise_id || i} style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{ex.name}</span>
                            <span style={{ fontWeight: 900, color: '#2563eb' }}>{ex.sets}×{ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <button
                onClick={() => {
                  setSelectedMember(viewingProgressMember);
                  setViewingProgressMember(null);
                  setShowExerciseModal(true);
                }}
                className="btn"
                style={{ background: '#2563eb', color: '#fff', padding: '0 16px', height: '38px', borderRadius: '8px', fontSize: '13px' }}
              >
                + Assign Exercise to {viewingProgressMember.name}
              </button>
              <button
                onClick={() => setViewingProgressMember(null)}
                className="btn-secondary"
                style={{ padding: '0 16px', height: '38px', borderRadius: '8px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
