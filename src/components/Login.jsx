import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  // Instant Theme Switcher state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sfc_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sfc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  // Form states
  const [role, setRole] = useState('member'); // 'member' | 'gym_master'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(65);
  const [gymName, setGymName] = useState('Iron Forge Gym');
  const [specialty, setSpecialty] = useState('Head Performance Coach');

  const [existingUsers, setExistingUsers] = useState(() => db.getAll('users'));

  useEffect(() => {
    setExistingUsers(db.getAll('users'));
  }, [isRegister]);

  const handleDemoLogin = (user) => {
    setError('');
    onLoginSuccess(user);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim()) {
          setError('Please fill in all required fields.');
          return;
        }
        const newUser = db.registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          age,
          weight,
          gym_name: gymName,
          specialty
        });
        onLoginSuccess(newUser);
      } else {
        if (!email.trim()) {
          setError('Please enter your email or username.');
          return;
        }
        const user = db.authenticateUser(email, password);
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    }
  };
        
  return (
    <div
      className="login-page-homepage"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(360px, 1.1fr) minmax(400px, 0.9fr)',
        background: isDark
          ? 'radial-gradient(circle at 15% 20%, #0d1628 0%, #050811 100%)'
          : '#f8fafc',
        color: isDark ? '#f9fafb' : '#0f172a',
        fontFamily: "'Inter', sans-serif",
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      {/* LEFT HALF: HOMEPAGE HERO SHOWCASE */}
      <div
        className="homepage-left-hero"
        style={{
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
          background: isDark
            ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.04) 0%, rgba(255, 215, 0, 0.02) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
        }}
      >
        <div>
          {/* Brand & Instant Theme Switcher Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  background: isDark ? 'linear-gradient(135deg, #00F0FF 0%, #FFD700 100%)' : '#ca8a04',
                  color: isDark ? '#000' : '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '10px',
                  letterSpacing: '0.05em'
                }}
              >
                SFC//
              </div>
              <div>
                <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.05em', color: isDark ? '#fff' : '#0f172a', display: 'block' }}>
                  SMART FITNESS COMPANION
                </span>
                <span style={{ fontSize: '0.72rem', color: isDark ? '#00F0FF' : '#ca8a04', fontWeight: 800, letterSpacing: '0.1em' }}>
                  MULTI-USER GYM ECOSYSTEM
                </span>
              </div>
            </div>

            {/* INSTANT THEME SWITCHER BUTTON ON FIRST PAGE */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '20px',
                border: isDark ? '2px solid #FFD700' : '2px solid #2563eb',
                background: isDark ? 'rgba(255, 215, 0, 0.15)' : '#dbeafe',
                color: isDark ? '#FFD700' : '#1e40af',
                fontWeight: 900,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isDark ? '0 0 12px rgba(255,215,0,0.3)' : '0 2px 8px rgba(37,99,235,0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{isDark ? '🌙 DARK THEME' : '☀️ LIGHT THEME'}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(CLICK TO TOGGLE)</span>
            </button>
          </div>

          {/* Hero Titles */}
          <h1
            style={{
              fontSize: '2.75rem',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: isDark ? '#ffffff' : '#0f172a'
            }}
          >
            NEXT-GEN FITNESS & <br />
            <span style={{ color: isDark ? '#00F0FF' : '#ca8a04' }}>GYM MASTER PLATFORM</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#475569', lineHeight: 1.6, maxWidth: '560px', marginBottom: '2.5rem' }}>
            A complete dual-role ecosystem for <strong>Gym Masters</strong> & <strong>Gym Members</strong>. Monitor member vitals, assign custom workout routines, track daily macros, and compete on live synced leaderboards.
          </p>

          {/* Core Feature Showcase Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div
              style={{
                background: isDark ? 'rgba(255, 215, 0, 0.06)' : '#fef9c3',
                border: isDark ? '1px solid rgba(255, 215, 0, 0.25)' : '1px solid #fef08a',
                borderRadius: '14px',
                padding: '1.25rem'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>👑</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: isDark ? '#FFD700' : '#854d0e', margin: '0 0 0.3rem 0' }}>
                GYM MASTER PORTAL
              </h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#713f12', margin: 0, lineHeight: 1.4 }}>
                Control center to audit member vitals, create workout plans, and set daily nutrition targets.
              </p>
            </div>

            <div
              style={{
                background: isDark ? 'rgba(0, 240, 255, 0.06)' : '#dbeafe',
                border: isDark ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid #bfdbfe',
                borderRadius: '14px',
                padding: '1.25rem'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🏋️</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: isDark ? '#00F0FF' : '#1e40af', margin: '0 0 0.3rem 0' }}>
                MEMBER DASHBOARD
              </h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#1e3a8a', margin: 0, lineHeight: 1.4 }}>
                Personal fitness hub for live workout tracking, heart rate zones, sleep logs & habit streaks.
              </p>
            </div>

            <div
              style={{
                background: isDark ? 'rgba(57, 255, 20, 0.06)' : '#dcfce7',
                border: isDark ? '1px solid rgba(57, 255, 20, 0.25)' : '1px solid #bbf7d0',
                borderRadius: '14px',
                padding: '1.25rem'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🏆</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: isDark ? '#39FF14' : '#166534', margin: '0 0 0.3rem 0' }}>
                LIVE LEADERBOARD
              </h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#14532d', margin: 0, lineHeight: 1.4 }}>
                Compete with gym members with live profile name & avatar synchronization.
              </p>
            </div>

            <div
              style={{
                background: isDark ? 'rgba(255, 0, 85, 0.06)' : '#f3e8ff',
                border: isDark ? '1px solid rgba(255, 0, 85, 0.25)' : '1px solid #e9d5ff',
                borderRadius: '14px',
                padding: '1.25rem'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🤖</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: isDark ? '#FF0055' : '#6b21a8', margin: '0 0 0.3rem 0' }}>
                AI COACH INTELLIGENCE
              </h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#581c87', margin: 0, lineHeight: 1.4 }}>
                AI insights on sleep recovery scores, optimal cardio zones & supplement stacks.
              </p>
            </div>
          </div>
        </div>

        {/* Footer System Badges */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: isDark ? '#00F0FF' : '#2563eb', fontWeight: 800 }}>● Multi-User Roles Active</span>
          <span style={{ fontSize: '0.75rem', color: isDark ? '#FFD700' : '#ca8a04', fontWeight: 800 }}>● Gym Master Portal Included</span>
          <span style={{ fontSize: '0.75rem', color: isDark ? '#39FF14' : '#16a34a', fontWeight: 800 }}>● 100% Local DB Storage</span>
        </div>
      </div>

      {/* RIGHT HALF: LOGIN & ACCOUNT REGISTRATION PANEL */}
      <div
        className="homepage-right-login"
        style={{
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: isDark ? '#0a0e1a' : '#f8fafc',
          overflowY: 'auto'
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, color: isDark ? '#fff' : '#0f172a' }}>
              SYSTEM ACCESS PORTAL
            </h2>
            <p style={{ fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#475569', marginTop: '0.3rem' }}>
              Sign in to your account or register a new Gym Master / Member profile below.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
                border: isDark ? '1px solid #ef4444' : '1px solid #fecaca',
                color: isDark ? '#ff6b6b' : '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1rem'
              }}
            >
              {error}
            </div>
          )}

          {/* DUAL VISIBLE OPTIONS: BOTH SIGN IN & CREATE ACCOUNT ARE PROMINENTLY VISIBLE */}
          <div
            className="dual-access-options mb-4"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#e2e8f0',
              padding: '0.4rem',
              borderRadius: '14px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
              alignItems: 'stretch'
            }}
          >
            {/* OPTION 1: SIGN IN */}
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              style={{
                padding: '0.85rem 0.5rem',
                borderRadius: '10px',
                border: !isRegister ? (isDark ? '2.5px solid #00F0FF' : '2.5px solid #2563eb') : '1px solid transparent',
                background: !isRegister ? (isDark ? 'rgba(0, 240, 255, 0.2)' : '#ffffff') : 'transparent',
                color: !isRegister ? (isDark ? '#00F0FF' : '#1e40af') : (isDark ? 'rgba(255,255,255,0.7)' : '#475569'),
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: !isRegister ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🔑 SIGN IN
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 700, marginTop: '2px' }}>
                Existing Accounts
              </div>
            </button>

            {/* OPTION 2: CREATE ACCOUNT */}
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              style={{
                padding: '0.85rem 0.5rem',
                borderRadius: '10px',
                border: isRegister ? (isDark ? '2.5px solid #FFD700' : '2.5px solid #ca8a04') : '1px solid transparent',
                background: isRegister ? (isDark ? 'rgba(255, 215, 0, 0.2)' : '#ffffff') : 'transparent',
                color: isRegister ? (isDark ? '#FFD700' : '#854d0e') : (isDark ? 'rgba(255,255,255,0.7)' : '#475569'),
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: isRegister ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ✨ CREATE ACCOUNT
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 700, marginTop: '2px' }}>
                Register New User
              </div>
            </button>
          </div>

          {/* ACTIVE FORM CONTAINER */}
          <form
            onSubmit={handleSubmit}
            className="login-form"
            style={{
              background: isDark ? '#111827' : '#ffffff',
              padding: '1.5rem',
              borderRadius: '16px',
              border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
            }}
          >
            {/* ROLE SELECTOR (VISIBLE DURING REGISTRATION) */}
            {isRegister && (
              <div className="form-group mb-4">
                <label style={{ color: isDark ? '#FFD700' : '#ca8a04', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                  CHOOSE YOUR ACCOUNT ROLE:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setRole('member')}
                    style={{
                      padding: '0.85rem 0.6rem',
                      borderRadius: '12px',
                      border: role === 'member' ? (isDark ? '2.5px solid #00F0FF' : '2.5px solid #2563eb') : '1.5px solid #e2e8f0',
                      background: role === 'member' ? (isDark ? 'rgba(0, 240, 255, 0.2)' : '#dbeafe') : (isDark ? '#1f2937' : '#f8fafc'),
                      color: isDark ? '#fff' : '#000',
                      textAlign: 'center',
                      cursor: 'pointer',
                      minHeight: '68px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: isDark ? '#00F0FF' : '#1e40af', letterSpacing: '0.04em' }}>
                      🏋️ GYM MEMBER
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.8)' : '#1e3a8a', fontWeight: 600, marginTop: '3px' }}>
                      Personal Fitness Tracking
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('gym_master')}
                    style={{
                      padding: '0.85rem 0.6rem',
                      borderRadius: '12px',
                      border: role === 'gym_master' ? (isDark ? '2.5px solid #FFD700' : '2.5px solid #ca8a04') : '1.5px solid #e2e8f0',
                      background: role === 'gym_master' ? (isDark ? 'rgba(255, 215, 0, 0.2)' : '#fef9c3') : (isDark ? '#1f2937' : '#f8fafc'),
                      color: isDark ? '#fff' : '#000',
                      textAlign: 'center',
                      cursor: 'pointer',
                      minHeight: '68px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: isDark ? '#FFD700' : '#854d0e', letterSpacing: '0.04em' }}>
                      👑 GYM MASTER
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.8)' : '#713f12', fontWeight: 600, marginTop: '3px' }}>
                      Coach & Trainer Control
                    </div>
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <div className="form-group mb-3">
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.2rem' }}>FULL NAME</label>
                <input
                  type="text"
                  placeholder={role === 'gym_master' ? 'e.g. Master Coach Vance' : 'e.g. Alex Morgan'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.7rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }}
                />
              </div>
            )}

            <div className="form-group mb-3">
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.2rem' }}>{isRegister ? 'EMAIL ADDRESS' : 'EMAIL OR USERNAME'}</label>
              <input
                type="text"
                placeholder={isRegister ? (role === 'gym_master' ? 'coach@gymmaster.fit' : 'alex@example.com') : 'marcus@gymmaster.fit or ava@companion.fit'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.7rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }}
              />
            </div>

            <div className="form-group mb-3">
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.2rem' }}>PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }}
              />
            </div>

            {isRegister && role === 'member' && (
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.2rem' }}>AGE (YRS)</label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.7rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.2rem' }}>WEIGHT (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.7rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
              </div>
            )}

            {isRegister && role === 'gym_master' && (
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.2rem' }}>GYM / CLUB NAME</label>
                  <input
                    type="text"
                    placeholder="Iron Forge Gym"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.7rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.2rem' }}>SPECIALTY TITLE</label>
                  <input
                    type="text"
                    placeholder="Head Strength Coach"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.7rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontWeight: 900,
                letterSpacing: '0.05em',
                borderRadius: '10px',
                background: isRegister ? (isDark ? '#FFD700' : '#ca8a04') : (isDark ? '#00F0FF' : '#2563eb'),
                color: isRegister ? '#000000' : (isDark ? '#000000' : '#ffffff'),
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                marginTop: '0.5rem'
              }}
            >
              {isRegister ? (role === 'gym_master' ? 'REGISTER GYM MASTER' : 'REGISTER GYM MEMBER') : 'AUTHENTICATE ACCESS'}
            </button>
          </form>

          {/* SAVED USER & DEMO ACCOUNT SELECTION */}
          <div className="demo-section" style={{ marginTop: '1.75rem' }}>
            <div className="demo-divider mb-3" style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: 900, color: isDark ? '#00F0FF' : '#ca8a04', letterSpacing: '0.08em', fontSize: '0.82rem', display: 'block', marginBottom: '0.25rem' }}>
                💾 SAVED ACCOUNTS & REGISTERED USERS ({existingUsers.length})
              </span>
              <span style={{ fontSize: '0.72rem', color: isDark ? 'rgba(57, 255, 20, 0.9)' : '#15803d', fontWeight: 700, letterSpacing: '0.04em' }}>
                ● Created accounts are stored permanently in browser LocalStorage
              </span>
            </div>

            <div className="demo-users-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {existingUsers.map((u) => {
                const isMaster = u.role === 'gym_master';
                const isCustomUser = Number(u.user_id) > 4;
                return (
                  <button
                    key={u.user_id}
                    type="button"
                    className="demo-user-btn"
                    onClick={() => handleDemoLogin(u)}
                    style={{
                      borderColor: isCustomUser 
                        ? (isDark ? '#39FF14' : '#16a34a') 
                        : (isMaster ? (isDark ? '#FFD700' : '#fef08a') : (isDark ? '#00F0FF' : '#bfdbfe')),
                      borderWidth: isCustomUser ? '2px' : '1.5px',
                      borderRadius: '12px',
                      background: isCustomUser
                        ? (isDark ? 'linear-gradient(90deg, rgba(57,255,20,0.12) 0%, rgba(10,14,26,0.6) 100%)' : '#f0fdf4')
                        : (isMaster
                            ? (isDark ? 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(10,14,26,0.6) 100%)' : '#fef9c3')
                            : (isDark ? 'linear-gradient(90deg, rgba(0,240,255,0.1) 0%, rgba(10,14,26,0.6) 100%)' : '#ffffff')),
                      padding: '0.85rem 1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      className="demo-user-avatar"
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        padding: 0,
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: isCustomUser ? '2px solid #16a34a' : (isMaster ? '2px solid #ca8a04' : '2px solid #2563eb')
                      }}
                    >
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        u.name.charAt(0)
                      )}
                    </span>

                    <div className="demo-user-info" style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="demo-user-name" style={{ fontWeight: 900, fontSize: '0.95rem', color: isDark ? '#fff' : '#000000' }}>
                          {u.name}
                        </span>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontWeight: 900,
                            letterSpacing: '0.06em',
                            background: isMaster ? (isDark ? '#FFD700' : '#ca8a04') : (isDark ? '#00F0FF' : '#2563eb'),
                            color: isDark ? '#000' : '#ffffff',
                            textTransform: 'uppercase'
                          }}
                        >
                          {isMaster ? '👑 GYM MASTER' : '🏋️ GYM MEMBER'}
                        </span>

                        {isCustomUser && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.18rem 0.5rem',
                              borderRadius: '6px',
                              fontWeight: 900,
                              letterSpacing: '0.06em',
                              background: isDark ? 'rgba(57, 255, 20, 0.25)' : '#dcfce7',
                              color: isDark ? '#39FF14' : '#15803d',
                              border: isDark ? '1px solid rgba(57, 255, 20, 0.5)' : '1px solid #86efac',
                              textTransform: 'uppercase'
                            }}
                          >
                            ✨ SAVED USER
                          </span>
                        )}
                      </div>

                      <span className="demo-user-meta" style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#475569', fontWeight: 600 }}>
                        {isMaster ? (u.specialty || 'Head Strength Coach') : `${u.fitness_level || 'Member'} • ${u.email}`}
                      </span>
                    </div>

                    <span
                      className="demo-user-arrow"
                      style={{
                        color: isCustomUser
                          ? (isDark ? '#39FF14' : '#16a34a')
                          : (isMaster ? (isDark ? '#FFD700' : '#ca8a04') : (isDark ? '#00F0FF' : '#2563eb')),
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        marginLeft: 'auto'
                      }}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}