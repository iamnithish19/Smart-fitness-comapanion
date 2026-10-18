import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';
import DailyChallenge from './DailyChallenge.jsx';

export default function Challenges({ currentUser, onRefresh, onNavigate }) {
  const [tab, setTab] = useState('daily'); // 'daily' | 'active' | 'completed' | 'create'
  const [challenges, setChallenges] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);

  // Create Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('step'); // 'step' | 'streak' | 'workout'
  const [targetVal, setTargetVal] = useState(70000);
  const [durationDays, setDurationDays] = useState(7);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [notificationMsg, setNotificationMsg] = useState('');

  const refreshData = () => {
    const allC = db.getAll('challenges');
    const allP = db.getAll('challengeParticipants');
    const allU = db.getAll('users');
    const friendships = db.getAll('friendships');

    // Filter connected friends
    const userFriendships = friendships.filter(
      (f) => (Number(f.user_id) === Number(currentUser?.user_id) || Number(f.friend_id) === Number(currentUser?.user_id)) && f.status === 'accepted'
    );
    const friendIds = userFriendships.map((f) => (Number(f.user_id) === Number(currentUser?.user_id) ? Number(f.friend_id) : Number(f.user_id)));
    const friendUsers = allU.filter((u) => friendIds.includes(Number(u.user_id)));

    setChallenges(allC);
    setParticipants(allP);
    setUsers(allU);
    setFriends(friendUsers);
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const handleCreateChallenge = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startDate = new Date().toISOString().slice(0, 10);
    const endDateObj = new Date();
    endDateObj.setDate(endDateObj.getDate() + Number(durationDays));
    const endDate = endDateObj.toISOString().slice(0, 10);

    const newC = db.createChallenge(
      {
        title: title.trim(),
        type,
        created_by: currentUser.user_id,
        start_date: startDate,
        end_date: endDate,
        target_val: Number(targetVal)
      },
      selectedFriends
    );

    showToast(`⚔️ Challenge "${newC.title}" created successfully!`);
    setTitle('');
    setSelectedFriends([]);
    setTab('active');
    refreshData();
    if (onRefresh) onRefresh();
  };

  const toggleFriendSelection = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeList = challenges.filter((c) => c.status === 'active');
  const completedList = challenges.filter((c) => c.status === 'completed');

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      {notificationMsg && (
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
          {notificationMsg}
        </div>
      )}

      <header className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase' }}>
            SOCIAL & COMPETITIONS
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Friend Challenges & Battles
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Compete head-to-head with friends in Step Battles, Workout Streaks, and Fitness Marathons.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${tab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('daily')}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer', background: tab === 'daily' ? '#ca8a04' : '' }}
          >
            ⚡ 24h Daily Challenge
          </button>
          <button
            className={`btn ${tab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('active')}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            ⚔️ Active Battles ({activeList.length})
          </button>
          <button
            className={`btn ${tab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('completed')}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            🏆 Completed ({completedList.length})
          </button>
          <button
            className={`btn ${tab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('create')}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer', background: tab === 'create' ? '#ca8a04' : '' }}
          >
            ➕ Start Challenge
          </button>
        </div>
      </header>

      {/* TAB 0: 24-HOUR DAILY CHALLENGE */}
      {tab === 'daily' && (
        <DailyChallenge currentUser={currentUser} onRefresh={refreshData} onNavigate={onNavigate} />
      )}

      {/* TAB 1 & 2: ACTIVE & COMPLETED CHALLENGES */}
      {(tab === 'active' || tab === 'completed') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(tab === 'active' ? activeList : completedList).length === 0 ? (
            <div className="card p-6 text-center" style={{ borderRadius: '14px', color: '#64748b', fontWeight: 700 }}>
              No {tab} challenges found. Click <strong>"+ Start Challenge"</strong> to challenge your friends!
            </div>
          ) : (
            (tab === 'active' ? activeList : completedList).map((ch) => {
              const cParts = participants.filter((p) => Number(p.challenge_id) === Number(ch.challenge_id));
              const sortedParts = cParts
                .map((p) => {
                  const pUser = users.find((u) => Number(u.user_id) === Number(p.user_id));
                  return { ...p, user: pUser };
                })
                .sort((a, b) => Number(b.progress_value || 0) - Number(a.progress_value || 0));

              const winner = users.find((u) => Number(u.user_id) === Number(ch.winner_id));

              return (
                <div
                  key={ch.challenge_id}
                  className="card p-5"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                  }}
                >
                  <div className="flex-between align-center flex-wrap gap-2 mb-3" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                          {ch.title}
                        </h2>
                        <span
                          style={{
                            background: ch.type === 'step' ? '#dbeafe' : ch.type === 'streak' ? '#fef9c3' : '#dcfce7',
                            color: ch.type === 'step' ? '#1e40af' : ch.type === 'streak' ? '#854d0e' : '#166534',
                            fontWeight: 900,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {ch.type === 'step' ? '👟 Step Challenge' : ch.type === 'streak' ? '🔥 Streak Battle' : '🏋️ Workout Challenge'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                        Target: {ch.target_val.toLocaleString()} {ch.type === 'step' ? 'steps' : ch.type === 'streak' ? 'days' : 'workouts'} • Dates: {ch.start_date} to {ch.end_date}
                      </span>
                    </div>

                    {winner && (
                      <div style={{ background: '#fef9c3', border: '1.5px solid #fef08a', padding: '0.4rem 1rem', borderRadius: '12px', fontWeight: 900, color: '#854d0e', fontSize: '0.85rem' }}>
                        🏆 Winner: {winner.name}
                      </div>
                    )}
                  </div>

                  {/* PARTICIPANTS LEADERBOARD */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sortedParts.map((part, idx) => {
                      const isUser = Number(part.user_id) === Number(currentUser?.user_id);
                      const pct = Math.min(100, Math.round((Number(part.progress_value || 0) / Number(ch.target_val || 1)) * 100));

                      return (
                        <div
                          key={part.participant_id || idx}
                          style={{
                            background: isUser ? '#f0f9ff' : '#f8fafc',
                            border: isUser ? '1.5px solid #bae6fd' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '0.75rem 1rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: idx === 0 ? '#ca8a04' : '#64748b', width: '24px' }}>
                                #{idx + 1}
                              </span>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: idx === 0 ? '#ca8a04' : '#2563eb', color: '#ffffff', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                                {(part.user?.name || 'Athlete').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', fontWeight: 900, fontSize: '0.9rem' }}>
                                  {part.user?.name || 'Athlete'} {isUser && '(You)'}
                                </strong>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                                  Status: {part.status}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 900, color: '#2563eb', fontSize: '1rem' }}>
                                {Number(part.progress_value || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ {ch.target_val.toLocaleString()}</span>
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>{pct}% complete</span>
                            </div>
                          </div>

                          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: idx === 0 ? '#ca8a04' : '#2563eb', transition: 'width 0.3s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: CREATE CHALLENGE FORM */}
      {tab === 'create' && (
        <div className="card p-6" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
            ⚔️ Start a New Friend Challenge
          </h2>

          <form onSubmit={handleCreateChallenge} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
                CHALLENGE NAME
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 70K Step Shred Battle"
                required
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
                  CHALLENGE TYPE
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setType(newType);
                    setTargetVal(newType === 'step' ? 70000 : newType === 'streak' ? 14 : 20);
                  }}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                >
                  <option value="step">👟 Step Challenge</option>
                  <option value="streak">🔥 Streak Battle</option>
                  <option value="workout">🏋️ Workout Challenge</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
                  TARGET VALUE ({type === 'step' ? 'Steps' : type === 'streak' ? 'Days' : 'Workouts'})
                </label>
                <input
                  type="number"
                  value={targetVal}
                  onChange={(e) => setTargetVal(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
                DURATION (DAYS)
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              >
                <option value={3}>3 Days Sprint</option>
                <option value={7}>7 Days Week Battle</option>
                <option value={14}>14 Days Challenge</option>
                <option value={30}>30 Days Monthly Challenge</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                INVITE FRIENDS ({selectedFriends.length} selected)
              </label>

              {friends.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  No connected friends yet. Add friends on the Friends page to invite them!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {friends.map((f) => {
                    const isSelected = selectedFriends.includes(f.user_id);

                    return (
                      <div
                        key={f.user_id}
                        onClick={() => toggleFriendSelection(f.user_id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.8rem',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSelected ? '#dbeafe' : '#f8fafc',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                            {(f.name || 'Friend').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{f.name}</span>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#2563eb' }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.85rem',
                background: '#ca8a04',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(202, 138, 4, 0.2)'
              }}
            >
              ⚔️ Launch Challenge Battle
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
