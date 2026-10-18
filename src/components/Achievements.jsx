import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';

export default function Achievements({ currentUser, onRefresh }) {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (currentUser?.user_id) {
      db.checkAndGrantAchievements(currentUser.user_id);
    }
    const achs = db.getAll('achievements');
    const uAchs = db.getAll('userAchievements').filter((ua) => Number(ua.user_id) === Number(currentUser?.user_id));
    setAchievements(achs);
    setUserAchievements(uAchs);
  }, [currentUser]);

  const handleManualCheck = () => {
    if (currentUser?.user_id) {
      db.checkAndGrantAchievements(currentUser.user_id);
      const uAchs = db.getAll('userAchievements').filter((ua) => Number(ua.user_id) === Number(currentUser?.user_id));
      setUserAchievements(uAchs);
      if (onRefresh) onRefresh();
    }
  };

  const getCombinedBadges = () => {
    return achievements.map((ach) => {
      const uAch = userAchievements.find((ua) => Number(ua.achievement_id) === Number(ach.achievement_id));
      return {
        ...ach,
        unlocked: uAch ? !!uAch.unlocked : false,
        progress: uAch ? Number(uAch.progress || 0) : 0,
        date_earned: uAch ? uAch.date_earned : null
      };
    });
  };

  const combined = getCombinedBadges();
  const unlockedCount = combined.filter((b) => b.unlocked).length;
  const totalCount = combined.length;
  const completionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredBadges = combined.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    if (filter !== 'all') return b.category.toLowerCase() === filter.toLowerCase();
    return true;
  });

  const recentBadges = combined.filter((b) => b.unlocked && b.date_earned).sort((a, b) => new Date(b.date_earned) - new Date(a.date_earned)).slice(0, 3);

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase' }}>
            GAMIFICATION & REWARDS
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Achievements & Badges
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Earn badges and unlock milestones as you complete workouts, streaks, and fitness challenges.
          </p>
        </div>

        <button
          className="btn btn-primary text-xs"
          onClick={handleManualCheck}
          style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}
        >
          ⚡ Check & Unlock Badges
        </button>
      </header>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-3 gap-3 mb-6">
        <div className="card text-center p-4" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase' }}>TOTAL BADGES EARNED</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ca8a04', margin: '0.4rem 0' }}>
            🏆 {unlockedCount} / {totalCount}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
            ● {totalCount - unlockedCount} Badges remaining to unlock
          </div>
        </div>

        <div className="card text-center p-4" style={{ borderRadius: '14px', border: '1px solid #fef08a', background: '#fef9c3', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#854d0e', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase' }}>ACHIEVEMENT PROGRESS</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#2563eb', margin: '0.4rem 0' }}>
            {completionPct}%
          </div>
          <div className="battery-track" style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPct}%`, height: '100%', background: '#2563eb', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div className="card p-4" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ⭐ RECENTLY EARNED BADGES
          </div>
          {recentBadges.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>No badges earned recently. Keep training!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {recentBadges.map((b) => (
                <div key={b.achievement_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.85rem' }}>
                    <span>{b.icon}</span>
                    <span>{b.title}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>{b.date_earned}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="card mb-4 p-3 flex-between align-center flex-wrap gap-2" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 900, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginRight: '0.5rem' }}>FILTER:</span>
          {['all', 'unlocked', 'locked', 'workout', 'streak', 'steps'].map((fKey) => (
            <button
              key={fKey}
              onClick={() => setFilter(fKey)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: filter === fKey ? 'none' : '1px solid #cbd5e1',
                background: filter === fKey ? '#2563eb' : '#ffffff',
                color: filter === fKey ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {fKey}
            </button>
          ))}
        </div>
      </div>

      {/* BADGES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.achievement_id}
              className="card p-4"
              style={{
                borderRadius: '16px',
                border: isUnlocked ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                background: isUnlocked ? 'linear-gradient(135deg, #ffffff 0%, #fef9c3 100%)' : '#f8fafc',
                opacity: isUnlocked ? 1 : 0.85,
                boxShadow: isUnlocked ? '0 4px 15px rgba(202,138,4,0.15)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2.5rem', filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.5)' }}>
                    {badge.icon}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      background: isUnlocked ? '#ca8a04' : '#e2e8f0',
                      color: isUnlocked ? '#ffffff' : '#64748b',
                      textTransform: 'uppercase'
                    }}
                  >
                    {isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  {badge.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                  {badge.desc}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem' }}>
                  <span>{isUnlocked ? 'Status' : 'Progress'}</span>
                  <span style={{ color: isUnlocked ? '#16a34a' : '#2563eb' }}>
                    {isUnlocked ? `Earned ${badge.date_earned || 'recently'}` : `${badge.progress}%`}
                  </span>
                </div>

                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${badge.progress}%`,
                      height: '100%',
                      background: isUnlocked ? '#ca8a04' : '#2563eb',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
