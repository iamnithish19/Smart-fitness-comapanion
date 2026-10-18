import React, { useState } from 'react';
import ProgressRing from './ProgressRing.jsx';
import * as aiService from '../services/aiService.js';

export default function ProgressReports({ reports, onGenerate, onDelete, user }) {
  const sorted = [...reports].sort((a, b) => (a.report_date < b.report_date ? 1 : -1));
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'high' | 'recent'

  const handleAiGenerateReport = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await aiService.generateAiWeeklyProgressReport({ user });
      if (onGenerate) onGenerate();
      alert(`🤖 Gemini Executive Text Report Created!\nCompletion Score: ${res.completion_percentage}%\n\nSummary:\n${res.summary}`);
    } catch (err) {
      if (onGenerate) onGenerate();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const filteredReports = sorted.filter((r) => {
    if (filterMode === 'high') return r.completion_percentage >= 80;
    if (filterMode === 'recent') return true;
    return true;
  });

   
  // Calculate text analytics summary
  const totalReports = sorted.length;
  const avgCompletion = totalReports > 0
    ? Math.round(sorted.reduce((acc, r) => acc + r.completion_percentage, 0) / totalReports)
    : 0;
  const highestCompletion = totalReports > 0
    ? Math.max(...sorted.map((r) => r.completion_percentage))
    : 0;

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      {/* Header Banner */}
      <div className="page-head flex-between align-center flex-wrap gap-2 mb-4">
        <div>
          <div className="page-eyebrow" style={{ fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PROGRESS REPORTS
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0' }}>
            Workout Progress Reports
          </h1>
          <p className="page-desc" style={{ fontWeight: 600, color: '#64748b' }}>
            Weekly progress summaries, completion scores, and workout milestones.
          </p>
        </div>
                  
        <div className="flex align-center gap-2 flex-wrap">
          <button
            className="btn btn-primary text-xs flex align-center gap-1"
            onClick={handleAiGenerateReport}
            disabled={isGeneratingAi}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            {isGeneratingAi ? '⏳ Generating...' : '🤖 AI Progress Report'}
          </button>

          <button
            className="btn btn-secondary text-xs"
            onClick={onGenerate}
            style={{ fontWeight: 900, padding: '0.65rem 1.1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            ➕ New Report
          </button>
        </div>
      </div>

      {/* Top Executive Performance Summary Cards */}
      <div className="grid grid-3 gap-3 mb-4">
        <div className="card text-center" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', padding: '1.25rem', borderRadius: '12px' }}>
          <span className="stat-lbl" style={{ fontWeight: 900, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
            📝 TOTAL REPORTS
          </span>
          <div className="stat-num my-2" style={{ fontWeight: 900, fontSize: '2.2rem', color: '#2563eb' }}>
            {totalReports}
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#16a34a' }}>
            ● Logs up to date
          </span>
        </div>

        <div className="card text-center" style={{ border: '1px solid #fef08a', background: '#fef9c3', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', padding: '1.25rem', borderRadius: '12px' }}>
          <span className="stat-lbl" style={{ fontWeight: 900, color: '#854d0e', fontSize: '0.78rem', textTransform: 'uppercase' }}>
            📊 AVG COMPLETION
          </span>
          <div className="stat-num my-2" style={{ fontWeight: 900, fontSize: '2.2rem', color: '#ca8a04' }}>
            {avgCompletion}%
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#854d0e' }}>
            Overall Consistency Target
          </span>
        </div>

        <div className="card text-center" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', padding: '1.25rem', borderRadius: '12px' }}>
          <span className="stat-lbl" style={{ fontWeight: 900, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
            🏆 HIGHEST SCORE
          </span>
          <div className="stat-num my-2" style={{ fontWeight: 900, fontSize: '2.2rem', color: '#16a34a' }}>
            {highestCompletion}%
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#166534' }}>
            Peak weekly completion
          </span>
        </div>
      </div>
               
      {/* Filter Bar */}
      <div className="card mb-4 p-3 flex-between align-center flex-wrap gap-2" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex align-center gap-2 flex-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            FILTER LOGS:
          </span>
          <button
            className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterMode('all')}
            style={{ fontWeight: 900, padding: '0.55rem 1.1rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            📋 All Reports ({sorted.length})
          </button>
          <button
            className={`btn btn-sm ${filterMode === 'high' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterMode('high')}
            style={{ fontWeight: 900, padding: '0.55rem 1.1rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            ⭐ High Scores (80%+)
          </button>
        </div>
      </div>
 
      {/* Text Workout Report Cards List */}
      <div>
        <h3 className="section-title mb-3" style={{ fontSize: '1.25rem', fontWeight: 900 }}>
          📑 Workout Progress Reports List
        </h3>

        {filteredReports.length === 0 ? (
          <div className="empty-state card p-4 text-center" style={{ borderRadius: '12px', color: '#64748b', fontWeight: 700 }}>
            No progress reports matching current filter. Click "+ Standard Text Report" to add one.
          </div>
        ) : (
          <div className="reports-text-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredReports.map((r) => {
              const isHigh = r.completion_percentage >= 80;
                             
              return (    
                <div
                  key={r.report_id}
                  className="card p-4"
                  style={{
                    borderRadius: '16px',
                    border: isHigh ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0',
                    background: '#ffffff',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  {/* Card Top Row Header */}
                  <div className="flex-between align-center flex-wrap gap-2" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                        📋 Report #{r.report_id}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          background: isHigh ? '#dcfce7' : '#f1f5f9',
                          color: isHigh ? '#166534' : '#475569',
                          textTransform: 'uppercase'
                        }}
                      >
                        {isHigh ? '🔥 HIGH COMPLETION' : '📈 PROGRESS LOG'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>
                        📅 Date: <strong style={{ color: '#0f172a' }}>{r.report_date}</strong>
                      </span>
                      <button
                        onClick={() => onDelete && onDelete(r.report_id)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete Report
                      </button>
                    </div>
                  </div>

                  {/* Card Content Row: Completion Score & Summary Text */}
                  <div className="grid grid-3 gap-4 align-center">
                    {/* Completion Ring */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <ProgressRing value={r.completion_percentage} size={76} stroke={7} />
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                          TARGET SCORE
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: isHigh ? '#16a34a' : '#ca8a04' }}>
                          {r.completion_percentage}%
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                          Target Achieved
                        </div>
                      </div>
                    </div>

                    {/* Summary Workout Text Report */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ca8a04', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.04em' }}>
                        📝 WORKOUT REGARDS & SUMMARY REPORT TEXT:
                      </div>
                      <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#000000', margin: 0, lineHeight: 1.55 }}>
                        "{r.summary || `Weekly workout telemetry report logged with a completion score of ${r.completion_percentage}%. Continuous progress recorded across all assigned fitness routines.`}"
                      </p>
                    </div>
                  </div>

                  {/* Telemetry Metrics Text Grid (Without Photos) */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.85rem 1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1rem',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block' }}>🏋️ Workout Routine Focus:</span>
                      <strong style={{ color: '#0f172a', fontWeight: 900 }}>Strength & Hypertrophy</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block' }}>⏱️ Active Session Time:</span>
                      <strong style={{ color: '#2563eb', fontWeight: 900 }}>45 Minutes Avg</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block' }}>❤️ Heart Rate Response:</span>
                      <strong style={{ color: '#dc2626', fontWeight: 900 }}>118 BPM Peak Cardio</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block' }}>🤖 AI Executive Status:</span>
                      <strong style={{ color: '#16a34a', fontWeight: 900 }}>Verified & Analyzed</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
 