import React, { useState } from 'react';
import * as db from '../services/db.js';
import { formatCurrency, convertAmount, getSavedCurrency, saveCurrency, USD_TO_INR_RATE } from '../services/currencyService.js';

export default function RevenueDashboard({ user, currentUser, onLogout, onRefresh }) {
  const analytics = db.getRevenueAnalytics();
  const {
    totalRevenue,
    monthlyRevenue,
    yearlyRevenue,
    activeMemberships,
    pendingPaymentsCount,
    pendingPaymentsAmount,
    payments = [],
    memberships = [],
    plans = []
  } = analytics;

  const [currency, setCurrency] = useState(getSavedCurrency());
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const activeUser = user || currentUser;

  const handleConfirmDeleteOwner = () => {
    if (activeUser?.user_id) {
      db.deleteUserAccount(activeUser.user_id);
      localStorage.removeItem('sfc_auth_user_id');
      if (onLogout) {
        onLogout();
      } else {
        window.location.reload();
      }
    }
  };

  const handleCurrencyChange = (newCurr) => {
    setCurrency(newCurr);
    saveCurrency(newCurr);
  };

  // Additional Financial Criteria
  const arpu = activeMemberships > 0 ? Math.round(totalRevenue / activeMemberships) : 0;
  const totalBilled = totalRevenue + pendingPaymentsAmount;
  const collectionRate = totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 100;

  // Monthly Revenue Chart Data
  const monthlyData = [
    { month: 'Jan', amount: 1250 },
    { month: 'Feb', amount: 1480 },
    { month: 'Mar', amount: 1620 },
    { month: 'Apr', amount: 1890 },
    { month: 'May', amount: 2100 },
    { month: 'Jun', amount: 2450 },
    { month: 'Jul', amount: 2890 },
    { month: 'Aug', amount: 3420 }
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.amount));

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'PAID' && p.status === 'Paid') ||
      (statusFilter === 'PENDING' && p.status === 'Pending');

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      String(p.user_id).includes(searchLower) ||
      (p.method || '').toLowerCase().includes(searchLower) ||
      String(p.amount).includes(searchLower) ||
      String(convertAmount(p.amount, currency)).includes(searchLower) ||
      (p.date || '').toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* HEADER */}
      <header className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            👑 EXECUTIVE FINANCIAL CRITERIA MONITORING
          </div>
          <h1 className="page-title" style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0.2rem 0', color: 'var(--text)' }}>
            Financial & Revenue Telemetry
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: 'var(--text-sub)', fontSize: '0.9rem', margin: 0 }}>
            Real-time financial performance overview, revenue growth, membership yields, and billing status.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* CURRENCY TOGGLE */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--panel-alt)',
              padding: '3px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <button
              type="button"
              onClick={() => handleCurrencyChange('INR')}
              style={{
                padding: '6px 14px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: currency === 'INR' ? '#10b981' : 'transparent',
                color: currency === 'INR' ? '#ffffff' : 'var(--text-sub)',
                boxShadow: currency === 'INR' ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Indian Rupees (Exchange rate: 1 USD ≈ ₹83)"
            >
              <span>₹ INR</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 700 }}>(@₹83/$)</span>
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyChange('USD')}
              style={{
                padding: '6px 14px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: currency === 'USD' ? '#3b82f6' : 'transparent',
                color: currency === 'USD' ? '#ffffff' : 'var(--text-sub)',
                boxShadow: currency === 'USD' ? '0 2px 8px rgba(59, 130, 246, 0.35)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="USA Dollars ($)"
            >
              <span>$ USD</span>
            </button>
          </div>

          <span
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#f59e0b'
            }}
          >
            ● Live Financial Stream
          </span>

          {/* REMOVE GYM OWNER ACCOUNT BUTTON */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.15)',
              transition: 'all 0.15s ease'
            }}
            title="Delete Gym Owner account and vacate the seat"
          >
            <span>🗑️ Remove Account (Vacate Seat)</span>
          </button>
        </div>
      </header>

      {/* TOP FINANCIAL CRITERIA STAT CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* TOTAL COLLECTED REVENUE */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            background: 'var(--panel)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Collected Revenue
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#3b82f6', margin: '4px 0' }}>
            {formatCurrency(totalRevenue, currency)}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>▲ +18.4%</span>
            <span style={{ color: 'var(--text-sub)', fontWeight: 500 }}>vs prior cycle</span>
          </div>
        </div>

        {/* MONTHLY REVENUE (MRR) */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--panel) 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            This Month (MRR)
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#f59e0b', margin: '4px 0' }}>
            {formatCurrency(monthlyRevenue, currency)}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706' }}>
            Current Month Run Rate
          </div>
        </div>

        {/* AVERAGE REVENUE PER USER (ARPU) */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            background: 'var(--panel)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Average Yield / Member (ARPU)
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
            {formatCurrency(arpu, currency)}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)' }}>
            Across {activeMemberships} Active Members
          </div>
        </div>

        {/* PENDING PAYMENTS */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, var(--panel) 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Accounts Receivable
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ef4444', margin: '4px 0' }}>
            {formatCurrency(pendingPaymentsAmount, currency)}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>
            {pendingPaymentsCount} Pending Accounts
          </div>
        </div>

        {/* COLLECTION EFFICIENCY */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            background: 'var(--panel)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Collection Success Rate
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#8b5cf6', margin: '4px 0' }}>
            {collectionRate}%
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>
            {formatCurrency(totalRevenue, currency)} of {formatCurrency(totalBilled, currency)} cleared
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* CHART 1: MONTHLY REVENUE BAR CHART */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            background: 'var(--panel)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)', margin: 0 }}>
              📈 Monthly Revenue Growth ({currency === 'INR' ? '₹' : '$'})
            </h3>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)' }}>
              Fiscal Year Performance {currency === 'INR' ? '(INR converted @ ₹83/USD)' : '(USD)'}
            </span>
          </div>

          <div
            style={{
              height: '220px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px',
              paddingBottom: '12px',
              borderBottom: '2px solid var(--line)'
            }}
          >
            {monthlyData.map((d) => {
              const heightPct = Math.round((d.amount / maxVal) * 100);

              return (
                <div
                  key={d.month}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#3b82f6', marginBottom: '4px' }}>
                    {formatCurrency(d.amount, currency)}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(to top, #2563eb, #60a5fa)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-sub)', marginTop: '8px' }}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 2: MEMBERSHIP TIER REVENUE DISTRIBUTION */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            background: 'var(--panel)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)', margin: 0 }}>
              📊 Membership Tier Distribution
            </h3>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)' }}>
              Pricing & Member Share
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plans.map((p, idx) => {
              const count = memberships.filter((m) => Number(m.plan_id) === Number(p.plan_id)).length;
              const pct = memberships.length > 0 ? Math.round((count / memberships.length) * 100) : 25;
              const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
              const planRevenueEst = count * Number(p.price || 0);

              return (
                <div key={p.plan_id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: 'var(--text)',
                      marginBottom: '6px'
                    }}
                  >
                    <span>
                      {p.name} <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>({formatCurrency(p.price, currency)}/{p.duration})</span>
                    </span>
                    <span style={{ color: colors[idx % colors.length] }}>
                      {count} Members ({formatCurrency(planRevenueEst, currency)}/mo)
                    </span>
                  </div>
                  <div style={{ height: '10px', background: 'var(--panel-alt)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: colors[idx % colors.length],
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS LIST TABLE */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--line)',
          background: 'var(--panel)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 4px 0' }}>
              💳 Financial Transaction Ledger
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>
              Showing {filteredPayments.length} of {payments.length} transactions
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* SEARCH */}
            <input
              type="text"
              placeholder="🔎 Search by member, method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--panel-alt)',
                color: 'var(--text)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />

            {/* FILTER BUTTONS */}
            <div style={{ display: 'flex', background: 'var(--panel-alt)', borderRadius: '10px', padding: '3px', border: '1px solid var(--line)' }}>
              {['ALL', 'PAID', 'PENDING'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: statusFilter === f ? 'var(--panel)' : 'transparent',
                    color: statusFilter === f ? 'var(--text)' : 'var(--text-sub)',
                    boxShadow: statusFilter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--panel-alt)', textAlign: 'left', borderBottom: '2px solid var(--line)' }}>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-sub)' }}>DATE</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-sub)' }}>MEMBER ID</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-sub)' }}>PAYMENT METHOD</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-sub)' }}>AMOUNT ({currency === 'INR' ? '₹ INR' : '$ USD'})</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-sub)' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.payment_id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-sub)', fontSize: '0.88rem' }}>
                    {p.date}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text)', fontSize: '0.88rem' }}>
                    Member #{p.user_id}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-sub)', fontSize: '0.88rem' }}>
                    {p.method || 'Credit Card'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 900, color: '#3b82f6', fontSize: '0.95rem' }}>
                    {formatCurrency(p.amount, currency)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        background: p.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: p.status === 'Paid' ? '#10b981' : '#eab308',
                        border: p.status === 'Paid' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)'
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)', fontWeight: 600 }}>
                    No payment transactions matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE GYM OWNER ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: 'var(--panel)',
              borderRadius: '20px',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  flexShrink: 0
                }}
              >
                👑
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                  Remove Gym Owner Account
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 800 }}>
                  Single Gym Owner Rule & Seat Vacancy
                </span>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                marginBottom: '22px'
              }}
            >
              <p style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete your account (<strong>{activeUser?.name || activeUser?.email}</strong>)?
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.55 }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  🔒 <strong>Single-Occupancy Rule:</strong> Right now, no other user can become Gym Owner because you are registered as the active Gym Owner.
                </p>
                <p style={{ margin: 0 }}>
                  🟢 <strong>Vacating the Seat:</strong> Deleting your account will immediately <strong>VACATE</strong> the Gym Owner seat. Once removed, <strong>anyone</strong> can register and become the new Gym Owner!
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: 'var(--panel-alt)',
                  color: 'var(--text)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOwner}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
                }}
              >
                Yes, Delete Account & Vacate Seat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
