import React, { useState, useEffect } from 'react';
import * as db from '../services/db.js';
import {
  Bell,
  CheckCircle,
  Award,
  Users,
  Swords,
  MessageSquare,
  Dumbbell,
  CreditCard,
  Check,
  CheckCheck,
  Trash2,
  Filter
} from 'lucide-react';

export default function NotificationCenter({ user, currentUser, onNavigate }) {
  const activeUser = currentUser || user;
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [activeUser]);

  const loadNotifications = () => {
    if (!activeUser) return;
    const uid = activeUser.user_id || activeUser.id;
    const list = db.getNotifications(uid);
    setNotifications(list);
  };

  const handleMarkAsRead = (id) => {
    db.markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    if (!activeUser) return;
    const uid = activeUser.user_id || activeUser.id;
    db.markAllNotificationsAsRead(uid);
    loadNotifications();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'friend_request':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'challenge_invite':
      case 'challenge_result':
        return <Swords className="w-5 h-5 text-purple-500" />;
      case 'trainer_message':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'workout_assigned':
        return <Dumbbell className="w-5 h-5 text-indigo-500" />;
      case 'billing':
      case 'membership_expiring':
        return <CreditCard className="w-5 h-5 text-rose-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'achievements') return n.type === 'achievement';
    if (filter === 'social') return ['friend_request', 'challenge_invite', 'challenge_result'].includes(n.type);
    if (filter === 'workouts') return ['trainer_message', 'workout_assigned'].includes(n.type);
    if (filter === 'billing') return ['billing', 'membership_expiring'].includes(n.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl relative">
            <Bell className="w-7 h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stay updated with your achievements, challenges, trainer updates, and billing alerts.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl text-sm font-medium transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'achievements', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length },
          { id: 'social', label: 'Social & Challenges', count: notifications.filter(n => ['friend_request', 'challenge_invite', 'challenge_result'].includes(n.type)).length },
          { id: 'workouts', label: 'Workouts & Trainers', count: notifications.filter(n => ['trainer_message', 'workout_assigned'].includes(n.type)).length },
          { id: 'billing', label: 'Billing & Account', count: notifications.filter(n => ['billing', 'membership_expiring'].includes(n.type)).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                filter === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No notifications found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              You are all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.notif_id || notification.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                notification.is_read || notification.isRead
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 opacity-90'
                  : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60 shadow-sm'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 shrink-0">
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-base font-semibold ${
                    notification.is_read || notification.isRead ? 'text-slate-800 dark:text-slate-200' : 'text-indigo-950 dark:text-indigo-200'
                  }`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                    {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notification.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {notification.message}
                </p>

                {notification.link && onNavigate && (
                  <button
                    onClick={() => onNavigate(notification.link)}
                    className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    View details &rarr;
                  </button>
                )}
              </div>

              {!(notification.is_read || notification.isRead) && (
                <button
                  onClick={() => handleMarkAsRead(notification.notif_id || notification.id)}
                  title="Mark as read"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
