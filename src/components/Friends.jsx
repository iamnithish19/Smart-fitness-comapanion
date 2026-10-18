import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';

export default function Friends({ currentUser, onNavigate, onRefresh }) {
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [notification, setNotification] = useState('');

  const refreshData = () => {
    const users = db.getAll('users');
    const fShips = db.getAll('friendships');
    setAllUsers(users);
    setFriendships(fShips);
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSendRequest = (toUserId) => {
    db.sendFriendRequest(currentUser.user_id, toUserId);
    showToast('👥 Friend request sent!');
    refreshData();
    if (onRefresh) onRefresh();
  };

  const handleRespondRequest = (friendshipId, accept) => {
    db.respondFriendRequest(friendshipId, accept);
    showToast(accept ? '✅ Friend request accepted!' : '✕ Request declined.');
    refreshData();
    if (onRefresh) onRefresh();
  };

  // User's friendships
  const myFriendships = friendships.filter(
    (f) => Number(f.user_id) === Number(currentUser?.user_id) || Number(f.friend_id) === Number(currentUser?.user_id)
  );

  const pendingRequestsReceived = myFriendships.filter(
    (f) => Number(f.friend_id) === Number(currentUser?.user_id) && f.status === 'pending'
  );

  const acceptedFriendIds = myFriendships
    .filter((f) => f.status === 'accepted')
    .map((f) => (Number(f.user_id) === Number(currentUser?.user_id) ? Number(f.friend_id) : Number(f.user_id)));

  const friendsList = allUsers.filter((u) => acceptedFriendIds.includes(Number(u.user_id)));

  const otherUsers = allUsers.filter((u) => {
    const isSelf = Number(u.user_id) === Number(currentUser?.user_id);
    const isFriend = acceptedFriendIds.includes(Number(u.user_id));
    const isPending = myFriendships.some(
      (f) => (Number(f.user_id) === Number(u.user_id) || Number(f.friend_id) === Number(u.user_id)) && f.status === 'pending'
    );
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    return !isSelf && !isFriend && !isPending && matchesSearch;
  });

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      {notification && (
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
          {notification}
        </div>
      )}

      <header className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase' }}>
            COMMUNITY CONNECTIONS
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Friends & Gym Community
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Connect with gym members, view workout activity, start battles, and send direct messages.
          </p>
        </div>
      </header>

      {/* PENDING FRIEND REQUESTS SECTION */}
      {pendingRequestsReceived.length > 0 && (
        <div className="card mb-6 p-4" style={{ borderRadius: '16px', border: '2px solid #ca8a04', background: '#fef9c3' }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 900, color: '#854d0e' }}>
            📩 Pending Friend Requests ({pendingRequestsReceived.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {pendingRequestsReceived.map((req) => {
              const sender = allUsers.find((u) => Number(u.user_id) === Number(req.user_id));

              return (
                <div
                  key={req.friendship_id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fef08a',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ca8a04', color: '#ffffff', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                      {(sender?.name || 'User').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ color: '#0f172a', fontWeight: 900, fontSize: '0.95rem' }}>{sender?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{sender?.fitness_level || 'Member'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleRespondRequest(req.friendship_id, true)}
                      style={{
                        padding: '0.45rem 0.8rem',
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req.friendship_id, false)}
                      style={{
                        padding: '0.45rem 0.8rem',
                        background: '#e2e8f0',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-COLUMN LAYOUT: MY FRIENDS & DISCOVER USERS */}
      <div className="grid grid-2 gap-6">
        {/* COLUMN 1: MY FRIENDS LIST */}
        <div className="card p-5" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
            👥 Connected Friends ({friendsList.length})
          </h2>

          {friendsList.length === 0 ? (
            <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0' }}>
              No connected friends yet. Search for members on the right to send friend requests!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {friendsList.map((f) => (
                <div
                  key={f.user_id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                      {(f.name || 'Friend').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ color: '#0f172a', fontWeight: 900, fontSize: '0.95rem', display: 'block' }}>{f.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                        {f.role === 'owner' ? '👑 Owner' :
                         f.role === 'dietician' ? '🥗 Dietician' :
                         f.role === 'consultant' ? '💼 Consultant' :
                         (f.role === 'gym_master' || f.role === 'admin') ? '👑 Coach' :
                         f.role === 'trainer' ? '🏋️ Trainer' : '🏋️ Member'} • {f.fitness_level || 'Intermediate'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onNavigate && onNavigate('messages')}
                      style={{
                        padding: '0.45rem 0.75rem',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      💬 Message
                    </button>
                    <button
                      onClick={() => onNavigate && onNavigate('challenges')}
                      style={{
                        padding: '0.45rem 0.75rem',
                        background: '#ca8a04',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      ⚔️ Battle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: FIND & ADD NEW FRIENDS */}
        <div className="card p-5" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            🔍 Discover & Add Friends
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>
            Search gym members and coaches to add them to your friends list.
          </p>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, marginBottom: '1rem' }}
          />

          {otherUsers.length === 0 ? (
            <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0' }}>
              No matching users found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {otherUsers.map((u) => (
                <div
                  key={u.user_id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                      {(u.name || 'User').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ color: '#0f172a', fontWeight: 900, fontSize: '0.95rem', display: 'block' }}>{u.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                        {u.role === 'owner' ? '👑 Gym Owner' :
                         u.role === 'dietician' ? '🥗 Gym Dietician' :
                         u.role === 'consultant' ? '💼 Gym Consultant' :
                         (u.role === 'gym_master' || u.role === 'admin') ? '👑 Master Coach' :
                         u.role === 'trainer' ? '🏋️ Trainer' : '🏋️ Gym Member'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendRequest(u.user_id)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
