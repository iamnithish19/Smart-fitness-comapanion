import React, { useState, useEffect } from 'react';
import { calculatePersonalBmiAnalysis } from '../services/bmiAnalysis.js';
import * as db from '../services/db.js';

export default function Dashboard({
  user,
  fitnessPlans = [],
  workouts = [],
  healthTrackers = [],
  devices = [],
  deviceSyncLogs = [],
  progressReports = [],
  onNavigate,
  onAddNutrition,
  onAddPlan
}) {
  const latestHealth = [...healthTrackers].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))[0];
  const [timeFilter, setTimeFilter] = useState('Weekly');
  const uid = user?.user_id || 1;

  // 24-Hour Daily Challenge State
  const [dailyChallenge, setDailyChallenge] = useState(() => db.getDailyChallenge(uid));
  const [challengeSecsLeft, setChallengeSecsLeft] = useState(0);

  useEffect(() => {
    const dc = db.getDailyChallenge(uid);
    setDailyChallenge(dc);
    setChallengeSecsLeft(Math.max(0, Math.floor((dc.remainingMs || 0) / 1000)));
  }, [uid]);

  useEffect(() => {
    const timer = setInterval(() => {
      setChallengeSecsLeft((prev) => {
        if (prev <= 1) {
          const fresh = db.getDailyChallenge(uid);
          setDailyChallenge(fresh);
          return Math.max(0, Math.floor((fresh.remainingMs || 0) / 1000));
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [uid]);

  const handleQuickCompleteChallenge = () => {
    const completed = db.completeDailyChallenge(uid);
    setDailyChallenge(completed);
  };

  const dcHours = Math.floor(challengeSecsLeft / 3600);
  const dcMins = Math.floor((challengeSecsLeft % 3600) / 60);
  const dcSecs = challengeSecsLeft % 60;
  const dcFormattedTime = `${String(dcHours).padStart(2, '0')}h : ${String(dcMins).padStart(2, '0')}m : ${String(dcSecs).padStart(2, '0')}s`;

  const bmiAnalysis = calculatePersonalBmiAnalysis(user);

  const totalSyncedSecs = deviceSyncLogs.reduce((sum, l) => sum + Number(l.duration_seconds || 0), 0);
  const totalSyncedHrs = (totalSyncedSecs / 3600).toFixed(1);

  const userName = user?.name || 'Tracy F. Cortez';
  const userAge = user?.age || 26;
  const userWeight = user?.weight || 52;
  const userHeight = user?.height ? (user.height / 30.48).toFixed(1) : '5.6';

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      {/* 1. TOP HEADER BANNER */}
      <header className="page-header flex flex-between align-center wrap gap-4 mb-4">
        <div>
          <div className="page-eyebrow" style={{ color: 'var(--yellow-hover)', fontWeight: 800 }}>DASHBOARD OVERVIEW</div>
          <h1 className="page-title" style={{ fontSize: 28, margin: 0 }}>
            Good Morning, {userName.split(' ')[0]}
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-sub)' }}>
            Let's do some workout today...
          </p>
        </div>

        <div className="flex align-center gap-3 wrap">
          <div style={{ background: 'var(--panel)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)' }}>Timeframe:</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            >
              <option value="Weekly">Weekly ▾</option>
              <option value="Monthly">Monthly ▾</option>
              <option value="Yearly">Yearly ▾</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={() => onNavigate && onNavigate('workout-live')}>
            <span>▶</span> Start Live Workout
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate && onNavigate('devices')}>
            <span>⌚</span> Watch Sync
          </button>
        </div>
      </header>

      {/* 2. TOP 4 VITALS METRIC CARDS */}
      <div className="grid grid-4 gap-4 mb-6">
        {/* Card 1: Watch Connected Workout Duration */}
        <div
          className="card"
          onClick={() => onNavigate && onNavigate('devices')}
          style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: '1.5px solid rgba(37, 99, 235, 0.3)', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, var(--panel) 100%)' }}
        >
          <div>
            <div className="stat-num" style={{ fontSize: 24, fontWeight: 900, color: 'var(--blue, #2563eb)' }}>
              {totalSyncedHrs} <span style={{ fontSize: 13, fontWeight: 800 }}>hrs</span>
            </div>
            <div className="stat-lbl" style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="ble-live-dot" /> Watch Connected Workout
            </div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ⌚
          </div>
        </div>

        {/* Card 2: Kilo Calories */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-num" style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)' }}>2.54</div>
            <div className="stat-lbl" style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>Kilo Calories</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🔥
          </div>
        </div>

        {/* Card 3: Beats Per Minute */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-num" style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)' }}>
              {latestHealth?.heart_rate || 124}
            </div>
            <div className="stat-lbl" style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>Beats per minute</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ❤️
          </div>
        </div>

        {/* Card 4: Hours Sleeping */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-num" style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)' }}>13</div>
            <div className="stat-lbl" style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>Hours Sleeping</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🌙
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID (LEFT 2/3 MAIN + RIGHT 1/3 SIDEBAR) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>

        {/* LEFT COLUMN (MAIN WORKOUT ACTIVITY & METRICS) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* 24-HOUR DAILY CHALLENGE HERO WIDGET */}
          {dailyChallenge && (
            <div
              className="card"
              style={{
                padding: '20px 24px',
                borderRadius: '18px',
                background: dailyChallenge.status === 'completed'
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.04))'
                  : 'linear-gradient(135deg, rgba(202, 138, 4, 0.12), rgba(234, 179, 8, 0.03))',
                border: dailyChallenge.status === 'completed' ? '1.5px solid #86efac' : '1.5px solid rgba(202, 138, 4, 0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      background: '#ca8a04',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    ⚡ 24H DAILY CHALLENGE
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f97316' }}>
                    🔥 {dailyChallenge.current_streak} Day Streak
                  </span>
                </div>

                <div
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: dailyChallenge.status === 'completed' ? '#16a34a' : 'var(--text)'
                  }}
                >
                  <span>{dailyChallenge.status === 'completed' ? '✓ Next Task in:' : '⏳ Expires in:'}</span>
                  <span style={{ color: dailyChallenge.status === 'completed' ? '#16a34a' : '#ca8a04', fontWeight: 900 }}>
                    {dcFormattedTime}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      background: dailyChallenge.status === 'completed' ? '#dcfce7' : '#fef3c7',
                      color: dailyChallenge.status === 'completed' ? '#166534' : '#b45309',
                      fontSize: '1.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {dailyChallenge.exercise?.icon || '🏋️'}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                      {dailyChallenge.exercise?.name || 'Daily Exercise'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginTop: '2px', fontWeight: 700 }}>
                      🎯 {dailyChallenge.exercise?.targetDescription} • ~{dailyChallenge.exercise?.calorieBurn} kcal • +{dailyChallenge.exercise?.xp} XP
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {dailyChallenge.status === 'completed' ? (
                    <div
                      style={{
                        background: '#dcfce7',
                        color: '#166534',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>✓</span> Task Completed
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleQuickCompleteChallenge}
                      style={{
                        background: '#ca8a04',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        padding: '8px 16px',
                        borderRadius: '10px'
                      }}
                    >
                      ⚡ Mark Done (+{dailyChallenge.exercise?.xp || 150} XP)
                    </button>
                  )}

                  <button
                    className="btn btn-secondary"
                    onClick={() => onNavigate && onNavigate('daily-challenge')}
                    style={{
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '8px 14px',
                      borderRadius: '10px'
                    }}
                  >
                    View Mission ➜
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WORKOUT ACTIVITY & PROGRESS ROW */}
          <div className="grid grid-2 gap-4">
            {/* WORKOUT ACTIVITY SMOOTH WAVE GRAPH CARD */}
            <div className="card flex-col flex-between">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="section-title" style={{ fontSize: 16 }}>Workout Activity</h3>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 700 }}>
                  <span style={{ color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text)' }} /> Online
                  </span>
                  <span style={{ color: '#84cc16', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#84cc16' }} /> Offline
                  </span>
                </div>
              </div>

              {/* SMOOTH SVG WAVE GRAPH */}
              <div style={{ width: '100%', position: 'relative', paddingTop: 10 }}>
                <svg viewBox="0 0 500 160" style={{ width: '100%', height: 140, overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#84cc16" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#84cc16" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="30" x2="500" y2="30" stroke="var(--line)" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="var(--line)" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="var(--line)" strokeDasharray="3 3" opacity="0.6" />

                  <path d="M 0 90 Q 75 20 150 90 T 300 90 T 450 30 L 500 70 L 500 140 L 0 140 Z" fill="url(#limeGradient)" />
                  <path d="M 0 90 Q 75 20 150 90 T 300 90 T 450 30 L 500 70" fill="none" stroke="#84cc16" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 0 60 Q 80 130 160 50 T 320 80 T 500 20" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

                  <circle cx="235" cy="55" r="7" fill="#84cc16" stroke="#ffffff" strokeWidth="3" />
                  <g transform="translate(205, 10)">
                    <rect x="0" y="0" width="60" height="24" rx="12" fill="#84cc16" />
                    <text x="30" y="16" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="900">57 kg</text>
                  </g>
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', borderTop: '1px solid var(--line)', paddingTop: 8, marginTop: 4 }}>
                  <span>Sun</span><span>Mon</span><span>Tue</span><span style={{ color: 'var(--text)', fontWeight: 900 }}>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
              </div>
            </div>

            {/* PROGRESS CARD (NO HUMAN PHOTO) */}
            <div className="card flex-col flex-between">
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 12 }}>Progress</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800 }}>
                    <span style={{ color: 'var(--text)', fontSize: 14 }}>56 kms</span>
                    <span style={{ color: 'var(--text-sub)', fontSize: 11 }}>Weekly distance</span>
                  </div>
                  <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--panel-alt)', marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', background: '#84cc16', borderRadius: 4 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800 }}>
                    <span style={{ color: 'var(--text)', fontSize: 14 }}>236 kms</span>
                    <span style={{ color: 'var(--text-sub)', fontSize: 11 }}>Total distance covered</span>
                  </div>
                  <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--panel-alt)', marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: '#06b6d4', borderRadius: 4 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800 }}>
                    <span style={{ color: 'var(--blue, #2563eb)', fontSize: 14 }}>{totalSyncedHrs} hrs</span>
                    <span style={{ color: 'var(--text-sub)', fontSize: 11 }}>Bluetooth Watch Connected Workout</span>
                  </div>
                  <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--panel-alt)', marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.round((Number(totalSyncedHrs) / 15) * 100))}%`, height: '100%', background: '#2563eb', borderRadius: 4 }} />
                  </div>
                </div>
              </div>

              {/* Performance Boost Graphic */}
              <div style={{ background: 'rgba(132, 204, 22, 0.1)', border: '1px solid rgba(132, 204, 22, 0.25)', padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>Weekly Target Achieved</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#84cc16' }}>+18% performance boost</div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD CARD */}
          <div className="card flex-col flex-between">
            <h3 className="section-title" style={{ fontSize: 15 }}>Payment</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700 }}>Renew by</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text)' }}>22 December 2026</div>
                </div>
                <button className="badge badge-accent" style={{ background: '#84cc16', color: '#0f172a', padding: '4px 10px', borderRadius: 20, cursor: 'pointer', border: 'none' }}>
                  Pay Now
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700 }}>Default Payment Method</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text)' }}>Credit Card 0018</div>
                </div>
                <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px', fontSize: 11 }}>
                  Change
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700 }}>Available Plans</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)' }}>Monthly | Yearly | Other</div>
                </div>
                <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px', fontSize: 11 }}>
                  View
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (USER PROFILE & TRENDING WORKOUTS) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* USER PROFILE SUMMARY CARD (NO STOCK HUMAN PHOTO) */}
          <div className="card text-center" style={{ padding: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #84cc16, #10b981)', color: '#0f172a', fontWeight: 900, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              {userName.charAt(0)}
            </div>

            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>{userName}</h2>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2, fontWeight: 700 }}>{userAge} Years</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Height</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)' }}>{userHeight} inch</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Weight</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)' }}>{userWeight} kg</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Gender</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)' }}>Female</div>
              </div>
            </div>
          </div>

          {/* VIDEO ACTIVITY PROGRESS BAR */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 className="section-title" style={{ fontSize: 15 }}>Video Activity</h3>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#84cc16' }}>78%</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 8, fontWeight: 700 }}>Total hours watched</div>
            <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--panel-alt)', overflow: 'hidden' }}>
              <div style={{ width: '78%', height: '100%', background: '#84cc16', borderRadius: 4 }} />
            </div>
          </div>

          {/* MOST TRENDING WORKOUTS */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ fontSize: 15 }}>Most Trending</h3>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => onNavigate && onNavigate('recipes')}
                style={{ padding: '2px 8px', fontSize: 11 }}
              >
                View All
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ height: 90, borderRadius: 10, background: 'linear-gradient(135deg, #1e293b, #334155)', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 14, color: '#84cc16' }}>▶</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', alignSelf: 'flex-end', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>12M</span>
              </div>
              <div style={{ height: 90, borderRadius: 10, background: 'linear-gradient(135deg, #1e293b, #475569)', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 14, color: '#84cc16' }}>▶</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', alignSelf: 'flex-end', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>55M</span>
              </div>
              <div style={{ height: 90, borderRadius: 10, background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 14, color: '#84cc16' }}>▶</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', alignSelf: 'flex-end', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>36M</span>
              </div>
            </div>
          </div>

        </div>

\      </div>
    </div>
  );
}
