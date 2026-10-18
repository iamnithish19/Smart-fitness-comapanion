import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';
import { formatCurrency, getSavedCurrency, saveCurrency } from '../services/currencyService.js';

export default function GymMasterMemberships({ currentUser, onRefresh }) {
  const [plans, setPlans] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [notification, setNotification] = useState('');
  const [currency, setCurrency] = useState(getSavedCurrency());

  const refreshData = () => {
    setPlans(db.getAll('membershipPlans'));
    setMemberships(db.getAll('memberMemberships'));
    setUsers(db.getAll('users'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleAssignMembership = (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedPlan) return;

    const plan = plans.find((p) => Number(p.plan_id) === Number(selectedPlan));
    const u = users.find((usr) => Number(usr.user_id) === Number(selectedUser));

    const startDate = new Date().toISOString().slice(0, 10);
    const expDateObj = new Date();
    expDateObj.setDate(expDateObj.getDate() + (plan?.duration?.includes('Year') ? 365 : 30));
    const expiryDate = expDateObj.toISOString().slice(0, 10);

    const newM = db.insert('memberMemberships', {
      user_id: Number(selectedUser),
      plan_id: Number(selectedPlan),
      start_date: startDate,
      expiry_date: expiryDate,
      amount: Number(plan?.price || 59),
      payment_status: paymentStatus,
      renewal_date: expiryDate
    });

    db.insert('payments', {
      user_id: Number(selectedUser),
      membership_id: newM.membership_id,
      amount: Number(plan?.price || 59),
      method: 'Credit Card',
      status: paymentStatus,
      date: startDate
    });

    db.sendNotification(selectedUser, '💳 Membership Updated', `Your gym membership has been updated to "${plan?.name}".`, 'membership');

    showToast(`✅ Membership "${plan?.name}" assigned to ${u?.name}!`);
    setShowAssignModal(false);
    refreshData();
    if (onRefresh) onRefresh();
  };

  const activeCount = memberships.filter((m) => m.payment_status === 'Paid').length;
  const pendingCount = memberships.filter((m) => m.payment_status === 'Pending').length;
  const totalRev = memberships.reduce((sum, m) => sum + (m.payment_status === 'Paid' ? Number(m.amount || 0) : 0), 0);

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
            GYM MANAGEMENT & BILLING
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Memberships & Billing Plans
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Manage gym membership plans, active member subscriptions, and payment statuses.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setCurrency('INR');
                saveCurrency('INR');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '0.78rem',
                background: currency === 'INR' ? '#16a34a' : 'transparent',
                color: currency === 'INR' ? '#ffffff' : '#64748b',
                boxShadow: currency === 'INR' ? '0 1px 4px rgba(22, 163, 74, 0.3)' : 'none'
              }}
            >
              ₹ INR
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrency('USD');
                saveCurrency('USD');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '0.78rem',
                background: currency === 'USD' ? '#2563eb' : 'transparent',
                color: currency === 'USD' ? '#ffffff' : '#64748b',
                boxShadow: currency === 'USD' ? '0 1px 4px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              $ USD
            </button>
          </div>

          <button
            onClick={() => {
              if (users.length) setSelectedUser(String(users[0].user_id));
              if (plans.length) setSelectedPlan(String(plans[0].plan_id));
              setShowAssignModal(true);
            }}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#ca8a04',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            💳 Assign / Extend Membership
          </button>
        </div>
      </header>

      {/* OVERVIEW STAT CARDS */}
      <div className="grid grid-3 gap-3 mb-6">
        <div className="card text-center p-4" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase' }}>ACTIVE MEMBERSHIPS</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#16a34a', margin: '0.3rem 0' }}>
            {activeCount} Members
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>● Subscriptions Active</div>
        </div>

        <div className="card text-center p-4" style={{ borderRadius: '14px', border: '1px solid #fef08a', background: '#fef9c3', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#854d0e', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase' }}>PENDING PAYMENTS</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ca8a04', margin: '0.3rem 0' }}>
            {pendingCount} Pending
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#854d0e' }}>Requires Billing Attention</div>
        </div>

        <div className="card text-center p-4" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase' }}>TOTAL COLLECTED REVENUE</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#2563eb', margin: '0.3rem 0' }}>
            {formatCurrency(totalRev, currency)}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>All-Time Membership Revenue</div>
        </div>
      </div>

      {/* MEMBERSHIP PLANS GRID */}
      <div className="mb-6">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
          🏷️ Available Gym Membership Tier Plans
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {plans.map((p) => (
            <div
              key={p.plan_id}
              className="card p-5"
              style={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ca8a04', textTransform: 'uppercase' }}>
                  {p.duration}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
                  {p.name}
                </h3>

                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', margin: '0.5rem 0' }}>
                  {formatCurrency(p.price, currency)} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>/ {p.duration}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.85rem' }}>
                  {(p.features || []).map((feat, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: '#16a34a' }}>✓</span> {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MEMBER SUBSCRIPTIONS LIST TABLE */}
      <div className="card p-5" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
          📋 Active Member Subscriptions & Status
        </h2>

        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>MEMBER</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>PLAN</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>START DATE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>EXPIRY DATE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>AMOUNT ({currency === 'INR' ? '₹ INR' : '$ USD'})</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 900, color: '#475569' }}>PAYMENT STATUS</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => {
              const u = users.find((usr) => Number(usr.user_id) === Number(m.user_id));
              const p = plans.find((pl) => Number(pl.plan_id) === Number(m.plan_id));

              return (
                <tr key={m.membership_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                      {(u?.name || 'Member').charAt(0).toUpperCase()}
                    </div>
                    <strong style={{ fontWeight: 900, color: '#0f172a' }}>{u?.name || 'Member'}</strong>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#2563eb' }}>{p?.name || 'Membership'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 700 }}>{m.start_date}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 700 }}>{m.expiry_date}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 900, color: '#0f172a' }}>{formatCurrency(m.amount, currency)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        background: m.payment_status === 'Paid' ? '#dcfce7' : '#fef9c3',
                        color: m.payment_status === 'Paid' ? '#166534' : '#854d0e',
                        textTransform: 'uppercase'
                      }}
                    >
                      {m.payment_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ASSIGN / EXTEND MEMBERSHIP MODAL */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                💳 Assign Membership
              </h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAssignMembership} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>SELECT MEMBER</label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>SELECT MEMBERSHIP PLAN</label>
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  {plans.map((p) => (
                    <option key={p.plan_id} value={p.plan_id}>{p.name} - {formatCurrency(p.price, currency)} / {p.duration}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>PAYMENT STATUS</label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', background: '#ca8a04' }}>Confirm Membership</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
