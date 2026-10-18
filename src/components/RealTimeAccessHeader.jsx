import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ShieldCheck, Globe, Activity, X, RefreshCw, Zap } from 'lucide-react';
import db, { getAccessLogs } from '../services/db.js';

export default function RealTimeAccessHeader({ user }) {
  const [time, setTime] = useState(new Date());
  const [use24Hour, setUse24Hour] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [accessHistory, setAccessHistory] = useState([]);

  // Live timer interval updating every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setSessionElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  useEffect(() => {
    if (user && user.user_id) {
      const logs = getAccessLogs(user.user_id);
      setAccessHistory(logs);
    }
  }, [user, showModal]);

  // Format Time
  const hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  let timeString = '';

  if (use24Hour) {
    timeString = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
  } else {
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    timeString = `${String(displayHours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
  }

  // Format Date for Pill Display: "(Mon, Sep 28)"
  const dateFormatted = `(${time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })})`;

  // Full Date String for modal
  const fullDateString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  const tzOffset = -time.getTimezoneOffset() / 60;
  const tzFormatted = `UTC${tzOffset >= 0 ? '+' : ''}${tzOffset}`;
  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <>
      {/* Live Date & Time Pill Display */}
      <div 
        onClick={() => setShowModal(true)}
        className="live-time-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: '#ffffff',
          borderRadius: '9999px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
        title="Click for Real-Time Access & Details"
      >
        <Clock 
          size={17} 
          color="#3b82f6" 
          strokeWidth={2.2} 
          style={{ flexShrink: 0 }} 
        />
        <span 
          style={{
            fontWeight: 700,
            fontSize: '14.5px',
            color: '#0f172a',
            letterSpacing: '-0.01em',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {timeString}
        </span>
        <span 
          style={{
            fontWeight: 400,
            fontSize: '14.5px',
            color: '#64748b',
            letterSpacing: '0'
          }}
        >
          {dateFormatted}
        </span>
      </div>

      {/* ACCESS & REAL-TIME DETAILS MODAL */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            padding: '16px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1822',
              border: '1px solid #332e3d',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxWidth: '520px',
              width: '100%',
              overflow: 'hidden',
              color: '#fce4d6'
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#211f29] border-b border-[#332e3d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fce4d6]/10 text-[#fce4d6] flex items-center justify-center font-bold text-lg">
                  ⏰
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#fce4d6] leading-tight">
                    Real-Time System Clock
                  </h3>
                  <p className="text-xs text-[#fce4d6]/70">
                    Live Clock, Timezone & Authenticated Access Logs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#2a2735] text-[#fce4d6] hover:bg-[#332e3d] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* BIG REAL TIME DIGITAL CLOCK CARD MATCHING IMAGE THEME */}
              <div className="bg-[#211f29] text-[#fce4d6] rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden border border-[#332e3d]">
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setUse24Hour(!use24Hour); }}
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-[#2e2a3b] text-[#fce4d6] border border-[#443e52] hover:bg-[#3a354a] transition-all"
                  >
                    {use24Hour ? '24H' : '12H'}
                  </button>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    SYNCED
                  </span>
                </div>

                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#fce4d6]/60 mb-2">
                  CURRENT REAL-TIME DISPLAY
                </div>
                <div 
                  className="font-mono tabular-nums text-4xl sm:text-5xl font-black tracking-wide text-[#fce4d6] drop-shadow"
                  style={{ lineHeight: 0.95, margin: '4px 0 0 0' }}
                >
                  {timeString}
                </div>
                <div 
                  className="text-base sm:text-lg font-semibold text-[#fce4d6] tracking-wide"
                  style={{ 
                    fontFamily: '"Comic Sans MS", "Comic Neue", "Fredoka", "Quicksand", cursive, sans-serif',
                    lineHeight: 1,
                    marginTop: '-4px'
                  }}
                >
                  {fullDateString}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>{timezone} ({tzFormatted})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Session: {formatElapsed(sessionElapsed)}</span>
                  </div>
                </div>
              </div>

              {/* CURRENT ACCESS PROFILE SUMMARY */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Access Authenticated As</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {user?.name || 'Authorized Member'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 uppercase">
                    {user?.role === 'owner' ? '👑 GYM OWNER' :
                     user?.role === 'dietician' ? '🥗 GYM DIETICIAN' :
                     user?.role === 'consultant' ? '💼 GYM CONSULTANT' :
                     (user?.role === 'gym_master' || user?.role === 'admin') ? '👑 GYM MASTER' :
                     (user?.role || 'MEMBER')}
                  </span>
                </div>
              </div>

              {/* RECENT SYSTEM ACCESS LOGS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Recent Access Timestamps
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Real-Time Audit</span>
                </div>

                <div className="space-y-2">
                  {accessHistory.length > 0 ? (
                    accessHistory.slice(0, 5).map((log, index) => (
                      <div
                        key={log.access_id || index}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {log.event_type || 'Authenticated Access'}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {log.date_formatted} at {log.time_formatted}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {log.timezone || 'Local'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                      No prior access logs recorded for this session yet.
                    </div>
                  )}
                </div>
              </div>

              {/* WORLD CLOCKS MINI COMPARISON */}
              <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-xs">
                <div className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  World Reference Clocks
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-amber-200/40 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">UTC / GMT</div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-amber-200/40 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">NEW YORK (EST)</div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-amber-200/40 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400">LONDON (BST)</div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                System Time Auto-Sync Active
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
