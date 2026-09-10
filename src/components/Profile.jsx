import React, { useState, useRef } from 'react';
import { generateLetterAvatarSvg } from '../services/db.js';

export default function Profile({ user, onUpdateProfile }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    age: user.age || 25,
    weight: user.weight || 65,
    height: user.height || 170,
    fitness_level: user.fitness_level || 'Intermediate',
    bio: user.bio || '',
    avatar: user.avatar || generateLetterAvatarSvg(user.name || 'U', user.role === 'gym_master')
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((f) => ({ ...f, avatar: event.target.result }));
      setSaved(false);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleResetToLetterAvatar = () => {
    const letterAvatar = generateLetterAvatarSvg(form.name || 'U', user.role === 'gym_master');
    setForm((f) => ({ ...f, avatar: letterAvatar }));
    setSaved(false);
  };
         
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Full Name is required.');
      return;
    }

    const patch = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      age: Number(form.age) || 25,
      weight: Number(form.weight) || 65,
      height: Number(form.height) || 170
    };

    onUpdateProfile(patch);
    setSaved(true);
    setError('');
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header className="page-header flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 900, color: '#ca8a04', textTransform: 'uppercase' }}>
            USER ACCOUNT MANAGEMENT →
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Profile & Avatar Settings
          </h1>
          <p className="page-subtitle" style={{ fontWeight: 600, color: '#64748b' }}>
            Manage your personal metrics, body dimensions, and custom profile photo.
          </p>
        </div>
      </header>

      {saved && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            fontWeight: 900,
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}
        >
          ✅ Profile updated successfully! Changes synced across your account, leaderboard, and logs.
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            fontWeight: 900,
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-3 gap-4" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Profile Card & Avatar Actions (Without Presets) */}
        <div className="card text-center p-4" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src={form.avatar || generateLetterAvatarSvg(form.name || 'U', user.role === 'gym_master')}
              alt={form.name}
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                objectFit: 'cover',
                border: user.role === 'gym_master' ? '3.5px solid #ca8a04' : '3.5px solid #2563eb',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
              }}
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>{form.name || 'User'}</h3>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', margin: '0.2rem 0 1rem 0' }}>
            {user.role === 'gym_master' ? '👑 GYM MASTER / COACH' : `🏋️ GYM MEMBER • ${form.fitness_level}`}
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-secondary text-xs w-full"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '0.65rem', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}
            >
              📸 Upload Custom Photo
            </button>

            <button
              type="button"
              onClick={handleResetToLetterAvatar}
              style={{
                padding: '0.6rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: '0.78rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              🔄 Reset to First-Letter Avatar
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card p-4" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 1.25rem 0', color: '#0f172a' }}>
            Personal Details & Biometrics
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>FULL NAME</label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                required
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>AGE (YEARS)</label>
              <input
                type="number"
                min="10"
                max="120"
                value={form.age}
                onChange={handleChange('age')}
                required
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>WEIGHT (KG)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={form.weight}
                onChange={handleChange('weight')}
                required
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>HEIGHT (CM)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={form.height}
                onChange={handleChange('height')}
                required
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>FITNESS EXPERIENCE LEVEL</label>
              <select
                value={form.fitness_level}
                onChange={handleChange('fitness_level')}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert / Master">Expert / Master</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>FITNESS BIO / GOALS</label>
              <textarea
                value={form.bio}
                onChange={handleChange('bio')}
                rows={3}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
              <button
                type="submit"
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
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                }}
              >
                💾 Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
