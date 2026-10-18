import React, { useState } from 'react';
import * as db from '../services/db.js';

const GET_NAV_GROUPS = (role) => {
  const isOwner = role === 'owner' || role === 'gym_owner';
  const isGymMaster = !isOwner && (role === 'gym_master' || role === 'admin');
  const isDietician = role === 'dietician';
  const isConsultant = role === 'consultant';
  const isTrainer = role === 'trainer';

  if (isOwner) {
    return [
      {
        category: 'FINANCIAL MONITORING',
        items: [
          { key: 'revenue', label: 'Financial & Revenue Reports', icon: '📈', badge: 'FINANCE' }
        ]
      }
    ];
  }

  if (isGymMaster) {
    return [
      {
        category: 'ADMIN & GYM MASTER PORTAL',
        items: [
          { key: 'gym-master', label: 'Admin & Master Dashboard', icon: '👑', badge: 'ADMIN' },
          { key: 'bulk-assign', label: 'Bulk Plan Assign', icon: '⚡' },
          { key: 'templates', label: 'Workout Templates', icon: '📋' },
        ]
      },
      {
        category: 'COMMUNITY & COMMUNICATION',
        items: [
          { key: 'daily-challenge', label: '24h Daily Challenge', icon: '⚡', badge: '24H' },
          { key: 'messages', label: 'Member Messaging', icon: '💬' },
          { key: 'challenges', label: 'Gym Challenges', icon: '⚔️' },
          { key: 'notifications', label: 'Notifications', icon: '🔔' },
          { key: 'friends', label: 'Social & Friends', icon: '👥' },
          { key: 'achievements', label: 'Achievements', icon: '🏆' },
        ]
      },
      {
        category: 'CORE APP & TOOLS',
        items: [
          { key: 'dashboard', label: 'Member View Dashboard', icon: '📊' },
          { key: 'plans', label: 'Fitness Plans', icon: '🏋️‍♂️' },
          { key: 'reports', label: 'Progress Reports', icon: '📈' },
          { key: 'profile', label: 'Profile', icon: '👤' },
          { key: 'settings', label: 'Settings', icon: '⚙️' }
        ]
      }
    ];
  }

  if (isDietician) {
    return [
      {
        category: 'FOOD ASSIGNMENT HUB',
        items: [
          { key: 'nutrition', label: 'Assign & Recommend Food', icon: '🥗', badge: 'ASSIGN' },
        ]
      },
      {
        category: 'ACCOUNT',
        items: [
          { key: 'profile', label: 'Dietician Profile', icon: '👤' },
        ]
      }
    ];
  }

  if (isConsultant) {
    return [
      {
        category: 'WORKOUT TEMPLATES PORTAL',
        items: [
          { key: 'templates', label: 'Workout Templates', icon: '📋', badge: 'EXCLUSIVE' }
        ]
      }
    ];
  }

  if (isTrainer) {
    return [
      {
        category: 'TRAINER HUB',
        items: [
          { key: 'dashboard', label: 'Trainer Dashboard', icon: '📊' },
          { key: 'daily-challenge', label: '24h Daily Challenge', icon: '⚡', badge: '24H' },
          { key: 'templates', label: 'Workout Templates', icon: '📋', badge: 'NEW' },
          { key: 'bulk-assign', label: 'Bulk Assign Plans', icon: '⚡' },
          { key: 'messages', label: 'Member Chat', icon: '💬' },
          { key: 'notifications', label: 'Notifications', icon: '🔔' }
        ]
      },
      {
        category: 'SOCIAL & CHALLENGES',
        items: [
          { key: 'challenges', label: 'Friend Challenges', icon: '⚔️' },
          { key: 'achievements', label: 'Achievements & Badges', icon: '🏆' },
          { key: 'friends', label: 'Friends Directory', icon: '👥' },
          { key: 'share-card', label: 'Shareable Progress', icon: '📸' }
        ]
      },
      {
        category: 'FITNESS & RECOVERY',
        items: [
          { key: 'plans', label: 'Fitness Plans', icon: '🏋️‍♂️' },
          { key: 'workout-live', label: 'Live Workout', icon: '⏱️' },
          { key: 'reports', label: 'Progress Reports', icon: '📈' },
          { key: 'health', label: 'Health Vitals', icon: '🩺' },
          { key: 'profile', label: 'Profile', icon: '👤' }
        ]
      }
    ];
  }

  // Member (Default)
  return [
    {
      category: 'OVERVIEW & ACTIVE',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'daily-challenge', label: 'Daily Challenge (24h)', icon: '⚡', badge: '24H' },
        { key: 'devices', label: 'Device Sync & Watch', icon: '⌚', badge: 'BLE' },
        { key: 'notifications', label: 'Notifications', icon: '🔔' },
        { key: 'workout-live', label: 'Live Workout', icon: '⏱️', badge: 'LIVE' },
        { key: 'reports', label: 'Progress Reports', icon: '📈' }
      ]
    },
    {
      category: 'SOCIAL & GAMIFICATION',
      items: [
        { key: 'achievements', label: 'Achievements & Badges', icon: '🏆', badge: 'NEW' },
        { key: 'challenges', label: 'Friend Challenges', icon: '⚔️', badge: 'POPULAR' },
        { key: 'friends', label: 'Friends & Network', icon: '👥' },
        { key: 'share-card', label: 'Shareable Progress', icon: '📸' },
        { key: 'messages', label: 'Trainer Chat', icon: '💬' }
      ]
    },
    {
      category: 'FITNESS & TRAINING',
      items: [
        { key: 'plans', label: 'Fitness Plans', icon: '🏋️‍♂️' },
        { key: 'goals', label: 'Goals & Milestones', icon: '🎯' },
        { key: 'heart-zones', label: 'Heart Rate Zones', icon: '❤️' }
      ]
    },
    {
      category: 'HEALTH & RECOVERY',
      items: [
        { key: 'health', label: 'Health Vitals', icon: '🩺' },
        { key: 'sleep', label: 'Sleep & Recovery', icon: '🌙' },
        { key: 'hydration', label: 'Water & Hydration', icon: '💧' },
        { key: 'supplements', label: 'Supplement Stack', icon: '💊' }
      ]
    },
    {
      category: 'NUTRITION & BODY',
      items: [
        { key: 'nutrition', label: 'Nutrition Plan', icon: '🥗' },
        { key: 'recipes', label: 'Recipe Library', icon: '🍲' },
        { key: 'macro-calc', label: 'Macro Calculator', icon: '🧮' },
        { key: 'body-comp', label: 'Body Composition', icon: '📏' }
      ]
    },
    {
      category: 'SYSTEM & ACCOUNT',
      items: [
        { key: 'profile', label: 'User Profile', icon: '👤' },
        { key: 'settings', label: 'Settings & Data', icon: '⚙️' }
      ]
    }
  ];
};

export default function Sidebar({ active, onNavigate, currentUser, onLogout }) {
  const [search, setSearch] = useState('');
  const role = currentUser?.role || 'member';
  const isOwner = role === 'owner' || role === 'gym_owner';
  const isGymMaster = !isOwner && (role === 'gym_master' || role === 'admin');
  const isDietician = role === 'dietician';
  const isConsultant = role === 'consultant';
  const isTrainer = role === 'trainer';

  const navGroups = GET_NAV_GROUPS(role);

  // Badge configuration based on role
  let badgeBorder = '#e2e8f0';
  let badgeBg = '#f8fafc';
  let avatarBg = '#10b981';
  let roleColor = '#047857';
  let roleTitle = '🏃 MEMBER';

  if (isOwner) {
    badgeBorder = '#fde68a';
    badgeBg = '#fef3c7';
    avatarBg = '#d97706';
    roleColor = '#92400e';
    roleTitle = '👑 GYM OWNER';
  } else if (isDietician) {
    badgeBorder = '#a7f3d0';
    badgeBg = '#ecfdf5';
    avatarBg = '#059669';
    roleColor = '#065f46';
    roleTitle = '🥗 GYM DIETICIAN';
  } else if (isConsultant) {
    badgeBorder = '#ddd6fe';
    badgeBg = '#f5f3ff';
    avatarBg = '#7c3aed';
    roleColor = '#5b21b6';
    roleTitle = '💼 GYM CONSULTANT';
  } else if (isGymMaster) {
    badgeBorder = '#fef08a';
    badgeBg = '#fef9c3';
    avatarBg = '#ca8a04';
    roleColor = '#854d0e';
    roleTitle = '👑 GYM MASTER';
  } else if (isTrainer) {
    badgeBorder = '#bfdbfe';
    badgeBg = '#eff6ff';
    avatarBg = '#2563eb';
    roleColor = '#1e40af';
    roleTitle = '🏋️ TRAINER';
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">SFC//</span>
        <span className="brand-sub">Smart Fitness Companion</span>
      </div>

      {currentUser && (
        <div
          className="user-badge mb-3"
          style={{
            border: `1px solid ${badgeBorder}`,
            background: badgeBg,
            borderRadius: '12px',
            padding: '8px 10px'
          }}
        >
          <div
            className="user-avatar"
            style={{
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: avatarBg,
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1rem',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              textTransform: 'uppercase'
            }}
          >
            {(currentUser.name || 'User').charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name" style={{ fontWeight: 900, color: '#0f172a' }}>{currentUser.name}</span>
            <span
              className="user-role"
              style={{
                color: roleColor,
                fontWeight: 900,
                fontSize: '0.7rem'
              }}
            >
              {roleTitle}
            </span>
          </div>
        </div>
      )}

      {/* QUICK SHORTCUT BUTTONS */}
      {isGymMaster && active !== 'gym-master' && (
        <div className="px-2 mb-3">
          <button
            className="w-full flex items-center justify-between p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-xs shadow-sm hover:brightness-105 transition-all"
            onClick={() => onNavigate('gym-master')}
          >
            <span className="flex items-center gap-2">
              <span>👑</span>
              <span>Open Gym Master Portal</span>
            </span>
            <span>&rarr;</span>
          </button>
        </div>
      )}

      {!isConsultant && !isDietician && !isOwner && (
        <div className="px-2 mb-3">
          <input
            type="text"
            className="input-field-sm w-full"
            placeholder="🔎 Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      <div className="nav-scroll-area">
        {navGroups.map((group) => {
          const matchingItems = group.items.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase())
          );
          if (matchingItems.length === 0) return null;
          return (
            <div key={group.category} className="nav-group mb-3">
              <div className="nav-category-header">{group.category}</div>
              <ul className="nav-list">
                {matchingItems.map((item) => (
                  <li key={item.key}>
                    <button
                      className={`nav-item${active === item.key ? ' active' : ''}`}
                      onClick={() => onNavigate(item.key)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="sidebar-footer">
        {isOwner && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `⚠️ Permanently delete your Gym Owner account (${currentUser?.name || 'Owner'})?\n\nOnce deleted, the Gym Owner seat will be VACANT and anyone can register as the new Gym Owner.`
                )
              ) {
                db.deleteUserAccount(currentUser?.user_id);
                localStorage.removeItem('sfc_auth_user_id');
                if (onLogout) onLogout();
                else window.location.reload();
              }
            }}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            title="Delete Gym Owner account and vacate the seat"
          >
            <span>🗑️ Vacate Owner Seat</span>
          </button>
        )}
        {onLogout && (
          <button type="button" className="logout-btn" onClick={onLogout}>
            LOG OUT
          </button>
        )}
        <div className="db-info">
          SMART FITNESS COMPANION<br />
          Gym SaaS Platform v8<br />
          persisted to LocalStorage
        </div>
      </div>
    </aside>
  );
}
