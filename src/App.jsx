import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Profile from './components/Profile.jsx';
import FitnessPlans from './components/FitnessPlans.jsx';
import HealthTracker from './components/HealthTracker.jsx';
import Devices from './components/Devices.jsx';
import NutritionPlan from './components/NutritionPlan.jsx';
import ProgressReports from './components/ProgressReports.jsx';
import Login from './components/Login.jsx';

import WorkoutLive from './components/WorkoutLive.jsx';
import SleepAnalytics from './components/SleepAnalytics.jsx';
import HeartCardioZones from './components/HeartCardioZones.jsx';
import HydrationTracker from './components/HydrationTracker.jsx';
import RecipeLibrary from './components/RecipeLibrary.jsx';
import MacroCalculator from './components/MacroCalculator.jsx';
import BodyComposition from './components/BodyComposition.jsx';
import GoalsMilestones from './components/GoalsMilestones.jsx';
import HabitTracker from './components/HabitTracker.jsx';
import SupplementManager from './components/SupplementManager.jsx';
import CommunityLeaderboard from './components/CommunityLeaderboard.jsx';
import Settings from './components/Settings.jsx';
import GymMasterPortal from './components/GymMasterPortal.jsx';

// NEW SAAS & SOCIAL MODULES
import Achievements from './components/Achievements.jsx';
import Challenges from './components/Challenges.jsx';
import DailyChallenge from './components/DailyChallenge.jsx';
import Friends from './components/Friends.jsx';
import ShareProgressCard from './components/ShareProgressCard.jsx';
import MessagingSystem from './components/MessagingSystem.jsx';
import WorkoutTemplates from './components/WorkoutTemplates.jsx';
import BulkAssignPlans from './components/BulkAssignPlans.jsx';
import RevenueDashboard from './components/RevenueDashboard.jsx';
import NotificationCenter from './components/NotificationCenter.jsx';
import RealTimeAccessHeader from './components/RealTimeAccessHeader.jsx';
import DieticianPortal from './components/DieticianPortal.jsx';

import { Bell, Sun, Moon } from 'lucide-react';
import * as db from './services/db.js';

const AUTH_STORAGE_KEY = 'sfc_auth_user_id';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [tables, setTables] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? Number(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sfc_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sfc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  const refresh = useCallback(() => {
    setTables({
      users: db.getAll('users'),
      fitnessPlans: db.getAll('fitnessPlans'),
      workouts: db.getAll('workouts'),
      exercises: db.getAll('exercises'),
      healthTrackers: db.getAll('healthTrackers'),
      devices: db.getAll('devices'),
      deviceSyncLogs: db.getAll('deviceSyncLogs'),
      nutritionPlans: db.getAll('nutritionPlans'),
      progressReports: db.getAll('progressReports'),
      sleepLogs: db.getAll('sleepLogs'),
      hydrationLogs: db.getAll('hydrationLogs'),
      recipes: db.getAll('recipes'),
      bodyMeasurements: db.getAll('bodyMeasurements'),
      goals: db.getAll('goals'),
      habits: db.getAll('habits'),
      supplements: db.getAll('supplements'),
      chatMessages: db.getAll('chatMessages'),
      communityRankings: db.getAll('communityRankings')
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLoginSuccess = (user) => {
    setCurrentUserId(user.user_id);
    localStorage.setItem(AUTH_STORAGE_KEY, String(user.user_id));
    db.recordUserLogin(user);
    if (user.role === 'owner' || user.role === 'gym_owner') {
      setPage('revenue');
    } else if (user.role === 'gym_master' || user.role === 'admin') {
      setPage('gym-master');
    } else if (user.role === 'dietician') {
      setPage('nutrition');
    } else if (user.role === 'consultant') {
      setPage('templates');
    } else {
      setPage('dashboard');
    }
    refresh();
  };

  useEffect(() => {
    if (currentUserId && tables && tables.users) {
      const user = tables.users.find((u) => u.user_id === currentUserId);
      if (user) db.recordUserLogin(user);
    }
  }, [currentUserId, tables]);

  const handleLogout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const currentUser = tables?.users?.find((u) => u.user_id === currentUserId) || tables?.users?.[0];

  useEffect(() => {
    const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'gym_owner';
    if (isOwner && page !== 'revenue') {
      setPage('revenue');
    }
    if (currentUser?.role === 'consultant' && page !== 'templates') {
      setPage('templates');
    }
  }, [currentUser, page]);

  if (!tables) return null;

  if (!currentUserId || !currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const scoped = (rows) => (rows || []).filter((r) => !r.user_id || r.user_id === currentUserId);

  // Unread Notification Count
  const uid = currentUser?.user_id || currentUser?.id || 1;
  const unreadNotifications = (db.getNotifications ? db.getNotifications(uid) : []).filter(n => !(n.is_read || n.isRead)).length;

  const planActions = {
    onAddPlan: (payload) => {
      db.insert('fitnessPlans', { user_id: currentUserId, ...payload });
      refresh();
    },
    onDeletePlan: (id) => {
      db.remove('fitnessPlans', id);
      refresh();
    },
    onAddWorkout: (planId, payload) => {
      db.insert('workouts', { plan_id: planId, ...payload });
      refresh();
    },
    onDeleteWorkout: (id) => {
      db.remove('workouts', id);
      refresh();
    },
    onAddExercise: (workoutId, payload) => {
      db.insert('exercises', { workout_id: workoutId, ...payload });
      refresh();
    },
    onDeleteExercise: (id) => {
      db.remove('exercises', id);
      refresh();
    }
  };

  const renderPage = () => {
    // Owner role: strictly restricted to monitoring financial criteria and revenue reports only
    const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'gym_owner';
    if (isOwner) {
      return <RevenueDashboard user={currentUser} currentUser={currentUser} onLogout={handleLogout} onRefresh={refresh} />;
    }

    // Dietician role: restricted to nutrition assignment and profile only
    const isDietician = currentUser?.role === 'dietician';
    if (isDietician && page !== 'nutrition' && page !== 'profile') {
      return null;
    }

    // Consultant role: restricted strictly to workout templates only
    const isConsultant = currentUser?.role === 'consultant';
    if (isConsultant) {
      return (
        <WorkoutTemplates
          user={currentUser}
          currentUser={currentUser}
          onRefresh={refresh}
        />
      );
    }
    switch (page) {
      case 'gym-master':
        return (
          <GymMasterPortal
            currentUser={currentUser}
            user={currentUser}
            allUsers={tables.users}
            fitnessPlans={tables.fitnessPlans}
            workouts={tables.workouts}
            exercises={tables.exercises}
            healthTrackers={tables.healthTrackers}
            nutritionPlans={tables.nutritionPlans}
            progressReports={tables.progressReports}
            sleepLogs={tables.sleepLogs}
            devices={tables.devices}
            deviceSyncLogs={tables.deviceSyncLogs}
            onRefresh={refresh}
            onNavigate={setPage}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            user={currentUser}
            currentUser={currentUser}
            fitnessPlans={scoped(tables.fitnessPlans)}
            workouts={tables.workouts}
            healthTrackers={scoped(tables.healthTrackers)}
            devices={scoped(tables.devices)}
            deviceSyncLogs={scoped(tables.deviceSyncLogs)}
            progressReports={scoped(tables.progressReports)}
            onNavigate={setPage}
            onAddNutrition={(payload) => {
              db.insert('nutritionPlans', { user_id: currentUserId, ...payload });
              refresh();
            }}
            onAddPlan={(payload) => {
              const plan = planActions.onAddPlan(payload);
              refresh();
              return plan;
            }}
          />
        );
      case 'achievements':
        return <Achievements user={currentUser} currentUser={currentUser} onRefresh={refresh} />;
      case 'daily-challenge':
        return <DailyChallenge user={currentUser} currentUser={currentUser} onRefresh={refresh} onNavigate={setPage} />;
      case 'challenges':
        return <Challenges user={currentUser} currentUser={currentUser} onRefresh={refresh} onNavigate={setPage} />;
      case 'friends':
        return <Friends user={currentUser} currentUser={currentUser} />;
      case 'share-card':
        return <ShareProgressCard user={currentUser} currentUser={currentUser} />;
      case 'messages':
        return <MessagingSystem user={currentUser} currentUser={currentUser} onRefresh={refresh} />;
      case 'templates':
        return <WorkoutTemplates user={currentUser} currentUser={currentUser} onRefresh={refresh} />;
      case 'bulk-assign':
        return <BulkAssignPlans user={currentUser} currentUser={currentUser} onRefresh={refresh} />;
      case 'revenue':
        return <RevenueDashboard user={currentUser} currentUser={currentUser} onLogout={handleLogout} onRefresh={refresh} />;
      case 'notifications':
        return <NotificationCenter user={currentUser} currentUser={currentUser} onNavigate={setPage} />;
      case 'workout-live':
        return (
          <WorkoutLive
            workouts={tables.workouts}
            exercises={tables.exercises}
            devices={scoped(tables.devices)}
            deviceSyncLogs={scoped(tables.deviceSyncLogs)}
            user={currentUser}
            onAddDeviceSyncLog={(payload) => {
              db.recordDeviceSyncLog({ user_id: currentUserId, ...payload });
              refresh();
            }}
            onCompleteSession={() => {
              db.generateProgressReport(currentUserId);
              refresh();
            }}
          />
        );
      case 'plans':
        return (
          <FitnessPlans
            plans={scoped(tables.fitnessPlans)}
            workouts={tables.workouts}
            exercises={tables.exercises}
            actions={planActions}
            user={currentUser}
          />
        );
      case 'health':
        return (
          <HealthTracker
            records={scoped(tables.healthTrackers)}
            onAdd={(payload) => {
              db.insert('healthTrackers', { user_id: currentUserId, ...payload });
              refresh();
            }}
            onDelete={(id) => {
              db.remove('healthTrackers', id);
              refresh();
            }}
          />
        );
      case 'sleep':
        return (
          <SleepAnalytics
            sleepLogs={scoped(tables.sleepLogs)}
            user={currentUser}
            onAddSleep={(payload) => {
              db.insert('sleepLogs', { user_id: currentUserId, ...payload });
              refresh();
            }}
          />
        );
      case 'heart-zones':
        return <HeartCardioZones user={currentUser} />;
      case 'hydration':
        return (
          <HydrationTracker
            hydrationLogs={scoped(tables.hydrationLogs)}
            onAddHydration={(payload) => {
              db.insert('hydrationLogs', { user_id: currentUserId, ...payload });
              refresh();
            }}
          />
        );
      case 'nutrition':
        if (isDietician) {
          return (
            <DieticianPortal
              currentUser={currentUser}
              allUsers={tables.users}
              nutritionPlans={tables.nutritionPlans}
              onRefresh={refresh}
            />
          );
        }
        return (
          <NutritionPlan
            plans={scoped(tables.nutritionPlans)}
            user={currentUser}
            onAdd={(payload) => {
              db.insert('nutritionPlans', { user_id: currentUserId, ...payload });
              refresh();
            }}
            onDelete={(id) => {
              db.remove('nutritionPlans', id);
              refresh();
            }}
          />
        );
      case 'recipes':
        return (
          <RecipeLibrary
            recipes={tables.recipes}
            onAddToPlan={(recipe) => {
              db.insert('nutritionPlans', {
                user_id: currentUserId,
                daily_calories: recipe.calories,
                diet_type: recipe.category,
                protein_g: recipe.protein,
                carbs_g: recipe.carbs,
                fats_g: recipe.fats
              });
              refresh();
            }}
          />
        );
      case 'macro-calc':
        return (
          <MacroCalculator
            user={currentUser}
            onSaveTarget={(patch) => {
              db.insert('nutritionPlans', { user_id: currentUserId, diet_type: 'Calculated Macro Goal', ...patch });
              refresh();
            }}
          />
        );
      case 'body-comp':
        return (
          <BodyComposition
            measurements={scoped(tables.bodyMeasurements)}
            user={currentUser}
            onAddMeasurement={(payload) => {
              db.insert('bodyMeasurements', { user_id: currentUserId, ...payload });
              if (payload.weight) db.updateProfile(currentUserId, { weight: payload.weight });
              refresh();
            }}
          />
        );
      case 'goals':
        return (
          <GoalsMilestones
            goals={scoped(tables.goals)}
            onAddGoal={(payload) => {
              db.insert('goals', { user_id: currentUserId, ...payload });
              refresh();
            }}
            onToggleGoal={(id, status) => {
              db.update('goals', id, { status });
              refresh();
            }}
          />
        );
      case 'habits':
        return (
          <HabitTracker
            habits={scoped(tables.habits)}
            onAddHabit={(payload) => {
              db.insert('habits', { user_id: currentUserId, ...payload });
              refresh();
            }}
            onToggleHabit={(id, completed) => {
              const habit = (tables.habits || []).find((h) => h.habit_id === id);
              const newStreak = completed ? (habit?.streak || 0) + 1 : Math.max(0, (habit?.streak || 1) - 1);
              db.update('habits', id, { completed_today: completed, streak: newStreak });
              refresh();
            }}
          />
        );
      case 'supplements':
        return (
          <SupplementManager
            supplements={scoped(tables.supplements)}
            onAddSupplement={(payload) => {
              db.insert('supplements', { user_id: currentUserId, ...payload });
              refresh();
            }}
            onToggleTaken={(id, taken) => {
              db.update('supplements', id, { taken_today: taken });
              refresh();
            }}
          />
        );
      case 'devices':
        return (
          <Devices
            devices={scoped(tables.devices)}
            deviceSyncLogs={scoped(tables.deviceSyncLogs)}
            onAdd={(payload) => {
              db.insert('devices', { user_id: currentUserId, ...payload });
              refresh();
            }}
            onDelete={(id) => {
              db.remove('devices', id);
              refresh();
            }}
            onToggleSync={(id, current) => {
              db.update('devices', id, { sync_status: current === 'Synced' ? 'Pending' : 'Synced' });
              refresh();
            }}
            onUpdateDevice={(id, patch) => {
              db.update('devices', id, patch);
              refresh();
            }}
            onAddDeviceSyncLog={(payload) => {
              db.recordDeviceSyncLog({ user_id: currentUserId, ...payload });
              refresh();
            }}
            onDeleteDeviceSyncLog={(id) => {
              db.remove('deviceSyncLogs', id);
              refresh();
            }}
          />
        );
      case 'reports':
        return (
          <ProgressReports
            reports={scoped(tables.progressReports)}
            onGenerate={() => {
              db.generateProgressReport(currentUserId);
              refresh();
            }}
            onDelete={(id) => {
              db.remove('progressReports', id);
              refresh();
            }}
          />
        );

      case 'community':
        return (
          <CommunityLeaderboard
            rankings={tables.communityRankings}
            currentUser={currentUser}
            users={tables.users}
            healthTrackers={tables.healthTrackers}
          />
        );
      case 'profile':
        return (
          <Profile
            user={currentUser}
            onUpdateProfile={(arg1, arg2) => {
              const userId = (typeof arg1 === 'object' && arg1 !== null) ? currentUser.user_id : arg1;
              const patch = (typeof arg1 === 'object' && arg1 !== null) ? arg1 : arg2;
              if (userId && patch) {
                db.updateProfile(userId, patch);
                refresh();
              }
            }}
          />
        );
      case 'settings':
        return <Settings onRefreshData={refresh} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell relative">
      <Sidebar
        active={page}
        onNavigate={setPage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="main" style={{ position: 'relative', minHeight: '100vh' }}>
        {/* Top Header Controls: Real-Time Date & Time Access Header + Notifications */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '28px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <RealTimeAccessHeader user={currentUser} />
          
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDark ? (
              <Sun size={18} color="#f59e0b" strokeWidth={2.2} />
            ) : (
              <Moon size={18} color="#475569" strokeWidth={2.2} />
            )}
          </button>
          
          {currentUser?.role !== 'consultant' && currentUser?.role !== 'owner' && currentUser?.role !== 'gym_owner' && (
            <button
              onClick={() => setPage('notifications')}
              style={{
                padding: '7px 12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Notifications"
            >
              <Bell size={18} color="#475569" />
              {unreadNotifications > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '9999px',
                  padding: '1px 6px',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {unreadNotifications}
                </span>
              )}
            </button>
          )}
        </div>

        {renderPage()}
      </main>
    </div>
  );
}
