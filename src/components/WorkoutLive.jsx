import React, { useState, useEffect, useRef } from 'react';
import * as aiService from '../services/aiService.js';
import { formatDuration } from '../services/db.js';

export default function WorkoutLive({
  workouts = [],
  exercises = [],
  devices = [],
  deviceSyncLogs = [],
  onCompleteSession,
  onAddDeviceSyncLog,
  user
}) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(workouts[0]?.workout_id || 1);
  const [secondsActive, setSecondsActive] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [heartRate, setHeartRate] = useState(132);
  const [formAdvice, setFormAdvice] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

  // Bluetooth Watch & Device Sync state
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.device_id || 'preset-watch');
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [connectedSeconds, setConnectedSeconds] = useState(0);
  const [syncStartTime, setSyncStartTime] = useState(null);
  const [lastSyncLogSummary, setLastSyncLogSummary] = useState(null);

  const activeWorkout = workouts.find((w) => w.workout_id === Number(selectedWorkoutId)) || workouts[0];
  const activeExercises = exercises.filter((e) => e.workout_id === activeWorkout?.workout_id);
  const currentExercise = activeExercises[currentExIndex] || activeExercises[0];

  const selectedDevice = devices.find((d) => String(d.device_id) === String(selectedDeviceId)) || {
    device_id: 'preset-watch',
    model: 'Apple Watch Series 9 (Bluetooth)',
    battery: 88,
    sync_status: 'Synced'
  };

  // Main Timer & Device Sync Timer
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setSecondsActive((prev) => prev + 1);
        if (isDeviceConnected) {
          setConnectedSeconds((prev) => prev + 1);
        }
        // Dynamic heart rate fluctuation simulation
        setHeartRate(128 + Math.floor(Math.sin(Date.now() / 800) * 18));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isDeviceConnected]);

  const formatTimerDigits = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartWorkout = () => {
    setIsRunning(true);
    setLastSyncLogSummary(null);
    // Auto-connect device if selected
    if (selectedDeviceId && !isDeviceConnected) {
      setIsDeviceConnected(true);
      setSyncStartTime(new Date().toISOString());
    }
  };

  const handleDisconnectDeviceSync = () => {
    if (!isDeviceConnected && connectedSeconds === 0) return null;

    const endTimeIso = new Date().toISOString();
    const formattedPeriod = formatDuration(connectedSeconds);
    const caloriesBurned = Math.round(connectedSeconds * 0.18 + Math.random() * 20);

    const logEntry = {
      device_id: selectedDevice.device_id,
      device_name: selectedDevice.model || 'Smartwatch Bluetooth',
      workout_name: activeWorkout?.type || 'Live Workout Session',
      start_time: syncStartTime || new Date(Date.now() - connectedSeconds * 1000).toISOString(),
      end_time: endTimeIso,
      duration_seconds: connectedSeconds,
      duration_formatted: formattedPeriod,
      date: new Date().toISOString().slice(0, 10),
      avg_heart_rate: heartRate,
      calories_burned: caloriesBurned,
      connection_type: 'Bluetooth Low Energy / GATT',
      status: 'Completed & Disconnected'
    };

    if (onAddDeviceSyncLog) {
      onAddDeviceSyncLog(logEntry);
    }

    setLastSyncLogSummary(logEntry);
    setIsDeviceConnected(false);
    return logEntry;
  };

  const handleFinishWorkout = () => {
    setIsRunning(false);
    let syncLog = null;
    if (isDeviceConnected || connectedSeconds > 0) {
      syncLog = handleDisconnectDeviceSync();
    }

    if (onCompleteSession) {
      onCompleteSession(activeWorkout, secondsActive);
    }

    const connectedTimeMsg = syncLog ? `\n⌚ Device Connected Period: ${syncLog.duration_formatted} (${syncLog.device_name})` : '';
    alert(`🎉 Workout Session Finished!\nDuration: ${formatTimerDigits(secondsActive)}${connectedTimeMsg}\nGreat work!`);
  };

  const handleToggleSet = (exId, setNum) => {
    const key = `${exId}_${setNum}`;
    setCompletedSets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFetchFormAdvice = async () => {
    if (!currentExercise) return;
    setLoadingForm(true);
    try {
      const advice = await aiService.generateExerciseFormAdvice({
        exerciseName: currentExercise.name,
        user
      });
      setFormAdvice(advice);
    } catch (err) {
      alert(`AI Form Cue Notice: ${err.message}`);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header flex flex-between align-center wrap gap-4">
        <div>
          <div className="page-eyebrow">LIVE WORKOUT & DEVICE SYNC</div>
          <h1 className="page-title">Live Workout Session</h1>
          <p className="page-subtitle">
            Auto-connect your smartwatch or chest strap when starting a workout to record exact connected time periods.
          </p>
        </div>
        <div className="flex align-center gap-3 wrap">
          {!isRunning ? (
            <button className="btn btn-primary" onClick={handleStartWorkout} style={{ padding: '12px 24px', fontSize: 15 }}>
              ▶ START WORKOUT & AUTO-CONNECT WATCH
            </button>
          ) : (
            <button className="btn btn-warning" onClick={() => setIsRunning(false)}>
              ⏸ PAUSE SESSION
            </button>
          )}
          <button className="btn btn-success" onClick={handleFinishWorkout} style={{ padding: '12px 20px', fontSize: 15 }}>
            ✓ FINISH & DISCONNECT
          </button>
        </div>
      </header>

      {/* BLUETOOTH DEVICE SYNC HERO WIDGET */}
      <div
        className="card mb-4"
        style={{
          border: isDeviceConnected ? '2px solid #22c55e' : '1px solid var(--line)',
          background: isDeviceConnected ? 'rgba(34, 197, 94, 0.05)' : 'var(--panel)',
          padding: '18px 22px'
        }}
      >
        <div className="flex flex-between align-center wrap gap-4 mb-3">
          <div className="flex align-center gap-3">
            <div className={`ble-pulse-icon ${isDeviceConnected ? 'scanning' : ''}`} style={{ background: isDeviceConnected ? 'linear-gradient(135deg, #22c55e, #16a34a)' : undefined }}>
              ⌚
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
                  Bluetooth Device Workout Sync
                </h3>
                {isDeviceConnected ? (
                  <span className="pill ok" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span className="ble-live-dot" /> Connected & Syncing
                  </span>
                ) : (
                  <span className="pill warn">Standby</span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-sub)' }}>
                {isDeviceConnected
                  ? `Active telemetry streaming from ${selectedDevice.model || 'Smartwatch'}`
                  : 'Select your watch below. Starting a workout auto-connects the device and records duration.'}
              </p>
            </div>
          </div>

          {/* DEVICE CONNECT / DISCONNECT CONTROLS */}
          <div className="flex align-center gap-3 wrap">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Select Bluetooth Watch:</label>
              <select
                className="select-input"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                disabled={isDeviceConnected}
                style={{ padding: '8px 12px', fontSize: 13, minWidth: 220 }}
              >
                {devices.map((d) => (
                  <option key={d.device_id} value={d.device_id}>
                    ⌚ {d.model} ({d.battery ?? 85}% Batt)
                  </option>
                ))}
                <option value="preset-apple">⌚ Apple Watch Series 9 (Web BLE)</option>
                <option value="preset-galaxy">⌚ Samsung Galaxy Watch 6</option>
                <option value="preset-chest">❤️ HeartSync Chest Strap (GATT)</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              {!isDeviceConnected ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsDeviceConnected(true);
                    setSyncStartTime(new Date().toISOString());
                    if (!isRunning) setIsRunning(true);
                  }}
                  style={{ padding: '9px 16px', fontSize: 13 }}
                >
                  ⚡ Connect Watch Now
                </button>
              ) : (
                <button
                  className="btn btn-danger"
                  onClick={handleDisconnectDeviceSync}
                  style={{ padding: '9px 16px', fontSize: 13 }}
                >
                  🔴 Disconnect Device Sync
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CONNECTED TIME PERIOD LIVE DISPLAY */}
        {isDeviceConnected && (
          <div
            style={{
              marginTop: 14,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'var(--panel-alt)',
              border: '1px dashed var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div className="flex align-center gap-3">
              <span style={{ fontSize: 20 }}>🕒</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Recorded Connected Time Period
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#22c55e', fontFamily: 'var(--font-mono)' }}>
                  {formatDuration(connectedSeconds)}
                </div>
              </div>
            </div>

            <div className="flex align-center gap-4">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Live Heart Rate</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444' }}>❤️ {heartRate} BPM</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Est. Burn</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--yellow)' }}>🔥 {Math.round(connectedSeconds * 0.18)} kcal</div>
              </div>
            </div>
          </div>
        )}

        {/* DISCONNECTED SESSION RECORD SUMMARY BANNER */}
        {lastSyncLogSummary && !isDeviceConnected && (
          <div
            style={{
              marginTop: 14,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid var(--blue)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>
                ✅ Device Disconnected & Workout Connected Time Recorded!
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                Device: <strong>{lastSyncLogSummary.device_name}</strong> • Connected Time Period: <strong style={{ color: '#22c55e' }}>{lastSyncLogSummary.duration_formatted}</strong> • Avg HR: {lastSyncLogSummary.avg_heart_rate} BPM
              </div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => setLastSyncLogSummary(null)}>
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* WORKOUT SELECTION & TIMERS */}
      <div className="card mb-4 flex-between align-center flex-wrap gap-3">
        <div>
          <label className="input-label">Select Active Workout Routine:</label>
          <select
            className="select-input"
            value={selectedWorkoutId}
            onChange={(e) => {
              setSelectedWorkoutId(Number(e.target.value));
              setCurrentExIndex(0);
              setFormAdvice(null);
            }}
          >
            {workouts.map((w) => (
              <option key={w.workout_id} value={w.workout_id}>
                {w.type} ({w.duration_minutes} mins)
              </option>
            ))}
          </select>
        </div>

        <div className="live-stat-badge">
          <span className="stat-label">TOTAL WORKOUT TIMER</span>
          <span className="stat-value timer-digits">{formatTimerDigits(secondsActive)}</span>
        </div>

        <div className="live-stat-badge">
          <span className="stat-label">DEVICE CONNECTED TIME</span>
          <span className="stat-value hr-val" style={{ color: isDeviceConnected ? '#22c55e' : 'var(--muted)' }}>
            ⌚ {formatTimerDigits(connectedSeconds)}
          </span>
        </div>
      </div>

      {/* EXERCISE CHECKLIST & AI FORM ADVICE */}
      {currentExercise ? (
        <div className="card live-exercise-card mb-4">
          <div className="flex-between align-center mb-3 flex-wrap gap-2">
            <div>
              <span className="badge badge-accent">Exercise {currentExIndex + 1} of {activeExercises.length}</span>
              <h2 className="section-title mt-1">{currentExercise.name}</h2>
            </div>
            <div className="flex-gap flex-wrap">
              <button
                className="btn btn-primary text-xs flex align-center gap-1"
                onClick={handleFetchFormAdvice}
                disabled={loadingForm}
              >
                {loadingForm ? '⏳ Gemini Biomechanics...' : '🧘 AI Form Check Cues'}
              </button>

              <button
                className="btn btn-secondary btn-sm"
                disabled={currentExIndex === 0}
                onClick={() => {
                  setCurrentExIndex((i) => Math.max(0, i - 1));
                  setFormAdvice(null);
                }}
              >
                ◀ Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentExIndex === activeExercises.length - 1}
                onClick={() => {
                  setCurrentExIndex((i) => Math.min(activeExercises.length - 1, i + 1));
                  setFormAdvice(null);
                }}
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* AI Form Advice Card */}
          {formAdvice && (
            <div className="p-3 mb-3 border-radius border-primary bg-surface text-sm">
              <div className="flex-between align-center mb-2 border-b pb-1">
                <strong className="text-primary text-xs flex align-center gap-1">
                  🤖 Gemini Biomechanical Cues for {formAdvice.exercise || currentExercise.name}
                </strong>
                <button className="btn btn-secondary text-xs p-1" onClick={() => setFormAdvice(null)}>
                  ✕ Dismiss
                </button>
              </div>
              <p className="my-1"><strong>📐 Setup:</strong> {formAdvice.setup_cue}</p>
              <p className="my-1"><strong>⚡ Execution:</strong> {formAdvice.execution_cue}</p>
              <p className="my-1 text-amber"><strong>⚠️ Flaw to Avoid:</strong> {formAdvice.common_mistake}</p>
              <p className="my-1 text-cyan"><strong>🛡️ Joint Safety:</strong> {formAdvice.safety_tip}</p>
            </div>
          )}

          <div className="grid grid-3 gap-3 mb-4">
            <div className="stat-box">
              <div className="stat-num">{currentExercise.sets}</div>
              <div className="stat-lbl">TARGET SETS</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{currentExercise.reps}</div>
              <div className="stat-lbl">REPS PER SET</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">
                {Array.from({ length: currentExercise.sets }).filter((_, idx) => completedSets[`${currentExercise.exercise_id}_${idx + 1}`]).length} / {currentExercise.sets}
              </div>
              <div className="stat-lbl">COMPLETED</div>
            </div>
          </div>

          <h4 className="input-label mb-2">Set Logger Checklist:</h4>
          <div className="sets-grid">
            {Array.from({ length: currentExercise.sets }).map((_, idx) => {
              const setNum = idx + 1;
              const isDone = completedSets[`${currentExercise.exercise_id}_${setNum}`];
              return (
                <button
                  key={setNum}
                  type="button"
                  className={`set-btn ${isDone ? 'done' : ''}`}
                  onClick={() => handleToggleSet(currentExercise.exercise_id, setNum)}
                >
                  <span className="set-name">SET {setNum}</span>
                  <span className="set-reps">{currentExercise.reps} REPS</span>
                  <span className="set-icon">{isDone ? '✓ DONE' : '⭕ MARK DONE'}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card text-center p-4">No exercises configured for this workout session.</div>
      )}
    </div>
  );
}
