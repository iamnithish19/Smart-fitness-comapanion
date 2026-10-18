import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';

export default function DailyChallenge({ currentUser, onRefresh, onNavigate }) {
  const uid = currentUser?.user_id || 1;
  const [challengeState, setChallengeState] = useState(() => db.getDailyChallenge(uid));
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [actualReps, setActualReps] = useState('');
  const [notes, setNotes] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [exerciseStopwatchSecs, setExerciseStopwatchSecs] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Sync state on user change or load
  const reloadChallenge = () => {
    const fresh = db.getDailyChallenge(uid);
    setChallengeState(fresh);
    const secs = Math.max(0, Math.floor((fresh.remainingMs || 0) / 1000));
    setRemainingSeconds(secs);
    if (!actualReps && fresh.exercise?.targetValue) {
      setActualReps(fresh.exercise.targetValue);
    }
  };

  useEffect(() => {
    reloadChallenge();
  }, [uid]);

  // Live 24-Hour Countdown Clock Ticking Every 1000ms
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Timer hit 0! Expiration occurred, trigger rollover
          const refreshed = db.getDailyChallenge(uid);
          setChallengeState(refreshed);
          showToast('⚡ 24-hour cycle expired! A new exercise task has been assigned for the next 24 hours.');
          if (onRefresh) onRefresh();
          return Math.max(0, Math.floor((refreshed.remainingMs || 0) / 1000));
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [uid, onRefresh]);

  // Guided Exercise Stopwatch
  useEffect(() => {
    let swInterval;
    if (timerRunning) {
      swInterval = setInterval(() => {
        setExerciseStopwatchSecs((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(swInterval);
  }, [timerRunning]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const handleComplete = (e) => {
    if (e) e.preventDefault();
    if (challengeState.status === 'completed') return;

    const completed = db.completeDailyChallenge(uid, {
      actual_reps: Number(actualReps) || challengeState.exercise.targetValue,
      notes: notes.trim()
    });

    setChallengeState(completed);
    setShowCelebration(true);
    showToast(`🎉 Daily Challenge Complete! You earned +${challengeState.exercise.xp || 150} XP and kept your streak alive!`);
    if (onRefresh) onRefresh();
    setTimeout(() => setShowCelebration(false), 5000);
  };

  const handleFastForward24Hours = () => {
    const nextChallenge = db.forceExpireAndAssignNext(uid);
    setChallengeState(nextChallenge);
    setRemainingSeconds(Math.max(0, Math.floor((nextChallenge.remainingMs || 0) / 1000)));
    setActualReps(nextChallenge.exercise?.targetValue || '');
    setExerciseStopwatchSecs(0);
    setTimerRunning(false);
    showToast(`⏩ Simulated 24h expiration! New exercise assigned: "${nextChallenge.exercise.name}" for the next 24 hours.`);
    if (onRefresh) onRefresh();
  };

  const handleResetChallenge = () => {
    const reset = db.resetDailyChallenge(uid);
    setChallengeState(reset);
    setRemainingSeconds(Math.max(0, Math.floor((reset.remainingMs || 0) / 1000)));
    setActualReps(reset.exercise?.targetValue || '');
    setExerciseStopwatchSecs(0);
    setTimerRunning(false);
    showToast('🔄 Daily challenge reset to fresh Day 1 cycle.');
    if (onRefresh) onRefresh();
  };

  // Format time remaining
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;

  // Stopwatch formatted
  const swMinutes = Math.floor(exerciseStopwatchSecs / 60);
  const swSecs = exerciseStopwatchSecs % 60;
  const stopwatchFormatted = `${String(swMinutes).padStart(2, '0')}:${String(swSecs).padStart(2, '0')}`;

  const ex = challengeState.exercise || db.DAILY_CHALLENGE_EXERCISES[0];
  const isCompleted = challengeState.status === 'completed';

  // 24h Progress % (elapsed out of 24h)
  const total24hSecs = 24 * 3600;
  const elapsedSecs = Math.max(0, total24hSecs - remainingSeconds);
  const progress24hPct = Math.min(100, Math.max(0, Math.round((elapsedSecs / total24hSecs) * 100)));

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: '#ca8a04',
            color: '#ffffff',
            padding: '1rem 1.6rem',
            borderRadius: '14px',
            fontWeight: 800,
            zIndex: 9999,
            boxShadow: '0 12px 30px rgba(202, 138, 4, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* CELEBRATION MODAL BANNER */}
      {showCelebration && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setShowCelebration(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px',
              width: '90%',
              padding: '32px',
              textAlign: 'center',
              borderRadius: '24px',
              border: '2px solid #ca8a04',
              background: 'linear-gradient(145deg, #1e293b, #0f172a)',
              color: '#ffffff',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🏆</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px', color: '#fef08a' }}>
              DAILY CHALLENGE CRUSHED!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 20px' }}>
              You completed today's exercise: <strong>{ex.name}</strong>.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '24px'
              }}
            >
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>STREAK</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f97316' }}>
                  🔥 {challengeState.current_streak} Days
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>XP EARNED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#eab308' }}>
                  ⭐ +{ex.xp || 150} XP
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '20px' }}>
              Your next 24-hour exercise task will automatically arrive when the timer finishes:
              <br />
              <strong style={{ color: '#38bdf8', fontSize: '1.1rem' }}>{timeFormatted}</strong>
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowCelebration(false)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 900 }}
            >
              Awesome, Keep Going! 🚀
            </button>
          </div>
        </div>
      )}

      {/* HEADER WITH 24H COUNTDOWN HUD */}
      <header className="page-header flex flex-between align-center wrap gap-4 mb-5">
        <div>
          <div className="page-eyebrow" style={{ color: '#ca8a04', fontWeight: 900, letterSpacing: '0.08em' }}>
            DAILY MISSION & STREAK PROTOCOL
          </div>
          <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 900, margin: '4px 0' }}>
            24-Hour Daily Exercise Challenge
          </h1>
          <p className="page-subtitle" style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-sub)' }}>
            One single, high-impact exercise assigned every 24 hours. Complete it before the timer expires to sustain your streak!
          </p>
        </div>

        {/* 24-HOUR COUNTDOWN HUD PILL */}
        <div
          style={{
            background: isCompleted ? 'rgba(34, 197, 94, 0.12)' : 'rgba(202, 138, 4, 0.12)',
            border: isCompleted ? '2px solid rgba(34, 197, 94, 0.4)' : '2px solid rgba(202, 138, 4, 0.4)',
            padding: '12px 20px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: isCompleted ? '#22c55e' : '#ca8a04',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}
          >
            {isCompleted ? '✓' : '⏱️'}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: isCompleted ? '#16a34a' : '#ca8a04' }}>
              {isCompleted ? 'Next Exercise Unlocks In' : '24-Hour Timer Remaining'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text)' }}>
              {timeFormatted}
            </div>
          </div>
        </div>
      </header>

      {/* 4 STREAK & XP METRICS TILES */}
      <div className="grid grid-4 gap-4 mb-5">
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f97316' }}>
                🔥 {challengeState.current_streak}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 700 }}>Current Streak</div>
            </div>
            <div style={{ fontSize: '1.8rem', opacity: 0.85 }}>⚡</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#eab308' }}>
                🏆 {challengeState.longest_streak}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 700 }}>Best Streak</div>
            </div>
            <div style={{ fontSize: '1.8rem', opacity: 0.85 }}>🥇</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#3b82f6' }}>
                🎯 {challengeState.total_completed}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 700 }}>Tasks Crushed</div>
            </div>
            <div style={{ fontSize: '1.8rem', opacity: 0.85 }}>💪</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>
                ⭐ {(challengeState.total_completed || 0) * 150}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 700 }}>Challenge XP</div>
            </div>
            <div style={{ fontSize: '1.8rem', opacity: 0.85 }}>✨</div>
          </div>
        </div>
      </div>

      {/* 24-HOUR LIFECYCLE PROGRESS BAR */}
      <div
        className="card p-4 mb-5"
        style={{
          borderRadius: '16px',
          background: 'var(--panel)',
          border: '1px solid var(--line)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--text)' }}>
              24-Hour Cycle Progress
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: isCompleted ? '#dcfce7' : '#fef9c3',
                color: isCompleted ? '#166534' : '#854d0e',
                textTransform: 'uppercase'
              }}
            >
              {isCompleted ? '✓ Completed' : 'Active 24h Window'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 700 }}>
            {progress24hPct}% of 24h window elapsed • Expires: {new Date(challengeState.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div style={{ width: '100%', height: '10px', background: 'var(--panel-alt)', borderRadius: '6px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress24hPct}%`,
              height: '100%',
              background: isCompleted ? 'linear-gradient(90deg, #10b981, #22c55e)' : 'linear-gradient(90deg, #ca8a04, #eab308)',
              borderRadius: '6px',
              transition: 'width 0.5s ease'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '6px' }}>
          <span>Assigned: {new Date(challengeState.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>New Exercise Assigned: At 24h Expiry ({timeFormatted})</span>
        </div>
      </div>

      {/* MAIN LAYOUT: EXERCISE HERO (LEFT 2/3) + TIMER & ACTION (RIGHT 1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '24px', alignItems: 'start' }}>
        {/* LEFT COLUMN: TODAY'S ASSIGNED EXERCISE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            className="card"
            style={{
              padding: '28px',
              borderRadius: '20px',
              border: isCompleted ? '2px solid #86efac' : '2px solid rgba(202, 138, 4, 0.4)',
              background: 'var(--panel)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
            }}
          >
            {/* EXERCISE HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      textTransform: 'uppercase'
                    }}
                  >
                    {ex.badge || ex.category}
                  </span>
                  <span
                    style={{
                      background: 'var(--panel-alt)',
                      color: 'var(--text-sub)',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}
                  >
                    Difficulty: {ex.difficulty}
                  </span>
                  <span
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#2563eb',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 900
                    }}
                  >
                    ID: {ex.id}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{ex.icon || '🏋️'}</span>
                  <span>{ex.name}</span>
                </h2>
              </div>

              {isCompleted ? (
                <div
                  style={{
                    background: '#dcfce7',
                    border: '1.5px solid #86efac',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    color: '#166534',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>✓</span> COMPLETED FOR TODAY
                </div>
              ) : (
                <div
                  style={{
                    background: '#fef9c3',
                    border: '1.5px solid #fef08a',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    color: '#854d0e',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ca8a04' }} />
                  ASSIGNED TODAY
                </div>
              )}
            </div>

            {/* KEY METRICS SPECIFICATION GRID */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                padding: '16px',
                borderRadius: '14px',
                background: 'var(--panel-alt)',
                marginBottom: '24px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Target Volume
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)', marginTop: '2px' }}>
                  {ex.targetDescription}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Estimated Burn
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f97316', marginTop: '2px' }}>
                  ~{ex.calorieBurn} kcal
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>
                  XP Bounty
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#eab308', marginTop: '2px' }}>
                  +{ex.xp || 150} XP
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Target Duration
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                  {ex.durationMins} Mins
                </div>
              </div>
            </div>

            {/* MUSCLE TARGETS & EQUIPMENT */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Anatomical Focus & Gear:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.8rem', padding: '4px 12px', borderRadius: '8px' }}>
                  🎯 Primary: {ex.primaryMuscle}
                </span>
                <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.8rem', padding: '4px 12px', borderRadius: '8px' }}>
                  ⚡ Secondary: {ex.secondaryMuscles}
                </span>
                <span style={{ background: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: '0.8rem', padding: '4px 12px', borderRadius: '8px' }}>
                  🛠️ Gear: {ex.equipment}
                </span>
              </div>
            </div>

            {/* STEP-BY-STEP INSTRUCTIONS */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', marginBottom: '12px' }}>
                📋 Execution Protocol & Form Steps:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(ex.instructions || []).map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      background: 'var(--panel-alt)',
                      padding: '10px 14px',
                      borderRadius: '10px'
                    }}
                  >
                    <span
                      style={{
                        background: '#ca8a04',
                        color: '#ffffff',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.45', fontWeight: 600 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMER & INTERACTIVE LOGGING */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* STOPWATCH / INTERVAL TIMER */}
          <div
            className="card"
            style={{
              padding: '24px',
              borderRadius: '20px',
              textAlign: 'center',
              background: 'var(--panel)',
              border: '1px solid var(--line)'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
              Challenge Session Timer
            </div>
            <div
              style={{
                fontSize: '2.8rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                color: timerRunning ? '#10b981' : 'var(--text)',
                margin: '8px 0 16px'
              }}
            >
              {stopwatchFormatted}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                className={`btn ${timerRunning ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setTimerRunning(!timerRunning)}
                style={{ minWidth: '120px', fontWeight: 900, borderRadius: '10px', padding: '10px' }}
              >
                {timerRunning ? '⏸️ Pause' : '▶ Start Timer'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setTimerRunning(false);
                  setExerciseStopwatchSecs(0);
                }}
                style={{ borderRadius: '10px', padding: '10px 16px' }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* LOGGING CARD */}
          <div
            className="card"
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'var(--panel)',
              border: isCompleted ? '2px solid #86efac' : '1px solid var(--line)'
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 16px', color: 'var(--text)' }}>
              {isCompleted ? '✅ Task Logged & Completed' : '📝 Log Exercise Completion'}
            </h3>

            {isCompleted ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a' }}>
                  Awesome Job Today!
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: '6px 0 16px' }}>
                  Completed at {new Date(challengeState.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with {challengeState.actual_reps || ex.targetValue} {ex.targetUnit}.
                </p>

                <div
                  style={{
                    background: 'var(--panel-alt)',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    color: 'var(--text)',
                    fontWeight: 700,
                    marginBottom: '16px'
                  }}
                >
                  ⏳ Next 24-hour exercise assigns in:
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: '#ca8a04', marginTop: '4px' }}>
                    {timeFormatted}
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={handleFastForward24Hours}
                  style={{ width: '100%', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem' }}
                >
                  ⏩ Simulate Next 24h Challenge Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleComplete}>
                <div className="form-group mb-3">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
                    Reps / Sets Completed ({ex.targetUnit}):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={actualReps}
                    onChange={(e) => setActualReps(e.target.value)}
                    placeholder={String(ex.targetValue)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', fontWeight: 800 }}
                  />
                  <small style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                    Target: {ex.targetDescription}
                  </small>
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
                    Personal Workout Notes (Optional):
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Completed all sets unbroken with great form!"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--line)', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    background: '#ca8a04',
                    border: 'none',
                    boxShadow: '0 8px 20px rgba(202, 138, 4, 0.3)'
                  }}
                >
                  ⚡ Mark Completed & Claim +{ex.xp || 150} XP
                </button>
              </form>
            )}
          </div>

          {/* DEVELOPER / DEMO 24H TESTING CONTROLS */}
          <div
            className="card"
            style={{
              padding: '18px 20px',
              borderRadius: '16px',
              background: 'var(--panel)',
              border: '1.5px dashed var(--line)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🧪</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text)' }}>
                24-Hour Cycle Testing & Simulator
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px', lineHeight: 1.4 }}>
              Test the 24-hour expiration mechanism instantly without waiting 24 real hours. This expires the current window, archives progress, and rotates to the next 24-hour exercise task.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={handleFastForward24Hours}
                style={{ width: '100%', fontSize: '0.8rem', fontWeight: 800, padding: '8px 12px', borderRadius: '8px' }}
              >
                ⏩ Fast-Forward 24 Hours (Assign Next Exercise)
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleResetChallenge}
                style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700, padding: '6px 12px', borderRadius: '8px', opacity: 0.8 }}
              >
                🔄 Reset to Initial Day 1 State
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHALLENGE HISTORY LOG */}
      <div className="mt-5">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📜</span>
          <span>Recent 24-Hour Challenges History</span>
        </h3>

        {(!challengeState.history || challengeState.history.length === 0) ? (
          <div className="card p-5 text-center" style={{ borderRadius: '16px', color: 'var(--text-sub)', fontWeight: 600 }}>
            No past challenges logged yet. Finish today's challenge to begin building your record!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {challengeState.history.map((h, i) => (
              <div
                key={h.history_id || i}
                className="card"
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: h.status === 'completed' ? '#dcfce7' : '#fee2e2',
                      color: h.status === 'completed' ? '#166534' : '#991b1b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1rem'
                    }}
                  >
                    {h.status === 'completed' ? '✓' : '✕'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: '0.95rem' }}>
                      {h.exercise_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      Date: {h.date} • Category: {h.category}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      background: h.status === 'completed' ? '#dcfce7' : '#fee2e2',
                      color: h.status === 'completed' ? '#166534' : '#991b1b',
                      textTransform: 'uppercase'
                    }}
                  >
                    {h.status === 'completed' ? `Crushed (+${h.xp_earned} XP)` : 'Expired'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
