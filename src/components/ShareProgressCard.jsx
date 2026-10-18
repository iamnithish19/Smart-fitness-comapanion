import React, { useState, useRef } from 'react';
import * as db from '../services/db.js';

export default function ShareProgressCard({ currentUser }) {
  const [template, setTemplate] = useState('weekly'); // 'weekly' | 'monthly' | 'workout' | 'achievement' | 'streak' | 'pb'
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [bgStyle, setBgStyle] = useState('dark'); // 'dark' | 'gradient' | 'light'
  const [toast, setToast] = useState('');
  const cardRef = useRef(null);

  const workouts = db.getAll('workouts');
  const healthTrackers = db.getAll('healthTrackers').filter((h) => Number(h.user_id) === Number(currentUser?.user_id));
  const userAchs = db.getAll('userAchievements').filter((ua) => Number(ua.user_id) === Number(currentUser?.user_id) && ua.unlocked);
  const achievements = db.getAll('achievements');
  const habits = db.getAll('habits').filter((h) => Number(h.user_id) === Number(currentUser?.user_id));

  const totalSteps = healthTrackers.reduce((sum, h) => sum + Number(h.steps || 0), 0) || 10230;
  const totalWorkouts = workouts.length || 12;
  const maxStreak = Math.max(...habits.map((h) => Number(h.streak || 0)), 14);
  const latestBadge = userAchs.length > 0
    ? achievements.find((a) => Number(a.achievement_id) === Number(userAchs[userAchs.length - 1].achievement_id))
    : achievements[0];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleDownloadCard = () => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    // Use HTML5 Canvas API to render the DOM element visually into an image PNG export
    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 400;
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Render Gradient / Dark Background
    if (bgStyle === 'dark') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
    } else if (bgStyle === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(0, 0, width, height);

    // Accent Border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Header Title
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('SMART FITNESS COMPANION // PROGRESS CARD', 30, 45);

    // Template Name
    ctx.fillStyle = bgStyle === 'light' ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    const titleText =
      template === 'weekly' ? 'Weekly Fitness Progress' :
      template === 'monthly' ? 'Monthly Athletic Overview' :
      template === 'workout' ? 'Workout Summary' :
      template === 'achievement' ? 'Achievement Unlocked!' :
      template === 'streak' ? 'Streak Milestone Reached' : 'Personal Best Broken!';
    ctx.fillText(titleText, 30, 80);

    // User Info
    ctx.fillStyle = bgStyle === 'light' ? '#475569' : '#cbd5e1';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Athlete: ${currentUser?.name || 'Ava Thompson'} • ${new Date().toLocaleDateString()}`, 30, 110);

    // Divider Line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 125);
    ctx.lineTo(width - 30, 125);
    ctx.stroke();

    // Stats Grid Draw
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${totalSteps.toLocaleString()}`, 30, 185);
    ctx.fillStyle = bgStyle === 'light' ? '#64748b' : '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('TOTAL STEPS COMPLETED', 30, 205);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${totalWorkouts}`, 240, 185);
    ctx.fillStyle = bgStyle === 'light' ? '#64748b' : '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('WORKOUT SESSIONS', 240, 205);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${maxStreak} Days`, 430, 185);
    ctx.fillStyle = bgStyle === 'light' ? '#64748b' : '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('ACTIVE STREAK', 430, 205);

    // Badge Row
    ctx.fillStyle = bgStyle === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.08)';
    ctx.fillRect(30, 240, width - 60, 90);

    ctx.fillStyle = bgStyle === 'light' ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`${latestBadge?.icon || '🏆'} ${latestBadge?.title || 'Consistency Champion'}`, 50, 275);
    ctx.fillStyle = bgStyle === 'light' ? '#475569' : '#cbd5e1';
    ctx.font = '13px sans-serif';
    ctx.fillText(latestBadge?.desc || 'Unlocked top consistency tier on Smart Fitness Companion.', 50, 300);

    // Export Canvas Image to Download Link
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Fitness_Card_${currentUser?.name || 'Athlete'}_${template}.png`;
    link.href = dataUrl;
    link.click();

    showToast('📥 Shareable Progress Card downloaded as PNG!');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Fitness Progress',
          text: `Check out my fitness progress on Smart Fitness Companion! Total Steps: ${totalSteps.toLocaleString()} | Streak: ${maxStreak} days 🔥`,
          url: window.location.href
        });
        showToast('🚀 Shared successfully via Web Share API!');
      } catch (err) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(`Check out my fitness progress on Smart Fitness Companion! Total Steps: ${totalSteps.toLocaleString()} | Streak: ${maxStreak} days 🔥`);
      showToast('📋 Progress summary copied to clipboard!');
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      {toast && (
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
          {toast}
        </div>
      )}

      <header className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase' }}>
            SOCIAL SHARING
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Shareable Fitness Progress Cards
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Generate high-resolution fitness achievement cards to share on Instagram, WhatsApp, or Twitter.
          </p>
        </div>
      </header>

      {/* 2-COLUMN DESIGNER & LIVE PREVIEW */}
      <div className="grid grid-2 gap-6">
        {/* COLUMN 1: CARD CUSTOMIZER */}
        <div className="card p-5" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1.25rem 0' }}>
            🎨 Card Templates & Controls
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                SELECT TEMPLATE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'weekly', label: '📊 Weekly Progress' },
                  { id: 'monthly', label: '📅 Monthly Summary' },
                  { id: 'workout', label: '🏋️ Workout Summary' },
                  { id: 'achievement', label: '🏆 Achievement Unlocked' },
                  { id: 'streak', label: '🔥 Streak Milestone' },
                  { id: 'pb', label: '🥇 Personal Best' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: template === t.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: template === t.id ? '#dbeafe' : '#f8fafc',
                      color: template === t.id ? '#1e40af' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                BACKGROUND THEME
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { id: 'dark', label: '🌙 Dark Navy' },
                  { id: 'gradient', label: '🔮 Deep Indigo' },
                  { id: 'light', label: '☀️ Pure Light' }
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBgStyle(bg.id)}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: bgStyle === bg.id ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                      background: bgStyle === bg.id ? '#fef9c3' : '#ffffff',
                      color: bgStyle === bg.id ? '#854d0e' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                ACCENT COLOR
              </label>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {['#2563eb', '#ca8a04', '#16a34a', '#dc2626', '#9333ea'].map((c) => (
                  <div
                    key={c}
                    onClick={() => setAccentColor(c)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: c,
                      cursor: 'pointer',
                      border: accentColor === c ? '3px solid #0f172a' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1rem' }}>
              <button
                onClick={handleDownloadCard}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                }}
              >
                📥 Download Image (PNG Export)
              </button>

              <button
                onClick={handleNativeShare}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: '#ca8a04',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(202,138,4,0.25)'
                }}
              >
                🚀 Share Card (Web Share API)
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: LIVE CARD PREVIEW DISPLAY */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
            🖼️ Live Card Preview
          </h2>

          <div
            ref={cardRef}
            style={{
              borderRadius: '20px',
              padding: '2rem',
              background:
                bgStyle === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' :
                bgStyle === 'gradient' ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' : '#ffffff',
              color: bgStyle === 'light' ? '#0f172a' : '#ffffff',
              border: `3.5px solid ${accentColor}`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              minHeight: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ background: accentColor, color: '#fff', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                    SFC//
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em', color: accentColor }}>
                    SMART FITNESS COMPANION
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: bgStyle === 'light' ? '#64748b' : '#94a3b8' }}>
                  {new Date().toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: accentColor, color: '#ffffff', fontWeight: 900, fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2.5px solid ${accentColor}`, textTransform: 'uppercase', flexShrink: 0 }}>
                  {(currentUser?.name || 'Athlete').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900 }}>
                    {template === 'weekly' && 'Weekly Fitness Progress'}
                    {template === 'monthly' && 'Monthly Performance Summary'}
                    {template === 'workout' && 'Workout Session Completed'}
                    {template === 'achievement' && 'Achievement Unlocked!'}
                    {template === 'streak' && 'Streak Milestone Hit!'}
                    {template === 'pb' && 'Personal Best Smashed!'}
                  </h3>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: bgStyle === 'light' ? '#475569' : '#cbd5e1' }}>
                    Athlete: {currentUser?.name || 'Ava Thompson'}
                  </span>
                </div>
              </div>

              {/* STATS TRIPLE GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ background: bgStyle === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem 0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: bgStyle === 'light' ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>TOTAL STEPS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: accentColor, margin: '0.2rem 0' }}>
                    {totalSteps.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: bgStyle === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem 0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: bgStyle === 'light' ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>WORKOUTS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: accentColor, margin: '0.2rem 0' }}>
                    {totalWorkouts}
                  </div>
                </div>

                <div style={{ background: bgStyle === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem 0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: bgStyle === 'light' ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>STREAK</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: accentColor, margin: '0.2rem 0' }}>
                    {maxStreak}d 🔥
                  </div>
                </div>
              </div>

              {/* BADGE HIGHLIGHT */}
              <div style={{ background: bgStyle === 'light' ? '#fef9c3' : 'rgba(255,215,0,0.1)', border: '1px solid rgba(202,138,4,0.3)', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '2rem' }}>{latestBadge?.icon || '🏆'}</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem', fontWeight: 900, color: bgStyle === 'light' ? '#854d0e' : '#fef08a' }}>
                    {latestBadge?.title || 'Consistency Champion'}
                  </strong>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: bgStyle === 'light' ? '#713f12' : '#cbd5e1' }}>
                    {latestBadge?.desc || 'Unlocked top consistency tier on Smart Fitness Companion.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
