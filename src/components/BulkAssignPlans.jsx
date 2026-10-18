import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';

export default function BulkAssignPlans({ currentUser, onRefresh }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const tmpls = db.getAll('workoutTemplates');
    const users = db.getAll('users');
    const memberUsers = users.filter((u) => u.role !== 'gym_master');

    setTemplates(tmpls);
    setMembers(memberUsers);
    if (tmpls.length > 0) {
      setSelectedTemplateId(String(tmpls[0].template_id));
    }
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredMembers = members.filter(
    (m) =>
      (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMemberIds(filteredMembers.map((m) => m.user_id));
    } else {
      setSelectedMemberIds([]);
    }
  };

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = (e) => {
    e.preventDefault();
    if (!selectedTemplateId || selectedMemberIds.length === 0) return;

    const assigned = db.bulkAssignTemplate(selectedTemplateId, selectedMemberIds, currentUser?.user_id || 2);
    showToast(`Workout plan successfully assigned to ${assigned.length} members.`);
    setSelectedMemberIds([]);
    if (onRefresh) onRefresh();
  };

  const selectedTemplate = templates.find((t) => Number(t.template_id) === Number(selectedTemplateId));
  const isAllSelected = filteredMembers.length > 0 && filteredMembers.every((m) => selectedMemberIds.includes(m.user_id));

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
            BULK OPERATIONS
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Bulk Workout Plan Assignment
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Assign workout templates to multiple gym members simultaneously in a single click.
          </p>
        </div>
      </header>

      <form onSubmit={handleBulkAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* TEMPLATE SELECTION CARD */}
        <div className="card p-5" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
            1. Select Workout Plan Template
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                TEMPLATE
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}
              >
                {templates.map((t) => (
                  <option key={t.template_id} value={t.template_id}>
                    {t.name} ({t.goal})
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                <strong style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 900, display: 'block' }}>
                  {selectedTemplate.name}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Goal: <strong>{selectedTemplate.goal}</strong> • Duration: <strong>{selectedTemplate.duration_weeks} weeks</strong> • Difficulty: <strong>{selectedTemplate.difficulty}</strong>
                </span>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#475569' }}>
                  {selectedTemplate.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MEMBER SELECTION TABLE CARD */}
        <div className="card p-5" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div className="flex-between align-center flex-wrap gap-2 mb-4">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              2. Select Gym Members ({selectedMemberIds.length} of {filteredMembers.length} selected)
            </h2>

            <input
              type="text"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '260px', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem' }}
            />
          </div>

          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem' }}>
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>MEMBER NAME</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>EMAIL</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>ROLE</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>FITNESS LEVEL</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => {
                const isSelected = selectedMemberIds.includes(m.user_id);

                return (
                  <tr
                    key={m.user_id}
                    onClick={() => toggleMember(m.user_id)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#f0f9ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                        {(m.name || 'Member').charAt(0).toUpperCase()}
                      </div>
                      <strong style={{ fontWeight: 900, color: '#0f172a' }}>{m.name}</strong>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>{m.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 800 }}>{m.role}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>{m.fitness_level || 'Intermediate'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SUBMIT BAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={selectedMemberIds.length === 0}
            style={{
              padding: '0.9rem 2rem',
              background: selectedMemberIds.length > 0 ? '#ca8a04' : '#cbd5e1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: selectedMemberIds.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: selectedMemberIds.length > 0 ? '0 4px 15px rgba(202,138,4,0.3)' : 'none'
            }}
          >
            🚀 Assign Workout Plan ({selectedMemberIds.length} Members Selected)
          </button>
        </div>
      </form>
    </div>
  );
}
