import React, { useState, useEffect } from 'react';
import { Sun, Moon, Mail, KeyRound, ShieldCheck, Sparkles, Lock, ArrowRight, UserCheck } from 'lucide-react';
import * as db from '../services/db.js';
import { sendOtp } from '../services/otpService.js';
import OtpVerification from './OtpVerification.jsx';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [authMethod, setAuthMethod] = useState('password'); // 'password' (primary) | 'otp' (secondary)
  const [regMethod, setRegMethod] = useState('password'); // 'password' (primary) | 'otp' (secondary)
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'otp'
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('login');
  const [otpMetadata, setOtpMetadata] = useState({});
  const [isSendingOtp, setIsSendingOtp] = useState(false);
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
  const [role, setRole] = useState('member'); // 'member' | 'owner' | 'dietician' | 'consultant' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(65);
  const [gymName, setGymName] = useState('Iron Forge Performance Gym');
  const [specialty, setSpecialty] = useState('Head Performance Coach');

  const [existingUsers, setExistingUsers] = useState(() => db.getAll('users'));

  useEffect(() => {
    setExistingUsers(db.getAll('users'));
  }, [isRegister]);

  const handleDemoLogin = (user) => {
    setError('');
    onLoginSuccess(user);
  };

  const existingOwner = existingUsers.find(
    (x) => x.role === 'owner' || x.role === 'gym_owner'
  );

  const handleRoleChange = (newRole) => {
    if (newRole === 'owner') {
      const currentOwner = (db.getGymOwner ? db.getGymOwner() : null) || existingUsers.find((x) => x.role === 'owner' || x.role === 'gym_owner');
      if (currentOwner) {
        setError(`⚠️ The Gym Owner seat is currently claimed by "${currentOwner.name || currentOwner.email}". There can only be one Gym Owner at a time. If that account is removed, the Gym Owner seat will become available for anyone.`);
        return;
      }
      setRole('owner');
      setSpecialty('Gym Owner & Executive Director');
      setGymName('Iron Forge Performance Gym');
      setError('');
    } else if (newRole === 'dietician') {
      setRole('dietician');
      setSpecialty('Lead Sports Dietician & Nutritionist');
      setGymName('Iron Forge Performance Gym');
      setError('');
    } else if (newRole === 'consultant') {
      setRole('consultant');
      setSpecialty('Fitness & Biomechanics Consultant');
      setGymName('Iron Forge Performance Gym');
      setError('');
    } else if (newRole === 'admin') {
      setRole('admin');
      setSpecialty('Gym Master & Operations Director');
      setGymName('Iron Forge Performance Gym');
      setError('');
    } else {
      setRole('member');
      setError('');
    }
  };

  const handleInitiateOtp = (targetEmail, purpose = 'login', metadata = {}) => {
    const cleanEmail = (targetEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (purpose === 'register' && metadata.role === 'owner') {
      const currentOwner = (db.getGymOwner ? db.getGymOwner() : null) || existingUsers.find((x) => x.role === 'owner' || x.role === 'gym_owner');
      if (currentOwner) {
        setError(`⚠️ The Gym Owner seat is already claimed by "${currentOwner.name || currentOwner.email}". Only one person can be Gym Owner at a time.`);
        return;
      }
    }

    setError('');
    setIsSendingOtp(true);
    try {
      sendOtp(cleanEmail, purpose, metadata);
      setOtpTargetEmail(cleanEmail);
      setOtpPurpose(purpose);
      setOtpMetadata(metadata);
      setViewMode('otp');
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSuccess = ({ email: verifiedEmail, purpose, metadata }) => {
    try {
      if (purpose === 'register') {
        const newUser = db.registerUser({
          name: (metadata.name || '').trim(),
          email: verifiedEmail,
          password: metadata.password || '',
          role: metadata.role || 'member',
          age: metadata.age || 25,
          weight: metadata.weight || 65,
          gym_name: metadata.gymName || 'Iron Forge Gym',
          specialty: metadata.specialty
        });
        onLoginSuccess(newUser);
      } else {
        const user = db.authenticateWithVerifiedEmail(verifiedEmail, metadata);
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      setViewMode('form');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim()) {
          setError('Please fill in all required fields (Name and Email).');
          return;
        }

        if (regMethod === 'otp') {
          // Secondary Choice: Verify via OTP code
          handleInitiateOtp(email, 'register', {
            name: name.trim(),
            password,
            role,
            age,
            weight,
            gymName,
            specialty
          });
        } else {
          // Primary Choice: Instant Direct Registration with Password (No OTP needed!)
          if (!password) {
            setError('Please enter a password for your new account.');
            return;
          }
          const newUser = db.registerUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: role || 'member',
            age: Number(age) || 25,
            weight: Number(weight) || 65,
            gym_name: gymName,
            specialty
          });
          onLoginSuccess(newUser);
        }
      } else {
        if (!email.trim()) {
          setError('Please enter your email address or username.');
          return;
        }

        if (authMethod === 'otp') {
          // Secondary Choice: OTP Login
          handleInitiateOtp(email, 'login', {
            name: email.split('@')[0],
            role: 'member'
          });
        } else {
          // Primary Choice: Direct Password Login (Auto-provisions if new email)
          const user = db.authenticateUser(email, password);
          onLoginSuccess(user);
        }
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
        gridTemplateColumns: '1fr 1fr',
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
          padding: '3rem 2.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(160deg, #090e1a 0%, #040711 100%)'
            : 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        {/* Smart Gym Connected Facility Background Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/gym_facility_bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            opacity: isDark ? 0.95 : 0.92,
            filter: isDark ? 'contrast(1.08) brightness(0.92)' : 'contrast(1.02) brightness(1.0)',
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Subtle Edge Vignette: Ensures crisp contrast for branding and headings */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(180deg, rgba(9, 14, 26, 0.65) 0%, rgba(9, 14, 26, 0.15) 35%, rgba(4, 7, 17, 0.8) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 35%, rgba(241, 245, 249, 0.75) 100%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* TOP: Brand on Left & Theme Switcher on Right */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.35rem',
              background: isDark ? 'rgba(10, 16, 30, 0.85)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              padding: '1.1rem 1.85rem',
              borderRadius: '20px',
              border: isDark ? '1.5px solid rgba(0, 240, 255, 0.3)' : '1.5px solid rgba(202, 138, 4, 0.3)',
              boxShadow: isDark ? '0 8px 30px rgba(0, 0, 0, 0.45)' : '0 4px 18px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div
              style={{
                background: isDark ? 'linear-gradient(135deg, #00F0FF 0%, #FFD700 100%)' : '#ca8a04',
                color: isDark ? '#000' : '#ffffff',
                fontWeight: 900,
                fontSize: '2.1rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '12px',
                letterSpacing: '0.05em',
                boxShadow: isDark ? '0 4px 15px rgba(0, 240, 255, 0.3)' : '0 2px 8px rgba(202, 138, 4, 0.25)'
              }}
            >
              SFC//
            </div>
            <div>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '2.05rem',
                  letterSpacing: '0.04em',
                  color: isDark ? '#ffffff' : '#0f172a',
                  display: 'block',
                  lineHeight: 1.2
                }}
              >
                SMART FITNESS COMPANION
              </span>
              <span
                style={{
                  fontSize: '1.2rem',
                  color: isDark ? '#00F0FF' : '#ca8a04',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  display: 'block',
                  marginTop: '0.25rem'
                }}
              >
                MULTI-USER GYM ECOSYSTEM
              </span>
            </div>
          </div>

          {/* Simple Theme Toggle Button with Sun/Moon Icon */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #cbd5e1',
              background: isDark ? '#1e293b' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            {isDark ? (
              <Sun size={26} color="#fbbf24" strokeWidth={2.4} />
            ) : (
              <Moon size={26} color="#475569" strokeWidth={2.4} />
            )}
          </button>
        </div>

        {/* BOTTOM: Hero Titles + Footer System Badges (Keeps the entire man in the center fully visible) */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            maxWidth: '640px'
          }}
        >
          {/* Hero Titles in Frosted Glass Container */}
          <div
            style={{
              display: 'inline-block',
              alignSelf: 'flex-start',
              background: isDark ? 'rgba(7, 11, 22, 0.8)' : 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              padding: '1.8rem 2.4rem',
              borderRadius: '24px',
              border: isDark ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(202, 138, 4, 0.3)',
              boxShadow: isDark ? '0 14px 40px rgba(0, 0, 0, 0.55)' : '0 8px 26px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h1
              style={{
                fontSize: '3.4rem',
                fontWeight: 900,
                lineHeight: 1.15,
                margin: 0,
                color: isDark ? '#ffffff' : '#0f172a',
                textShadow: isDark ? '0 2px 14px rgba(0, 0, 0, 0.8)' : '0 1px 8px rgba(255, 255, 255, 0.9)'
              }}
            >
              NEXT-GEN FITNESS & <br />
              <span style={{ color: isDark ? '#00F0FF' : '#ca8a04' }}>MULTI-ROLE ECOSYSTEM</span>
            </h1>
          </div>

          {/* Footer System Badges on the Left */}
          <div
            style={{
              display: 'inline-flex',
              maxWidth: 'fit-content',
              gap: '1.2rem',
              flexWrap: 'wrap',
              background: isDark ? 'rgba(7, 11, 22, 0.8)' : 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(10px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '16px',
              padding: '1rem 1.6rem'
            }}
          >
            <span style={{ fontSize: '1.05rem', color: isDark ? '#FFD700' : '#d97706', fontWeight: 800 }}>👑 Gym Owner</span>
            <span style={{ fontSize: '1.05rem', color: isDark ? '#34d399' : '#059669', fontWeight: 800 }}>🥗 Gym Dietician</span>
            <span style={{ fontSize: '1.05rem', color: isDark ? '#a78bfa' : '#7c3aed', fontWeight: 800 }}>💼 Gym Consultant</span>
            <span style={{ fontSize: '1.05rem', color: isDark ? '#00F0FF' : '#2563eb', fontWeight: 800 }}>🏃 Members Active</span>
          </div>
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
          overflowY: 'auto',
          zoom: 1.4
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto', width: '95%' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3.1rem', fontWeight: 900, margin: 0, color: isDark ? '#fff' : '#0f172a', letterSpacing: '0.02em' }}>
              SYSTEM ACCESS PORTAL
            </h2>
            <p style={{ fontSize: '1.28rem', color: isDark ? 'rgba(255,255,255,0.75)' : '#475569', marginTop: '0.5rem', lineHeight: 1.4 }}>
              Sign in to your account or register a new Gym Master / Member profile below.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
                border: isDark ? '1px solid #ef4444' : '1px solid #fecaca',
                color: isDark ? '#ff6b6b' : '#dc2626',
                padding: '1.1rem 1.4rem',
                borderRadius: '12px',
                fontSize: '1.15rem',
                fontWeight: 700,
                marginBottom: '1.25rem'
              }}
            >
              {error}
            </div>
          )}

          {/* CONDITIONAL RENDER: OTP VERIFICATION VIEW OR STANDARD AUTH FORM */}
          {viewMode === 'otp' ? (
            <OtpVerification
              email={otpTargetEmail}
              purpose={otpPurpose}
              metadata={otpMetadata}
              isDark={isDark}
              onSuccess={handleOtpSuccess}
              onBack={() => {
                setViewMode('form');
                setError('');
              }}
            />
          ) : (
            <>
              {/* DUAL VISIBLE OPTIONS: BOTH SIGN IN & CREATE ACCOUNT ARE PROMINENTLY VISIBLE */}
              <div
                className="dual-access-options mb-4"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.1rem',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#e2e8f0',
              padding: '0.75rem',
              borderRadius: '16px',
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
                padding: '1.3rem 1.1rem',
                borderRadius: '12px',
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
              <div style={{ fontWeight: 900, fontSize: '1.45rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔑 SIGN IN
              </div>
              <div style={{ fontSize: '1.05rem', opacity: 0.85, fontWeight: 700, marginTop: '4px' }}>
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
                padding: '1.3rem 1.1rem',
                borderRadius: '12px',
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
              <div style={{ fontWeight: 900, fontSize: '1.45rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✨ CREATE ACCOUNT
              </div>
              <div style={{ fontSize: '1.05rem', opacity: 0.85, fontWeight: 700, marginTop: '4px' }}>
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
            {/* 1-CLICK INSTANT DEMO LOGINS BAR (VISIBLE DURING SIGN IN) */}
            {!isRegister && (
              <div
                className="instant-quick-logins mb-4"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.08rem', fontWeight: 900, color: isDark ? '#00F0FF' : '#2563eb', letterSpacing: '0.04em' }}>
                    ⚡ 1-CLICK INSTANT ACCESS:
                  </span>
                  <span style={{ fontSize: '0.95rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', fontWeight: 700 }}>
                    Click any role to enter
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Gym Owner */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = existingUsers.find(x => x.role === 'owner' || x.role === 'gym_owner');
                      if (u) {
                        handleDemoLogin(u);
                      } else {
                        setIsRegister(true);
                        handleRoleChange('owner');
                        setError('ℹ️ No Gym Owner account currently exists. You can register now to claim the Gym Owner seat!');
                      }
                    }}
                    style={{
                      padding: '0.65rem 1.05rem',
                      borderRadius: '10px',
                      border: isDark ? '1.5px solid #f59e0b' : '1.5px solid #d97706',
                      background: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
                      color: isDark ? '#fbbf24' : '#92400e',
                      fontWeight: 800,
                      fontSize: '1.02rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    👑 {existingOwner ? 'Gym Owner' : 'Gym Owner (Vacant • Claim Seat)'}
                  </button>

                  {/* Gym Dietician */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = existingUsers.find(x => x.role === 'dietician' || x.email === 'dietician@companion.fit');
                      if (u) handleDemoLogin(u);
                    }}
                    style={{
                      padding: '0.65rem 1.05rem',
                      borderRadius: '10px',
                      border: isDark ? '1.5px solid #10b981' : '1.5px solid #059669',
                      background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5',
                      color: isDark ? '#34d399' : '#065f46',
                      fontWeight: 800,
                      fontSize: '1.02rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    🥗 Gym Dietician
                  </button>

                  {/* Gym Consultant */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = existingUsers.find(x => x.role === 'consultant' || x.email === 'consultant@companion.fit');
                      if (u) handleDemoLogin(u);
                    }}
                    style={{
                      padding: '0.65rem 1.05rem',
                      borderRadius: '10px',
                      border: isDark ? '1.5px solid #8b5cf6' : '1.5px solid #7c3aed',
                      background: isDark ? 'rgba(139, 92, 246, 0.2)' : '#f5f3ff',
                      color: isDark ? '#a78bfa' : '#5b21b6',
                      fontWeight: 800,
                      fontSize: '1.02rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    💼 Gym Consultant
                  </button>

                  {/* Gym Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = existingUsers.find(x => (x.role === 'admin' || x.role === 'gym_master') && x.email !== 'owner@gymmaster.fit');
                      if (u) handleDemoLogin(u);
                    }}
                    style={{
                      padding: '0.65rem 1.05rem',
                      borderRadius: '10px',
                      border: isDark ? '1.5px solid #eab308' : '1.5px solid #ca8a04',
                      background: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3',
                      color: isDark ? '#fde047' : '#854d0e',
                      fontWeight: 800,
                      fontSize: '1.02rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    ⚡ Gym Admin
                  </button>

                  {/* Gym Member */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = existingUsers.find(x => x.role === 'member' || x.email === 'ava@companion.fit');
                      if (u) handleDemoLogin(u);
                    }}
                    style={{
                      padding: '0.65rem 1.05rem',
                      borderRadius: '10px',
                      border: isDark ? '1.5px solid #00F0FF' : '1.5px solid #2563eb',
                      background: isDark ? 'rgba(0, 240, 255, 0.2)' : '#dbeafe',
                      color: isDark ? '#00F0FF' : '#1e40af',
                      fontWeight: 800,
                      fontSize: '1.02rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    🏃 Member
                  </button>
                </div>
              </div>
            )}

            {/* AUTH METHOD SELECTOR FOR SIGN IN (PASSWORD PRIMARY vs OTP SECONDARY) */}
            {!isRegister && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.65rem',
                  marginBottom: '1.25rem',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                  padding: '0.45rem',
                  borderRadius: '12px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('password');
                    setError('');
                  }}
                  style={{
                    padding: '0.8rem 0.85rem',
                    borderRadius: '9px',
                    border: authMethod === 'password' ? (isDark ? '2px solid #FFD700' : '2px solid #ca8a04') : '1px solid transparent',
                    background: authMethod === 'password' ? (isDark ? 'rgba(255, 215, 0, 0.2)' : '#ffffff') : 'transparent',
                    color: authMethod === 'password' ? (isDark ? '#FFD700' : '#854d0e') : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: 900,
                    fontSize: '0.96rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: authMethod === 'password' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <KeyRound size={16} />
                  <span>PASSWORD LOGIN</span>
                  <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '999px', background: isDark ? '#FFD700' : '#ca8a04', color: '#000', fontWeight: 900 }}>PRIMARY</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('otp');
                    setError('');
                  }}
                  style={{
                    padding: '0.8rem 0.85rem',
                    borderRadius: '9px',
                    border: authMethod === 'otp' ? (isDark ? '2px solid #00F0FF' : '2px solid #0284c7') : '1px solid transparent',
                    background: authMethod === 'otp' ? (isDark ? 'rgba(0, 240, 255, 0.2)' : '#ffffff') : 'transparent',
                    color: authMethod === 'otp' ? (isDark ? '#00F0FF' : '#0369a1') : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: 900,
                    fontSize: '0.96rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: authMethod === 'otp' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Mail size={16} />
                  <span>EMAIL OTP LOGIN</span>
                  <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '999px', background: isDark ? 'rgba(0, 240, 255, 0.2)' : '#e0f2fe', color: isDark ? '#00F0FF' : '#0369a1', fontWeight: 800 }}>SECONDARY</span>
                </button>
              </div>
            )}

            {/* REGISTRATION METHOD SELECTOR (DIRECT PASSWORD PRIMARY vs OTP SECONDARY) */}
            {isRegister && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.65rem',
                  marginBottom: '1.25rem',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                  padding: '0.45rem',
                  borderRadius: '12px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setRegMethod('password');
                    setError('');
                  }}
                  style={{
                    padding: '0.8rem 0.85rem',
                    borderRadius: '9px',
                    border: regMethod === 'password' ? (isDark ? '2px solid #FFD700' : '2px solid #ca8a04') : '1px solid transparent',
                    background: regMethod === 'password' ? (isDark ? 'rgba(255, 215, 0, 0.2)' : '#ffffff') : 'transparent',
                    color: regMethod === 'password' ? (isDark ? '#FFD700' : '#854d0e') : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: 900,
                    fontSize: '0.94rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: regMethod === 'password' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <KeyRound size={16} />
                  <span>PASSWORD SIGN-UP</span>
                  <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '999px', background: isDark ? '#FFD700' : '#ca8a04', color: '#000', fontWeight: 900 }}>PRIMARY</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegMethod('otp');
                    setError('');
                  }}
                  style={{
                    padding: '0.8rem 0.85rem',
                    borderRadius: '9px',
                    border: regMethod === 'otp' ? (isDark ? '2px solid #00F0FF' : '2px solid #0284c7') : '1px solid transparent',
                    background: regMethod === 'otp' ? (isDark ? 'rgba(0, 240, 255, 0.2)' : '#ffffff') : 'transparent',
                    color: regMethod === 'otp' ? (isDark ? '#00F0FF' : '#0369a1') : (isDark ? '#94a3b8' : '#64748b'),
                    fontWeight: 900,
                    fontSize: '0.94rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: regMethod === 'otp' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Mail size={16} />
                  <span>VERIFY VIA OTP</span>
                  <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '999px', background: isDark ? 'rgba(0, 240, 255, 0.2)' : '#e0f2fe', color: isDark ? '#00F0FF' : '#0369a1', fontWeight: 800 }}>SECONDARY</span>
                </button>
              </div>
            )}

            {/* ROLE SELECTOR (VISIBLE DURING REGISTRATION) */}
            {isRegister && (
              <div className="form-group mb-4">
                <label style={{ color: isDark ? '#FFD700' : '#ca8a04', fontWeight: 900, fontSize: '0.98rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
                  CHOOSE YOUR ACCOUNT ROLE:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('member')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      border: role === 'member' ? (isDark ? '2.5px solid #00F0FF' : '2.5px solid #2563eb') : '1.5px solid #e2e8f0',
                      background: role === 'member' ? (isDark ? 'rgba(0, 240, 255, 0.2)' : '#dbeafe') : (isDark ? '#1f2937' : '#f8fafc'),
                      color: isDark ? '#fff' : '#000',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: isDark ? '#00F0FF' : '#1e40af' }}>
                      🏃 MEMBER
                    </div>
                    <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', marginTop: '2px' }}>
                      Workouts & Vitals
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('owner')}
                    title={
                      existingOwner
                        ? `Seat claimed by ${existingOwner.name || existingOwner.email}. Only 1 Gym Owner allowed.`
                        : 'Seat is vacant! Anyone can claim Gym Owner.'
                    }
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      border: role === 'owner' ? (isDark ? '2.5px solid #fbbf24' : '2.5px solid #d97706') : '1.5px solid #e2e8f0',
                      background: role === 'owner' 
                        ? (isDark ? 'rgba(251, 191, 36, 0.2)' : '#fef3c7') 
                        : existingOwner
                          ? (isDark ? '#1a202c' : '#f1f5f9')
                          : (isDark ? '#1f2937' : '#f8fafc'),
                      color: isDark ? '#fff' : '#000',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                      opacity: existingOwner && role !== 'owner' ? 0.75 : 1
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: isDark ? '#fbbf24' : '#92400e' }}>
                      👑 GYM OWNER
                    </div>
                    {existingOwner ? (
                      <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 900, marginTop: '2px' }}>
                        🔒 OCCUPIED (1 Max)
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 900, marginTop: '2px' }}>
                        🟢 VACANT • CLAIM SEAT
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('dietician')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      border: role === 'dietician' ? (isDark ? '2.5px solid #34d399' : '2.5px solid #059669') : '1.5px solid #e2e8f0',
                      background: role === 'dietician' ? (isDark ? 'rgba(52, 211, 153, 0.2)' : '#ecfdf5') : (isDark ? '#1f2937' : '#f8fafc'),
                      color: isDark ? '#fff' : '#000',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: isDark ? '#34d399' : '#065f46' }}>
                      🥗 DIETICIAN
                    </div>
                    <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', marginTop: '2px' }}>
                      Nutrition & Macros
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('consultant')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      border: role === 'consultant' ? (isDark ? '2.5px solid #a78bfa' : '2.5px solid #7c3aed') : '1.5px solid #e2e8f0',
                      background: role === 'consultant' ? (isDark ? 'rgba(167, 139, 250, 0.2)' : '#f5f3ff') : (isDark ? '#1f2937' : '#f8fafc'),
                      color: isDark ? '#fff' : '#000',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: isDark ? '#a78bfa' : '#5b21b6' }}>
                      💼 CONSULTANT
                    </div>
                    <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', marginTop: '2px' }}>
                      Workout Templates
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      border: (role === 'admin' || role === 'gym_master') ? (isDark ? '2.5px solid #FFD700' : '2.5px solid #ca8a04') : '1.5px solid #e2e8f0',
                      background: (role === 'admin' || role === 'gym_master') ? (isDark ? 'rgba(255, 215, 0, 0.2)' : '#fef9c3') : (isDark ? '#1f2937' : '#f8fafc'),
                      color: isDark ? '#fff' : '#000',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: isDark ? '#FFD700' : '#854d0e' }}>
                      ⚡ GYM ADMIN
                    </div>
                    <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', marginTop: '2px' }}>
                      Roster & Finance
                    </div>
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <div className="form-group mb-3">
                <label style={{ fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.35rem' }}>FULL NAME</label>
                <input
                  type="text"
                  placeholder={
                    role === 'owner' ? 'e.g. Alexander Cole' :
                    role === 'dietician' ? 'e.g. Dr. Sarah Lin' :
                    role === 'consultant' ? 'e.g. Jordan Hayes' :
                    role === 'admin' ? 'e.g. Master Coach Vance' :
                    'e.g. Alex Morgan'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '10px', color: isDark ? '#fff' : '#0f172a' }}
                />
              </div>
            )}

            {/* Form Fields according to Auth Mode and Registration Mode */}
            {(!isRegister && authMethod === 'otp') || (isRegister && regMethod === 'otp') ? (
              <div className="form-group mb-3">
                <label style={{ fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span>EMAIL ADDRESS (OTP)</span>
                  <span style={{ fontSize: '0.82rem', color: isDark ? '#00F0FF' : '#0284c7', fontWeight: 800 }}>Secondary Verification</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com or 24104025@nec.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.95rem 1rem 0.95rem 2.85rem', fontSize: '1.05rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1.5px solid #00F0FF' : '1.5px solid #0284c7', borderRadius: '10px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                  <Mail size={18} color={isDark ? '#00F0FF' : '#0284c7'} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
                <div style={{ marginTop: '0.65rem', padding: '0.7rem 0.9rem', borderRadius: '10px', background: isDark ? 'rgba(0, 240, 255, 0.08)' : '#f0f9ff', border: isDark ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid #bae6fd', color: isDark ? '#7dd3fc' : '#0369a1', fontSize: '0.88rem', lineHeight: 1.45, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>OTP Verification (Secondary):</strong> An instant 6-digit verification code will be dispatched to this email address to verify access.</span>
                </div>
              </div>
            ) : (
              <>
                <div className="form-group mb-3">
                  <label style={{ fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                    {isRegister ? 'EMAIL ADDRESS' : 'EMAIL OR USERNAME'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isRegister
                        ? (role === 'owner' ? 'owner@gymmaster.fit' :
                           role === 'dietician' ? 'dietician@companion.fit' :
                           role === 'consultant' ? 'consultant@companion.fit' :
                           role === 'admin' ? '24104025@nec.edu.in' :
                           'e.g. 24104025@nec.edu.in or alex@example.com')
                        : 'e.g. 24104025@nec.edu.in, Ava, Marcus, or Gym Owner'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '10px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>

                <div className="form-group mb-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#fff' : '#0f172a' }}>
                      {isRegister ? 'SET ACCOUNT PASSWORD' : 'PASSWORD'}
                    </label>
                    {!isRegister && (
                      <span style={{ fontSize: '0.82rem', color: isDark ? '#FFD700' : '#ca8a04', fontWeight: 800 }}>
                        Primary Access
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder={isRegister ? 'Create a secure password' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={isRegister}
                    style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '10px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
              </>
            )}

            {isRegister && role === 'member' && (
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.35rem' }}>AGE (YRS)</label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '10px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.35rem' }}>WEIGHT (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '10px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
              </div>
            )}

            {isRegister && (role === 'owner' || role === 'dietician' || role === 'consultant' || role === 'admin' || role === 'gym_master') && (
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                    {role === 'owner' ? 'FACILITY / GYM NAME' : role === 'dietician' ? 'CLINIC / GYM NAME' : role === 'consultant' ? 'PRACTICE / GYM NAME' : 'GYM / CLUB NAME'}
                  </label>
                  <input
                    type="text"
                    placeholder="Iron Forge Performance Gym"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '10px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#fff' : '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                    {role === 'owner' ? 'EXECUTIVE TITLE' : role === 'dietician' ? 'NUTRITION SPECIALTY' : role === 'consultant' ? 'CONSULTING FOCUS' : 'SPECIALTY TITLE'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      role === 'owner' ? 'Gym Owner & Executive Director' :
                      role === 'dietician' ? 'Clinical Nutrition & Macro Specialist' :
                      role === 'consultant' ? 'Workout Templates Consultant' :
                      'Head Strength Coach'
                    }
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', background: isDark ? '#1f2937' : '#ffffff', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '10px', color: isDark ? '#fff' : '#0f172a' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingOtp}
              className="login-submit-btn"
              style={{
                width: '100%',
                padding: '1.25rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                borderRadius: '14px',
                background: isRegister
                  ? (regMethod === 'password'
                      ? (role === 'owner' ? (isDark ? '#fbbf24' : '#d97706')
                         : role === 'dietician' ? (isDark ? '#34d399' : '#059669')
                         : role === 'consultant' ? (isDark ? '#a78bfa' : '#7c3aed')
                         : (isDark ? '#FFD700' : '#ca8a04'))
                      : (isDark ? '#00F0FF' : '#2563eb'))
                  : (authMethod === 'password'
                      ? (isDark ? '#00F0FF' : '#2563eb')
                      : (isDark ? '#38bdf8' : '#0284c7')),
                color: isRegister
                  ? (role === 'dietician' || role === 'consultant' || (!isDark && role === 'owner') ? '#ffffff' : '#000000')
                  : (isDark ? '#000000' : '#ffffff'),
                border: 'none',
                cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                fontSize: '1.3rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem'
              }}
            >
              {isRegister
                ? regMethod === 'password'
                  ? (role === 'owner' ? '👑 CREATE OWNER ACCOUNT & SIGN IN'
                     : role === 'dietician' ? '🥗 CREATE DIETICIAN ACCOUNT & SIGN IN'
                     : role === 'consultant' ? '💼 CREATE CONSULTANT ACCOUNT & SIGN IN'
                     : role === 'admin' ? '⚡ CREATE ADMIN ACCOUNT & SIGN IN'
                     : '✨ CREATE MEMBER ACCOUNT & SIGN IN')
                  : (role === 'owner' ? '✉️ SEND OTP & REGISTER OWNER'
                     : role === 'dietician' ? '✉️ SEND OTP & REGISTER DIETICIAN'
                     : role === 'consultant' ? '✉️ SEND OTP & REGISTER CONSULTANT'
                     : role === 'admin' ? '✉️ SEND OTP & REGISTER ADMIN'
                     : '✉️ SEND OTP & REGISTER MEMBER')
                : authMethod === 'otp'
                  ? (
                    <>
                      <Mail size={22} />
                      SEND VERIFICATION CODE (OTP)
                    </>
                  )
                  : 'AUTHENTICATE ACCESS'}
            </button>
          </form>

          {/* SAVED USER & DEMO ACCOUNT SELECTION */}
          <div className="demo-section" style={{ marginTop: '2rem' }}>
            <div className="demo-divider" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div className="demo-divider-title">
                <span style={{ fontWeight: 900, color: isDark ? '#00F0FF' : '#ca8a04', letterSpacing: '0.06em', fontSize: '1.25rem' }}>
                  💾 PRE-CONFIGURED & REGISTERED ACCOUNTS ({existingUsers.length})
                </span>
              </div>
              <span style={{ fontSize: '0.98rem', color: isDark ? 'rgba(57, 255, 20, 0.95)' : '#15803d', fontWeight: 700, letterSpacing: '0.03em', display: 'block', marginTop: '0.4rem' }}>
                ● Click any account below to instantly authenticate and test
              </span>
            </div>

            <div className="demo-users-list">
              {existingUsers.map((u) => {
                const isOwner = u.role === 'owner' || u.role === 'gym_owner';
                const isDietician = u.role === 'dietician';
                const isConsultant = u.role === 'consultant';
                const isMaster = isOwner || u.role === 'gym_master' || u.role === 'admin';
                const isCustomUser = Number(u.user_id) > 9;

                let cardBorder = isDark ? '#00F0FF' : '#3b82f6';
                let cardBg = isDark ? 'linear-gradient(90deg, rgba(0,240,255,0.1) 0%, rgba(10,14,26,0.8) 100%)' : '#ffffff';
                let avatarBorder = '#2563eb';
                let badgeText = '🏋️ MEMBER';
                let badgeBg = isDark ? '#00F0FF' : '#2563eb';
                let badgeColor = isDark ? '#000' : '#ffffff';
                let arrowColor = isDark ? '#00F0FF' : '#2563eb';

                if (isOwner) {
                  cardBorder = isDark ? '#fbbf24' : '#d97706';
                  cardBg = isDark ? 'linear-gradient(90deg, rgba(251,191,36,0.16) 0%, rgba(10,14,26,0.8) 100%)' : '#fef3c7';
                  avatarBorder = '#d97706';
                  badgeText = '👑 OWNER';
                  badgeBg = isDark ? '#fbbf24' : '#d97706';
                  badgeColor = isDark ? '#000' : '#ffffff';
                  arrowColor = isDark ? '#fbbf24' : '#d97706';
                } else if (isDietician) {
                  cardBorder = isDark ? '#34d399' : '#059669';
                  cardBg = isDark ? 'linear-gradient(90deg, rgba(52,211,153,0.16) 0%, rgba(10,14,26,0.8) 100%)' : '#ecfdf5';
                  avatarBorder = '#059669';
                  badgeText = '🥗 DIETICIAN';
                  badgeBg = isDark ? '#34d399' : '#059669';
                  badgeColor = '#ffffff';
                  arrowColor = isDark ? '#34d399' : '#059669';
                } else if (isConsultant) {
                  cardBorder = isDark ? '#a78bfa' : '#7c3aed';
                  cardBg = isDark ? 'linear-gradient(90deg, rgba(167,139,250,0.16) 0%, rgba(10,14,26,0.8) 100%)' : '#f5f3ff';
                  avatarBorder = '#7c3aed';
                  badgeText = '💼 CONSULTANT';
                  badgeBg = isDark ? '#a78bfa' : '#7c3aed';
                  badgeColor = '#ffffff';
                  arrowColor = isDark ? '#a78bfa' : '#7c3aed';
                } else if (isMaster) {
                  cardBorder = isDark ? '#FFD700' : '#eab308';
                  cardBg = isDark ? 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(10,14,26,0.8) 100%)' : '#fef9c3';
                  avatarBorder = '#ca8a04';
                  badgeText = '⚡ ADMIN';
                  badgeBg = isDark ? '#FFD700' : '#ca8a04';
                  badgeColor = isDark ? '#000' : '#ffffff';
                  arrowColor = isDark ? '#FFD700' : '#ca8a04';
                } else if (isCustomUser) {
                  cardBorder = isDark ? '#39FF14' : '#16a34a';
                  cardBg = isDark ? 'linear-gradient(90deg, rgba(57,255,20,0.12) 0%, rgba(10,14,26,0.8) 100%)' : '#f0fdf4';
                  avatarBorder = '#16a34a';
                  badgeText = '✨ CUSTOM';
                  badgeBg = isDark ? 'rgba(57, 255, 20, 0.25)' : '#dcfce7';
                  badgeColor = isDark ? '#39FF14' : '#15803d';
                  arrowColor = isDark ? '#39FF14' : '#16a34a';
                }

                return (
                  <button
                    key={u.user_id}
                    type="button"
                    className="demo-user-btn"
                    onClick={() => handleDemoLogin(u)}
                    style={{
                      borderColor: cardBorder,
                      borderWidth: isOwner || isDietician || isConsultant ? '2px' : '1.5px',
                      borderRadius: '16px',
                      background: cardBg,
                      padding: '1.1rem 1.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.1rem',
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      className="demo-user-avatar"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        padding: 0,
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2.5px solid ${avatarBorder}`,
                        background: isDark ? '#1f2937' : '#e2e8f0',
                        color: isDark ? '#fff' : '#0f172a',
                        fontWeight: 900,
                        fontSize: '1.45rem'
                      }}
                    >
                      {(u.name || 'U').charAt(0).toUpperCase()}
                    </span>

                    <div className="demo-user-info" style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                      <div className="demo-user-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="demo-user-name" style={{ color: isDark ? '#fff' : '#0f172a', fontWeight: 800, fontSize: '1.25rem' }}>
                          {u.name}
                        </span>
                      </div>

                      <span className="demo-user-meta" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#475569', fontSize: '1.02rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                        {u.specialty || `${u.fitness_level || 'Member'} • ${u.email}`}
                      </span>
                    </div>

                    <div className="demo-user-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        title={`Send OTP verification code to ${u.email}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEmail(u.email);
                          handleInitiateOtp(u.email, 'login', { name: u.name, role: u.role });
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.86rem',
                          padding: '0.42rem 0.75rem',
                          borderRadius: '8px',
                          fontWeight: 900,
                          background: isDark ? 'rgba(0, 240, 255, 0.16)' : '#e0f2fe',
                          border: isDark ? '1px solid #00F0FF' : '1px solid #0284c7',
                          color: isDark ? '#00F0FF' : '#0284c7',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <Mail size={13} />
                        <span>OTP Access</span>
                      </button>

                      <span
                        style={{
                          fontSize: '0.92rem',
                          padding: '0.45rem 0.8rem',
                          borderRadius: '8px',
                          fontWeight: 900,
                          letterSpacing: '0.04em',
                          background: badgeBg,
                          color: badgeColor,
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          lineHeight: 1
                        }}
                      >
                        {badgeText}
                      </span>
                    </div>

                    <span
                      className="demo-user-arrow"
                      style={{
                        color: arrowColor,
                        fontWeight: 900,
                        fontSize: '1.45rem'
                      }}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>
);
}