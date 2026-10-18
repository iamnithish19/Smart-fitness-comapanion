import React, { useState, useEffect, useRef } from 'react';
import * as db from '../services/db.js';

export default function MessagingSystem({ currentUser, onRefresh }) {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const refreshConversations = () => {
    const allUsers = db.getAll('users');
    const allMsgs = db.getAll('messages');

    // Filter available chat contacts based on role
    // Members can message assigned trainer or gym masters
    // Trainers / Masters can message all members
    const contacts = allUsers.filter((u) => Number(u.user_id) !== Number(currentUser?.user_id));

    const convList = contacts.map((u) => {
      const convMsgs = allMsgs
        .filter(
          (m) =>
            (Number(m.sender_id) === Number(currentUser?.user_id) && Number(m.receiver_id) === Number(u.user_id)) ||
            (Number(m.sender_id) === Number(u.user_id) && Number(m.receiver_id) === Number(currentUser?.user_id))
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const lastMsg = convMsgs[convMsgs.length - 1];
      const unreadCount = convMsgs.filter((m) => Number(m.receiver_id) === Number(currentUser?.user_id) && !m.read).length;

      return {
        user: u,
        lastMsg,
        unreadCount
      };
    });

    setConversations(convList);

    if (!selectedUser && convList.length > 0) {
      setSelectedUser(convList[0].user);
    }
  };

  useEffect(() => {
    refreshConversations();
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      const conv = db.getConversation(currentUser.user_id, selectedUser.user_id);
      setMessages(conv);

      // Mark unread messages in this conversation as read
      conv.forEach((m) => {
        if (Number(m.receiver_id) === Number(currentUser.user_id) && !m.read) {
          db.update('messages', m.msg_id, { read: true });
        }
      });

      if (onRefresh) onRefresh();
    }
  }, [selectedUser, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || !currentUser) return;

    db.sendMessage(currentUser.user_id, selectedUser.user_id, inputText.trim());
    setInputText('');
    const conv = db.getConversation(currentUser.user_id, selectedUser.user_id);
    setMessages(conv);
    refreshConversations();
    if (onRefresh) onRefresh();
  };

  const filteredConversations = conversations.filter((c) =>
    (c.user.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <header className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase' }}>
            COMMUNICATION PORTAL
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Trainer ↔ Member Messaging
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Direct messaging system between gym members, trainers, and coaches.
          </p>
        </div>
      </header>

      {/* CHAT CONTAINER GRID */}
      <div
        className="card p-0 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          minHeight: '560px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}
      >
        {/* LEFT SIDEBAR: CONVERSATION LIST */}
        <div style={{ borderRight: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <input
              type="text"
              placeholder="Search members or trainers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                No contacts found.
              </div>
            ) : (
              filteredConversations.map(({ user: u, lastMsg, unreadCount }) => {
                const isSelected = selectedUser && Number(selectedUser.user_id) === Number(u.user_id);

                return (
                  <div
                    key={u.user_id}
                    onClick={() => setSelectedUser(u)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: isSelected ? '#ffffff' : 'transparent',
                      borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                        {(u.name || 'User').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMsg ? lastMsg.text : `${
                            u.role === 'owner' ? '👑 Owner' :
                            u.role === 'dietician' ? '🥗 Dietician' :
                            u.role === 'consultant' ? '💼 Consultant' :
                            (u.role === 'gym_master' || u.role === 'admin') ? '👑 Master' :
                            u.role === 'trainer' ? '🏋️ Trainer' : '🏋️ Member'
                          }`}
                        </span>
                      </div>
                    </div>

                    {unreadCount > 0 && (
                      <span
                        style={{
                          background: '#ca8a04',
                          color: '#ffffff',
                          borderRadius: '12px',
                          padding: '0.15rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 900
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        {selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* CHAT HEADER */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#ffffff' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ca8a04', color: '#ffffff', fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                {(selectedUser.name || 'User').charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', display: 'block' }}>{selectedUser.name}</strong>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800 }}>
                  ● Active • {
                    selectedUser.role === 'owner' ? '👑 Gym Owner' :
                    selectedUser.role === 'dietician' ? '🥗 Gym Dietician' :
                    selectedUser.role === 'consultant' ? '💼 Gym Consultant' :
                    (selectedUser.role === 'gym_master' || selectedUser.role === 'admin') ? '👑 Gym Master' :
                    selectedUser.role === 'trainer' ? '🏋️ Personal Trainer' : '🏋️ Gym Member'
                  }
                </span>
              </div>
            </div>

            {/* MESSAGES LIST */}
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, margin: 'auto' }}>
                  No previous messages with {selectedUser.name}. Send a message to start conversing!
                </div>
              ) : (
                messages.map((m) => {
                  const isSelf = Number(m.sender_id) === Number(currentUser.user_id);
                  const formattedTime = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={m.msg_id}
                      style={{
                        alignSelf: isSelf ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isSelf ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          background: isSelf ? '#2563eb' : '#ffffff',
                          color: isSelf ? '#ffffff' : '#0f172a',
                          padding: '0.75rem 1rem',
                          borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          border: isSelf ? 'none' : '1px solid #e2e8f0',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          lineHeight: 1.45
                        }}
                      >
                        {m.text}
                      </div>

                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>{formattedTime}</span>
                        {isSelf && <span>{m.read ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT FORM */}
            <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder={`Write a message to ${selectedUser.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                }}
              >
                Send 💬
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700 }}>
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
