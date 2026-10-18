import React, { useState } from 'react';

export default function CommunityLeaderboard({ rankings = [], currentUser, users = [], healthTrackers = [] }) {
  const [tab, setTab] = useState('steps');

  // Build dynamically synced rankings list including all registered users
  const rawList = [...rankings];

  // Map and clean raw rankings to remove any pre-existing "(You)" tags
  let masterList = rawList.map((r) => ({
    ...r,
    name: (r.name || '').replace(/\s*\(You\)$/gi, '').trim()
  }));

  if (users && users.length) {
    users.forEach((u) => {
      const cleanUserName = (u.name || '').replace(/\s*\(You\)$/gi, '').trim();

      const existingIdx = masterList.findIndex(
        (r) => r.user_id === u.user_id || r.name.toLowerCase() === cleanUserName.toLowerCase()
      );

      // Latest step count for this user
      const userSteps = healthTrackers
        ? healthTrackers.filter((h) => h.user_id === u.user_id).slice(-1)[0]?.steps || (u.user_id === currentUser?.user_id ? 10230 : 8500)
        : 9000;

      if (existingIdx >= 0) {
        masterList[existingIdx] = {
          ...masterList[existingIdx],
          user_id: u.user_id,
          name: cleanUserName,
          role: u.role || masterList[existingIdx].role,
          avatar: u.avatar || masterList[existingIdx].avatar,
          steps: Math.max(masterList[existingIdx].steps || 0, userSteps)
        };
      } else {
        masterList.push({
          rank: masterList.length + 1,
          user_id: u.user_id,
          name: cleanUserName,
          role: u.role || 'member',
          steps: userSteps,
          points: 2100 + u.user_id * 150,
          badge: u.role === 'gym_master' ? 'Gym Master / Coach' : 'Fitness Challenger',
          avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUserName}`
        });
      }
    });
  }

  // Sort rankings by tab (steps or points)
  const sortedRankings = masterList
    .slice()
    .sort((a, b) => (tab === 'steps' ? (b.steps || 0) - (a.steps || 0) : (b.points || 0) - (a.points || 0)))
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Identify current user row & position
  const currentCleanName = (currentUser?.name || '').replace(/\s*\(You\)$/gi, '').trim().toLowerCase();

  const currentUserRankIndex = sortedRankings.findIndex(
    (r) =>
      (currentUser && r.user_id && Number(r.user_id) === Number(currentUser.user_id)) ||
      (currentCleanName && (r.name || '').toLowerCase() === currentCleanName)
  );

  const userRankNumber = currentUserRankIndex >= 0 ? currentUserRankIndex + 1 : 2;
  const userRankEntry = currentUserRankIndex >= 0 ? sortedRankings[currentUserRankIndex] : null;

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
      <header className="page-header mb-4">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>
            Community & Leaderboards
          </h1>
          <p className="page-subtitle" style={{ color: '#475569', fontWeight: 500 }}>
            Live fitness rankings synced directly with your user profile & activity.
          </p>
        </div>
      </header>

      <div className="grid grid-3 gap-3 mb-4">
        <div className="card text-center" style={{ border: '1px solid #fef08a', background: '#fef9c3', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <span className="stat-lbl" style={{ fontWeight: 800, color: '#854d0e' }}>YOUR LEADERBOARD RANK</span>
          <div className="stat-num text-amber my-2" style={{ fontWeight: 900, fontSize: '2.2rem', color: '#ca8a04' }}>
            🏆 #{userRankNumber}
          </div>
          <span className="badge badge-accent" style={{ fontWeight: 800, background: '#ca8a04', color: '#ffffff' }}>
            {currentUser?.role === 'gym_master' ? '👑 Gym Master' : userRankEntry?.badge || 'Consistency Champion'}
          </span>
        </div>

        <div className="card text-center" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <span className="stat-lbl" style={{ fontWeight: 800, color: '#64748b' }}>WEEKLY COMMUNITY POINTS</span>
          <div className="stat-num text-cyan my-2" style={{ fontWeight: 900, fontSize: '2.2rem', color: '#2563eb' }}>
            {userRankEntry ? `${userRankEntry.points.toLocaleString()} pts` : '2,410 pts'}
          </div>
          <span className="stat-lbl" style={{ color: '#475569' }}>+350 pts from yesterday</span>
        </div>

        <div className="card text-center" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <span className="stat-lbl" style={{ fontWeight: 800, color: '#64748b' }}>ACTIVE CHALLENGE</span>
          <div className="stat-num text-emerald my-2" style={{ fontWeight: 900, fontSize: '2.2rem', color: '#16a34a' }}>70K Steps</div>
          <span className="badge badge-success" style={{ fontWeight: 800, background: '#dcfce7', color: '#166534' }}>85% Completed</span>
        </div>
      </div>

      <div className="card mb-4" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
        <div className="flex-between align-center mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              🏆 Weekly Fitness Leaderboard
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>
              ● Live names & user profile sync enabled
            </span>
          </div>

          {/* Cleanly Aligned Light Option Buttons Group */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              background: '#f1f5f9',
              padding: '0.35rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              alignItems: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => setTab('steps')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: tab === 'steps' ? '#2563eb' : 'transparent',
                color: tab === 'steps' ? '#ffffff' : '#475569',
                boxShadow: tab === 'steps' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>👟</span> Step Leaders
            </button>
            <button
              type="button"
              onClick={() => setTab('points')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: tab === 'points' ? '#2563eb' : 'transparent',
                color: tab === 'points' ? '#ffffff' : '#475569',
                boxShadow: tab === 'points' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>⭐</span> Points Ranks
            </button>
          </div>
        </div>

        <div className="rankings-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {sortedRankings.map((userRank) => {
            const rowCleanName = (userRank.name || '').replace(/\s*\(You\)$/gi, '').trim();

            const isCurrentUser = Boolean(
              currentUser && (
                (userRank.user_id && Number(userRank.user_id) === Number(currentUser.user_id)) ||
                (currentCleanName && rowCleanName.toLowerCase() === currentCleanName)
              )
            );

            const isGymMaster = userRank.role === 'gym_master' || (isCurrentUser && currentUser?.role === 'gym_master');

            const displayName = isCurrentUser ? `${rowCleanName} (You)` : rowCleanName;
            const displayAvatar = isCurrentUser
              ? currentUser.avatar || userRank.avatar
              : userRank.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${rowCleanName}`;

            return (
              <div
                key={userRank.user_id || userRank.rank}
                className="rank-row flex-between align-center"
                style={{
                  padding: '1rem 1.25rem',
                  border: isCurrentUser
                    ? '2.5px solid #2563eb'
                    : isGymMaster
                    ? '1.5px solid #fef08a'
                    : '1px solid #e2e8f0',
                  background: isCurrentUser
                    ? '#dbeafe'
                    : isGymMaster
                    ? '#fef9c3'
                    : '#ffffff',
                  borderRadius: '14px',
                  boxShadow: isCurrentUser
                    ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                    : '0 2px 6px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <div className="flex-gap align-center" style={{ gap: '1.25rem' }}>
                  {/* Rank Badge */}
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: '1.25rem',
                      minWidth: '40px',
                      color: isCurrentUser
                        ? '#1e40af'
                        : userRank.rank === 1
                        ? '#ca8a04'
                        : userRank.rank === 2
                        ? '#64748b'
                        : userRank.rank === 3
                        ? '#b45309'
                        : '#0f172a'
                    }}
                  >
                    #{userRank.rank}
                  </span>

                  {/* Avatar */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isCurrentUser ? '#2563eb' : isGymMaster ? '#ca8a04' : '#10b981',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                      boxShadow: isCurrentUser ? '0 2px 8px rgba(37,99,235,0.3)' : 'none'
                    }}
                  >
                    {(displayName || 'Athlete').charAt(0).toUpperCase()}
                  </div>

                  {/* User Name & Role Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {/* DISPLAY NAME IN BOLD BLACK FONT EXCEPT HIGHLIGHTED CURRENT USER */}
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '1.15rem',
                          fontWeight: 900,
                          color: isCurrentUser ? '#1e40af' : '#000000',
                          letterSpacing: '0.02em'
                        }}
                      >
                        {displayName}
                      </h4>

                      {/* CLEAR ROLE TAG */}
                      {isCurrentUser ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            background: '#2563eb',
                            color: '#ffffff',
                            fontWeight: 900,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '5px',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                          }}
                        >
                          🏋️ YOU
                        </span>
                      ) : isGymMaster ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            background: '#ca8a04',
                            color: '#ffffff',
                            fontWeight: 900,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '5px',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                          }}
                        >
                          👑 GYM MASTER
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 900,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '5px',
                            textTransform: 'uppercase'
                          }}
                        >
                          🏋️ MEMBER
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        marginTop: '0.25rem',
                        display: 'inline-block',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: isCurrentUser ? '#1e3a8a' : '#64748b'
                      }}
                    >
                      {userRank.badge}
                    </span>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="text-right">
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: '1.25rem',
                      color: isCurrentUser ? '#1e40af' : '#0f172a'
                    }}
                  >
                    {tab === 'steps' ? `${userRank.steps.toLocaleString()} steps` : `${userRank.points.toLocaleString()} pts`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
