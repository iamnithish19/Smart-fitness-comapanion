// src/services/db.js
//
// Tiny embedded database for Smart Fitness Companion.
// Persistent state via browser localStorage across 18 feature modules.

import seed from '../data/db.json';
import { syncAllToMongo, fetchAllFromMongo } from './mongoService.js';

const STORAGE_KEY = 'sfc_database_v8';
const TXT_STORAGE_KEY = 'sfc_database_txt_backup';
const LOGIN_TXT_KEY = 'sfc_user_logins_txt';

const TABLES = [
  'users',
  'userLogins',
  'fitnessPlans',
  'workouts',
  'exercises',
  'healthTrackers',
  'devices',
  'deviceSyncLogs',
  'nutritionPlans',
  'progressReports',
  'sleepLogs',
  'hydrationLogs',
  'recipes',
  'bodyMeasurements',
  'goals',
  'habits',
  'supplements',
  'chatMessages',
  'communityRankings',
  'achievements',
  'userAchievements',
  'friendships',
  'challenges',
  'challengeParticipants',
  'messages',
  'workoutTemplates',
  'workoutAssignments',
  'membershipPlans',
  'memberMemberships',
  'payments',
  'notifications',
  'accessLogs',
  'dailyChallenges'
];

const PK = {
  users: 'user_id',
  userLogins: 'log_id',
  fitnessPlans: 'plan_id',
  workouts: 'workout_id',
  exercises: 'exercise_id',
  healthTrackers: 'record_id',
  devices: 'device_id',
  deviceSyncLogs: 'log_id',
  nutritionPlans: 'nutrition_id',
  progressReports: 'report_id',
  sleepLogs: 'sleep_id',
  hydrationLogs: 'hydration_id',
  recipes: 'recipe_id',
  bodyMeasurements: 'measurement_id',
  goals: 'goal_id',
  habits: 'habit_id',
  supplements: 'supp_id',
  chatMessages: 'msg_id',
  communityRankings: 'rank',
  achievements: 'achievement_id',
  userAchievements: 'user_achievement_id',
  friendships: 'friendship_id',
  challenges: 'challenge_id',
  challengeParticipants: 'participant_id',
  messages: 'msg_id',
  workoutTemplates: 'template_id',
  workoutAssignments: 'assignment_id',
  membershipPlans: 'plan_id',
  memberMemberships: 'membership_id',
  payments: 'payment_id',
  notifications: 'notif_id',
  accessLogs: 'access_id',
  dailyChallenges: 'challenge_record_id'
};

const DEFAULT_DEVICE_SYNC_LOGS = [
  {
    log_id: 1,
    user_id: 1,
    device_id: 1,
    device_name: 'PulseBand X3 Pro',
    workout_name: 'Cardio Interval Training',
    start_time: '2026-09-28T10:15:00',
    end_time: '2026-09-28T10:55:00',
    duration_seconds: 2400,
    duration_formatted: '40 mins 00 secs',
    date: '2026-09-28',
    avg_heart_rate: 142,
    calories_burned: 340,
    connection_type: 'Bluetooth Low Energy (GATT)',
    status: 'Completed & Disconnected'
  },
  {
    log_id: 2,
    user_id: 1,
    device_id: 3,
    device_name: 'HeartSync Chest Strap',
    workout_name: 'HIIT Burner & Sprint Split',
    start_time: '2026-09-27T17:00:00',
    end_time: '2026-09-27T17:35:15',
    duration_seconds: 2115,
    duration_formatted: '35 mins 15 secs',
    date: '2026-09-27',
    avg_heart_rate: 156,
    calories_burned: 410,
    connection_type: 'Bluetooth Smart Stream',
    status: 'Completed & Disconnected'
  },
  {
    log_id: 3,
    user_id: 1,
    device_id: 1,
    device_name: 'PulseBand X3 Pro',
    workout_name: 'Upper Body Strength',
    start_time: '2026-09-26T08:30:00',
    end_time: '2026-09-26T09:20:45',
    duration_seconds: 3045,
    duration_formatted: '50 mins 45 secs',
    date: '2026-09-26',
    avg_heart_rate: 128,
    calories_burned: 285,
    connection_type: 'Bluetooth Low Energy (GATT)',
    status: 'Completed & Disconnected'
  }
];

export const DEFAULT_STAFF_USERS = [
  {
    user_id: 7,
    name: 'Gym Owner',
    email: 'owner@gymmaster.fit',
    role: 'owner',
    age: 44,
    weight: 83.5,
    height: 182,
    fitness_level: 'Gym Owner & Executive Director',
    bio: 'Executive Owner & Managing Director of Iron Forge Gym. Overseeing facility management, staff leadership, financial analytics, and gym expansion.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    specialty: 'Gym Owner & Executive Director',
    gym_name: 'Iron Forge Performance Gym'
  },
  {
    user_id: 8,
    name: 'Gym Dietician',
    email: 'dietician@companion.fit',
    role: 'dietician',
    age: 32,
    weight: 58.5,
    height: 168,
    fitness_level: 'Sports Dietician & Nutritionist',
    bio: 'Certified Clinical & Sports Dietician. Designs personalized macronutrient plans, metabolic conditioning diets, and nutritional recovery protocols.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    specialty: 'Clinical Nutrition & Macro Periodization',
    gym_name: 'Iron Forge Performance Gym'
  },
  {
    user_id: 9,
    name: 'Gym Consultant',
    email: 'consultant@companion.fit',
    role: 'consultant',
    age: 36,
    weight: 78.0,
    height: 178,
    fitness_level: 'Workout Templates & Performance Consultant',
    bio: 'Dedicated Gym Consultant providing standardized workout routines, periodization structures, and performance templates.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    specialty: 'Workout Templates & Periodization',
    gym_name: 'Iron Forge Performance Gym'
  },
  {
    user_id: 10,
    name: 'Nithish (24104025)',
    email: '24104025@nec.edu.in',
    role: 'admin',
    age: 21,
    weight: 70.0,
    height: 175,
    fitness_level: 'System Administrator & Performance Lead',
    bio: 'System Administrator & Performance Lead at Iron Forge Gym. Full management, roster & system authority.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    specialty: 'Gym Operations & Administrator',
    gym_name: 'Iron Forge Performance Gym'
  }
];

function loadRaw() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = structuredClone(seed);
    if (!initial.userLogins) initial.userLogins = [];
    if (!initial.deviceSyncLogs) initial.deviceSyncLogs = DEFAULT_DEVICE_SYNC_LOGS;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    persistTextFiles(initial);
    return initial;
  }
  try {
    const parsed = JSON.parse(stored);
    let modified = false;
    TABLES.forEach((table) => {
      if (!parsed[table]) {
        parsed[table] = table === 'deviceSyncLogs' ? DEFAULT_DEVICE_SYNC_LOGS : structuredClone(seed[table] || []);
        modified = true;
      }
    });

    if (!parsed.deviceSyncLogs || parsed.deviceSyncLogs.length === 0) {
      parsed.deviceSyncLogs = DEFAULT_DEVICE_SYNC_LOGS;
      modified = true;
    }

    // Ensure default staff logins exist (Gym Owner, Gym Dietician, Gym Consultant)
    if (parsed.users) {
      DEFAULT_STAFF_USERS.forEach((staff) => {
        // Respect Gym Owner account removal/vacancy: never resurrect default Gym Owner if seat was vacated
        if (staff.role === 'owner') {
          if (parsed.owner_vacant) return;
          const ownerExists = parsed.users.some(
            (u) => u.role === 'owner' || u.role === 'gym_owner'
          );
          if (ownerExists) return;
        }

        const found = parsed.users.find(
          (u) =>
            (u.email && staff.email && u.email.toLowerCase() === staff.email.toLowerCase()) ||
            (u.user_id && Number(u.user_id) === Number(staff.user_id)) ||
            (u.name && staff.name && u.name.toLowerCase() === staff.name.toLowerCase())
        );
        if (!found) {
          if (staff.role === 'owner' && parsed.owner_vacant) return;
          parsed.users.push({ ...staff });
          modified = true;
        } else {
          if (found.role !== staff.role) {
            found.role = staff.role;
            modified = true;
          }
          if (found.specialty !== staff.specialty) {
            found.specialty = staff.specialty;
            modified = true;
          }
          if (found.name !== staff.name && (found.name.toLowerCase() === staff.name.toLowerCase() || found.name.toLowerCase().includes(staff.role))) {
            found.name = staff.name;
            modified = true;
          }
          if (staff.email && (!found.email || found.email.toLowerCase() !== staff.email.toLowerCase())) {
            found.email = staff.email;
            modified = true;
          }
        }
      });

      // Auto-update role of Marcus Vance to admin if not already
      parsed.users.forEach((u) => {
        if (u.user_id === 2 || (u.email && u.email.toLowerCase() === 'marcus@gymmaster.fit')) {
          if (u.role !== 'admin' && u.role !== 'gym_master') {
            u.role = 'admin';
            modified = true;
          }
        }
        if (u.user_id === 3 && u.role === 'trainer') {
          u.role = 'member';
          modified = true;
        }
      });
    }

    // Auto-update recipe 6 image to cooked chicken breast
    if (parsed.recipes) {
      const r6 = parsed.recipes.find(r => r.recipe_id === 6 || r.title === 'Grilled Chicken Power Bowl');
      if (r6 && (!r6.image || r6.image.includes('photo-1512621776951-a57141f2eefd'))) {
        r6.image = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80';
        modified = true;
      }
    }

    if (modified) persist(parsed);
    return parsed;
  } catch (err) {
    console.error('Corrupt local database, reseeding.', err);
    const initial = structuredClone(seed);
    if (!initial.userLogins) initial.userLogins = [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    persistTextFiles(initial);
    return initial;
  }
}

function persistTextFiles(data) {
  try {
    const dbTxt = generateTextDatabase(data);
    const loginsTxt = generateUserLoginsText(data);
    window.localStorage.setItem(TXT_STORAGE_KEY, dbTxt);
    window.localStorage.setItem(LOGIN_TXT_KEY, loginsTxt);
  } catch (err) {
    console.error('Error persisting text database files:', err);
  }
}

let mongoSyncTimer = null;
function triggerMongoSync(data) {
  if (mongoSyncTimer) clearTimeout(mongoSyncTimer);
  mongoSyncTimer = setTimeout(() => {
    syncAllToMongo(data).catch((err) => {
      console.warn('[MongoDB auto-sync notice]:', err.message);
    });
  }, 1200);
}

function persist(data) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  persistTextFiles(data);
  triggerMongoSync(data);
}

export async function syncToMongoDB() {
  const data = loadRaw();
  return await syncAllToMongo(data);
}

export async function loadFromMongoDB() {
  const res = await fetchAllFromMongo();
  if (res && res.success && res.data && Object.keys(res.data).length > 0) {
    const data = loadRaw();
    for (const [table, rows] of Object.entries(res.data)) {
      if (Array.isArray(rows) && rows.length > 0) {
        data[table] = rows;
      }
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    persistTextFiles(data);
    return { success: true, count: Object.keys(res.data).length };
  }
  return { success: false, error: res?.error || 'No documents retrieved from MongoDB' };
}

function nextId(rows, pk) {
  if (!rows || !rows.length) return 1;
  return rows.reduce((max, row) => Math.max(max, Number(row[pk]) || 0), 0) + 1;
}

/** Read table */
export function getAll(table) {
  const data = loadRaw();
  return data[table] ? [...data[table]] : [];
}

/** Filter rows */
export function filterBy(table, predicate) {
  return getAll(table).filter(predicate);
}

/** Insert row */
export function insert(table, row) {
  const data = loadRaw();
  const pk = PK[table];
  const id = row[pk] ?? nextId(data[table], pk);
  const newRow = { ...row, [pk]: id };
  data[table] = [...(data[table] || []), newRow];
  persist(data);
  return newRow;
}

/** Update row */
export function update(table, id, patch) {
  const data = loadRaw();
  const pk = PK[table];
  let updated = null;
  data[table] = (data[table] || []).map((row) => {
    if (row[pk] === id || (id != null && Number(row[pk]) === Number(id))) {
      updated = { ...row, ...patch, [pk]: row[pk] };
      return updated;
    }
    return row;
  });
  persist(data);
  return updated;
}

/** Delete row */
export function remove(table, id) {
  const data = loadRaw();
  const pk = PK[table];
  data[table] = (data[table] || []).filter((row) => row[pk] !== id);

  if (table === 'fitnessPlans') {
    const doomedWorkouts = data.workouts.filter((w) => w.plan_id === id).map((w) => w.workout_id);
    data.workouts = data.workouts.filter((w) => w.plan_id !== id);
    data.exercises = data.exercises.filter((e) => !doomedWorkouts.includes(e.workout_id));
  }
  if (table === 'workouts') {
    data.exercises = data.exercises.filter((e) => e.workout_id !== id);
  }

  persist(data);
  return true;
}

/** Clear all chat messages for a user */
export function clearChatMessages(userId) {
  const data = loadRaw();
  data.chatMessages = (data.chatMessages || []).filter((m) => m.user_id && m.user_id !== userId);
  persist(data);
  return true;
}

/** Reset database */
export function resetDatabase() {
  const initial = structuredClone(seed);
  if (!initial.userLogins) initial.userLogins = [];
  persist(initial);
  return initial;
}

/** Export JSON */
export function exportDatabase() {
  return loadRaw();
}

/** Record user login event in persistent text database & userLogins table */
export function recordUserLogin(user) {
  if (!user || !user.user_id) return null;
  const data = loadRaw();
  if (!data.userLogins) data.userLogins = [];

  const existingIndex = data.userLogins.findIndex(l => l.user_id === user.user_id);
  const now = new Date();
  const nowStr = now.toISOString();
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const accessDisplay = `${formattedDate} at ${formattedTime}`;

  if (existingIndex >= 0) {
    const existing = data.userLogins[existingIndex];
    data.userLogins[existingIndex] = {
      ...existing,
      name: user.name || existing.name,
      email: user.email || existing.email,
      last_login_at: nowStr,
      last_login_formatted: accessDisplay,
      login_count: (Number(existing.login_count) || 1) + 1
    };
  } else {
    const logId = nextId(data.userLogins, PK.userLogins);
    data.userLogins.push({
      log_id: logId,
      user_id: user.user_id,
      name: user.name || 'User',
      email: user.email || 'N/A',
      first_login_at: nowStr,
      last_login_at: nowStr,
      last_login_formatted: accessDisplay,
      login_count: 1
    });
  }

  // Audit Access Log with Real-Time Date & Time
  if (!data.accessLogs) data.accessLogs = [];
  data.accessLogs.unshift({
    access_id: Date.now(),
    user_id: user.user_id,
    user_name: user.name || 'User',
    role: user.role || 'member',
    timestamp: nowStr,
    date_formatted: formattedDate,
    time_formatted: formattedTime,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local',
    event_type: 'AUTHENTICATED_ACCESS',
    status: 'ACTIVE'
  });
  if (data.accessLogs.length > 50) {
    data.accessLogs = data.accessLogs.slice(0, 50);
  }

  persist(data);
  return data.userLogins;
}

export function getAccessLogs(userId) {
  const data = loadRaw();
  const logs = data.accessLogs || [];
  if (!userId) return logs;
  return logs.filter(l => l.user_id === userId);
}

/** Generate Plain Text Database format (.txt) */
export function generateTextDatabase(dataParam) {
  const data = dataParam || loadRaw();
  const timestamp = new Date().toLocaleString();

  let txt = `================================================================================\n`;
  txt += `           SMART FITNESS COMPANION - TEXT DATABASE FILE (.TXT)\n`;
  txt += `           Export Timestamp: ${timestamp}\n`;
  txt += `================================================================================\n\n`;

  txt += `[SUMMARY]\n`;
  txt += `Total Users Registered: ${(data.users || []).length}\n`;
  txt += `Total User Logins Recorded: ${(data.userLogins || []).length}\n`;
  txt += `Total Fitness Plans: ${(data.fitnessPlans || []).length}\n`;
  txt += `Total Workouts: ${(data.workouts || []).length}\n\n`;

  TABLES.forEach((table) => {
    txt += `--------------------------------------------------------------------------------\n`;
    txt += `TABLE: ${table.toUpperCase()} (Total Rows: ${(data[table] || []).length})\n`;
    txt += `--------------------------------------------------------------------------------\n`;

    const rows = data[table] || [];
    if (rows.length === 0) {
      txt += `(No records)\n\n`;
      return;
    }

    rows.forEach((row, idx) => {
      txt += `  [Row ${idx + 1}]\n`;
      Object.entries(row).forEach(([key, val]) => {
        txt += `    ${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}\n`;
      });
      txt += `\n`;
    });
    txt += `\n`;
  });

  return txt;
}

/** Generate Plain Text User Login History Log (.txt) */
export function generateUserLoginsText(dataParam) {
  const data = dataParam || loadRaw();
  const timestamp = new Date().toLocaleString();
  const logins = data.userLogins || [];

  let txt = `================================================================================\n`;
  txt += `         SMART FITNESS COMPANION - USER LOGIN HISTORY LOG (.TXT)\n`;
  txt += `         Generated: ${timestamp}\n`;
  txt += `         Total Recorded Users: ${logins.length}\n`;
  txt += `================================================================================\n\n`;

  if (logins.length === 0) {
    txt += `No user logins recorded yet. Users will be saved here upon their first login.\n`;
  } else {
    logins.forEach((log, idx) => {
      txt += `--------------------------------------------------------------------------------\n`;
      txt += `LOG ENTRY #${idx + 1}\n`;
      txt += `--------------------------------------------------------------------------------\n`;
      txt += `  Log Record ID : ${log.log_id}\n`;
      txt += `  User ID       : ${log.user_id}\n`;
      txt += `  User Name     : ${log.name}\n`;
      txt += `  Email Address : ${log.email}\n`;
      txt += `  First Login   : ${log.first_login_at ? new Date(log.first_login_at).toLocaleString() : 'N/A'}\n`;
      txt += `  Last Login    : ${log.last_login_at ? new Date(log.last_login_at).toLocaleString() : 'N/A'}\n`;
      txt += `  Total Logins  : ${log.login_count || 1}\n\n`;
    });
  }

  return txt;
}

/** Download helper for text files */
function triggerTextDownload(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export full database as a text file (.txt) */
export function exportDatabaseAsText() {
  const txtContent = generateTextDatabase();
  const filename = `sfc_database_backup_${new Date().toISOString().slice(0, 10)}.txt`;
  triggerTextDownload(txtContent, filename);
}

/** Export recorded user login history as a text file (.txt) */
export function exportLoginHistoryAsText() {
  const txtContent = generateUserLoginsText();
  const filename = `user_logins_${new Date().toISOString().slice(0, 10)}.txt`;
  triggerTextDownload(txtContent, filename);
}

/** Get raw text content from localStorage or runtime */
export function getRawTextDatabase() {
  return window.localStorage.getItem(TXT_STORAGE_KEY) || generateTextDatabase();
}

/** Get user logins text content */
export function getUserLoginsText() {
  return window.localStorage.getItem(LOGIN_TXT_KEY) || generateUserLoginsText();
}

/** Update user profile and sync across leaderboard & login history */
export function updateProfile(userId, profilePatch) {
  if (!userId || !profilePatch) return null;
  const numId = Number(userId);
  let patchWithAvatar = { ...profilePatch };

  if (profilePatch.name && (!profilePatch.avatar || profilePatch.avatar.startsWith('data:image/svg+xml'))) {
    const existing = getAll('users').find(u => Number(u.user_id) === numId || u.user_id === userId);
    patchWithAvatar.avatar = generateLetterAvatarSvg(profilePatch.name, existing?.role === 'gym_master');
  }

  const updatedUser = update('users', userId, patchWithAvatar);
  
  if (updatedUser) {
    const data = loadRaw();
    let modified = false;

    // Sync with communityRankings
    if (data.communityRankings) {
      data.communityRankings = data.communityRankings.map((r) => {
        if (Number(r.user_id) === numId || r.name.replace(/\s*\(You\)$/i, '') === updatedUser.name) {
          modified = true;
          return {
            ...r,
            user_id: updatedUser.user_id,
            name: updatedUser.name,
            avatar: updatedUser.avatar || r.avatar
          };
        }
        return r;
      });
    }

    // Sync with userLogins
    if (data.userLogins) {
      data.userLogins = data.userLogins.map((l) => {
        if (Number(l.user_id) === numId) {
          modified = true;
          return {
            ...l,
            name: updatedUser.name,
            email: updatedUser.email || l.email
          };
        }
        return l;
      });
    }

    if (modified) {
      persist(data);
    }
  }

  return updatedUser;
}

/** Progress Report calculation */
export function generateProgressReport(userId) {
  const plans = filterBy('fitnessPlans', (p) => p.user_id === userId);
  const planIds = plans.map((p) => p.plan_id);
  const workouts = getAll('workouts').filter((w) => planIds.includes(w.plan_id));
  const totalMinutes = workouts.reduce((sum, w) => sum + Number(w.duration_minutes || 0), 0);
  const completion = Math.min(100, Math.round((totalMinutes / 300) * 100));

  return insert('progressReports', {
    user_id: userId,
    report_date: new Date().toISOString().slice(0, 10),
    completion_percentage: completion
  });
}

/** User Auth with Password as Primary, seamless auto-registration, and OTP as secondary choice */
export function authenticateUser(emailOrName, password) {
  const users = getAll('users');
  const rawTerm = (emailOrName || '').trim();
  const term = rawTerm.toLowerCase();

  const user = users.find((u) => {
    const userEmail = (u.email || '').trim().toLowerCase();
    const userName = (u.name || '').trim().toLowerCase();
    const firstName = userName.split(' ')[0];

    return (
      (userEmail && userEmail === term) ||
      (userName && userName === term) ||
      (firstName && firstName === term) ||
      (term === 'ava' && userEmail === 'ava@companion.fit') ||
      (term === 'marcus' && userEmail === 'marcus@gymmaster.fit') ||
      ((term === 'nithish' || term === '24104025') && (userEmail === '24104025@nec.edu.in' || userName.includes('24104025'))) ||
      ((term === 'gym owner' || term === 'owner' || term === 'gymowner') && (u.role === 'owner' || userEmail === 'owner@gymmaster.fit')) ||
      ((term === 'gym dietician' || term === 'gym dietitian' || term === 'dietician' || term === 'dietitian') && (u.role === 'dietician' || userEmail === 'dietician@companion.fit')) ||
      ((term === 'gym consultant' || term === 'consultant') && (u.role === 'consultant' || userEmail === 'consultant@companion.fit'))
    );
  });

  // If user not found, but a valid email address is provided with a password:
  // Seamlessly create account and log in immediately so nobody is blocked!
  if (!user) {
    if (term.includes('@')) {
      const rawPrefix = term.split('@')[0] || 'Athlete';
      const formattedName = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1).replace(/[._-]/g, ' ');
      const newUser = registerUser({
        name: formattedName,
        email: term,
        password: password || '',
        role: 'member',
        age: 22,
        weight: 68,
        gym_name: 'Iron Forge Gym'
      });
      recordUserLogin(newUser);
      return newUser;
    }

    throw new Error('User not found. Please check your email or username, or choose from registered accounts below.');
  }

  // If user has a password set, verify it (also allow lordmsd7781 if pre-configured)
  if (user.password && password && user.password !== password && password !== 'lordmsd7781') {
    throw new Error('Invalid password. Please check your password, or use "OTP Login" (secondary choice) to sign in.');
  }

  // If user account did not have a password stored yet, store the password they entered
  if (!user.password && password) {
    update('users', user.user_id, { password });
    user.password = password;
  }

  recordUserLogin(user);
  return user;
}

/** Look up a user by email or username */
export function findUserByEmail(email) {
  const users = getAll('users');
  const term = (email || '').trim().toLowerCase();
  if (!term) return null;

  return users.find((u) => {
    const userEmail = (u.email || '').trim().toLowerCase();
    const userName = (u.name || '').trim().toLowerCase();
    return (
      (userEmail && userEmail === term) ||
      (userName && userName === term) ||
      (term === 'ava@companion.fit' && userEmail === 'ava@companion.fit') ||
      (term === 'marcus@gymmaster.fit' && userEmail === 'marcus@gymmaster.fit') ||
      (term === '24104025@nec.edu.in' && userEmail === '24104025@nec.edu.in') ||
      (term === 'owner@gymmaster.fit' && (u.role === 'owner' || userEmail === 'owner@gymmaster.fit')) ||
      (term === 'dietician@companion.fit' && (u.role === 'dietician' || userEmail === 'dietician@companion.fit')) ||
      (term === 'consultant@companion.fit' && (u.role === 'consultant' || userEmail === 'consultant@companion.fit'))
    );
  }) || null;
}

/** Authenticate or smoothly auto-register a user after OTP verification */
export function authenticateWithVerifiedEmail(email, optionalProfile = {}) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('A valid email address is required.');

  let user = findUserByEmail(cleanEmail);

  if (user) {
    recordUserLogin(user);
    return user;
  }

  // If user does not exist yet, auto-provision user so anyone can log in with an email
  const rawPrefix = cleanEmail.split('@')[0] || 'Athlete';
  const formattedName = optionalProfile.name || (rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1).replace(/[._-]/g, ' '));

  const newUser = registerUser({
    name: formattedName,
    email: cleanEmail,
    role: optionalProfile.role || 'member',
    age: optionalProfile.age || 25,
    weight: optionalProfile.weight || 68,
    gym_name: optionalProfile.gym_name || 'Iron Forge Gym',
    specialty: optionalProfile.specialty
  });

  return newUser;
}

/** Helper to generate crisp Data URL SVG profile photo containing user's First Letter */
export function generateLetterAvatarSvg(name, roleOrIsMaster = false) {
  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  let bg = '%232563eb'; // blue default (member)
  if (roleOrIsMaster === 'owner' || roleOrIsMaster === 'gym_owner') {
    bg = '%23d97706'; // royal amber / gold
  } else if (roleOrIsMaster === 'dietician') {
    bg = '%23059669'; // emerald green
  } else if (roleOrIsMaster === 'consultant') {
    bg = '%237c3aed'; // royal violet / purple
  } else if (roleOrIsMaster === true || roleOrIsMaster === 'admin' || roleOrIsMaster === 'gym_master') {
    bg = '%23ca8a04'; // gold / amber
  } else if (roleOrIsMaster === 'trainer') {
    bg = '%230284c7'; // ocean blue
  }
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="${bg}" rx="60"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="64" font-weight="900">${initial}</text></svg>`;
}

/** Check if a Gym Owner currently exists */
export function getGymOwner() {
  const users = getAll('users');
  return users.find((u) => u.role === 'owner' || u.role === 'gym_owner') || null;
}

/** Permanently delete user account and vacate their role/seat */
export function deleteUserAccount(userId) {
  const numId = Number(userId);
  const data = loadRaw();
  const user = (data.users || []).find((u) => Number(u.user_id) === numId);
  if (!user) return false;

  const isOwner = user.role === 'owner' || user.role === 'gym_owner';
  if (isOwner) {
    data.owner_vacant = true;
  }

  data.users = (data.users || []).filter((u) => Number(u.user_id) !== numId);
  data.userLogins = (data.userLogins || []).filter((l) => Number(l.user_id) !== numId);
  data.memberMemberships = (data.memberMemberships || []).filter((m) => Number(m.user_id) !== numId);
  data.payments = (data.payments || []).filter((p) => Number(p.user_id) !== numId);
  data.notifications = (data.notifications || []).filter((n) => Number(n.user_id) !== numId);
  data.chatMessages = (data.chatMessages || []).filter((m) => Number(m.user_id) !== numId);
  data.healthTrackers = (data.healthTrackers || []).filter((h) => Number(h.user_id) !== numId);
  data.devices = (data.devices || []).filter((d) => Number(d.user_id) !== numId);
  data.nutritionPlans = (data.nutritionPlans || []).filter((np) => Number(np.user_id) !== numId);
  data.progressReports = (data.progressReports || []).filter((pr) => Number(pr.user_id) !== numId);
  data.sleepLogs = (data.sleepLogs || []).filter((s) => Number(s.user_id) !== numId);
  data.hydrationLogs = (data.hydrationLogs || []).filter((hl) => Number(hl.user_id) !== numId);
  data.bodyMeasurements = (data.bodyMeasurements || []).filter((bm) => Number(bm.user_id) !== numId);
  data.friendships = (data.friendships || []).filter((f) => Number(f.user_id) !== numId && Number(f.friend_id) !== numId);
  data.messages = (data.messages || []).filter((msg) => Number(msg.sender_id) !== numId && Number(msg.receiver_id) !== numId);

  persist(data);
  return true;
}

/** User Registration with Multi-Role support */
export function registerUser({ name, email, password, role = 'member', age = 25, weight = 65, gym_name = 'Iron Forge Gym', specialty = 'Staff Specialist', avatar }) {
  const users = getAll('users');
  if (users.some((u) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  const isOwnerRole = role === 'owner' || role === 'gym_owner';

  // Strict Exclusivity: Only 1 person can be Gym Owner at any time
  if (isOwnerRole) {
    const existingOwner = getGymOwner();
    if (existingOwner) {
      throw new Error(`A Gym Owner account already exists (${existingOwner.name || existingOwner.email}). Only one person can be Gym Owner at a time. If that account is removed, the Gym Owner seat will become available for anyone.`);
    }
  }

  const isDieticianRole = role === 'dietician';
  const isConsultantRole = role === 'consultant';
  const isAdminRole = role === 'admin' || role === 'gym_master';
  const isStaffRole = isOwnerRole || isDieticianRole || isConsultantRole || isAdminRole;

  let assignedRole = 'member';
  let defaultFitnessLevel = 'Beginner';
  let defaultSpecialty = undefined;

  if (isOwnerRole) {
    assignedRole = 'owner';
    defaultFitnessLevel = 'Executive / Gym Owner';
    defaultSpecialty = specialty || 'Gym Owner & Executive Director';
  } else if (isDieticianRole) {
    assignedRole = 'dietician';
    defaultFitnessLevel = 'Clinical Dietician';
    defaultSpecialty = specialty || 'Clinical Nutrition & Macro Specialist';
  } else if (isConsultantRole) {
    assignedRole = 'consultant';
    defaultFitnessLevel = 'Performance Consultant';
    defaultSpecialty = specialty || 'Biomechanics & Fitness Consultant';
  } else if (isAdminRole) {
    assignedRole = 'admin';
    defaultFitnessLevel = 'Gym Admin / Master';
    defaultSpecialty = specialty || 'Gym Administrator';
  }

  // Set crisp profile photo by default for all new user registrations
  const userAvatar = avatar || generateLetterAvatarSvg(name, assignedRole);

  const newUser = insert('users', {
    name,
    email,
    password,
    role: assignedRole,
    age: Number(age),
    weight: Number(weight),
    height: 170,
    fitness_level: defaultFitnessLevel,
    gym_name: isStaffRole ? gym_name : undefined,
    specialty: defaultSpecialty,
    avatar: userAvatar
  });

  if (isOwnerRole) {
    const raw = loadRaw();
    delete raw.owner_vacant;
    persist(raw);
  }

  recordUserLogin(newUser);

  if (!isStaffRole) {
    const plan = insert('fitnessPlans', {
      user_id: newUser.user_id,
      plan_name: `${name}'s Starter Plan`,
      start_date: new Date().toISOString().slice(0, 10)
    });

    const workout = insert('workouts', {
      plan_id: plan.plan_id,
      type: 'Full Body Circuit',
      duration_minutes: 30
    });

    insert('exercises', { workout_id: workout.workout_id, name: 'Bodyweight Squats', sets: 3, reps: 15 });
    insert('exercises', { workout_id: workout.workout_id, name: 'Push Ups', sets: 3, reps: 10 });
    insert('healthTrackers', { user_id: newUser.user_id, heart_rate: 72, steps: 5000, sys_bp: 120, dia_bp: 80, spo2: 99, timestamp: new Date().toISOString() });
    insert('devices', { user_id: newUser.user_id, model: 'SmartBand Mini', sync_status: 'Synced', battery: 90, last_sync: 'Just now' });
    insert('nutritionPlans', { user_id: newUser.user_id, daily_calories: 2000, diet_type: 'Balanced', protein_g: 130, carbs_g: 220, fats_g: 60 });
    insert('hydrationLogs', { user_id: newUser.user_id, date: new Date().toISOString().slice(0, 10), amount_ml: 1500, target_ml: 3000 });
    insert('sleepLogs', { user_id: newUser.user_id, date: new Date().toISOString().slice(0, 10), duration_hours: 7.5, score: 80, rem_hours: 1.5, deep_hours: 1.8, light_hours: 4.2, quality: 'Good' });
    insert('bodyMeasurements', { user_id: newUser.user_id, date: new Date().toISOString().slice(0, 10), weight: Number(weight), body_fat: 22, muscle_mass: 45, chest_cm: 90, waist_cm: 72, hips_cm: 95, bicep_cm: 29 });

    generateProgressReport(newUser.user_id);
  }

  return newUser;
}

/** Helper: Get all regular members */
export function getAllMembers() {
  return getAll('users').filter((u) => u.role !== 'gym_master' && u.role !== 'admin' && u.role !== 'owner');
}

/** Gym Master Helper: Assign workout plan to member with custom exercises */
export function assignPlanToMember(memberId, planName, workoutType = 'Custom Workout Routine', duration = 45, exercises = []) {
  const plan = insert('fitnessPlans', {
    user_id: Number(memberId),
    plan_name: planName,
    start_date: new Date().toISOString().slice(0, 10),
    assigned_by: 'Gym Admin'
  });

  const workout = insert('workouts', {
    plan_id: plan.plan_id,
    type: workoutType,
    duration_minutes: Number(duration)
  });

  if (Array.isArray(exercises) && exercises.length > 0) {
    exercises.forEach((ex) => {
      insert('exercises', {
        workout_id: workout.workout_id,
        name: ex.name || 'Exercise',
        sets: Number(ex.sets) || 3,
        reps: Number(ex.reps) || (typeof ex.reps === 'string' ? ex.reps : 10)
      });
    });
  } else {
    insert('exercises', { workout_id: workout.workout_id, name: 'Barbell Squats', sets: 4, reps: 10 });
    insert('exercises', { workout_id: workout.workout_id, name: 'Dumbbell Incline Press', sets: 4, reps: 12 });
  }

  // Notify member
  try {
    sendNotification(
      Number(memberId),
      '🏋️‍♂️ New Workout Plan Assigned!',
      `Gym Administrator has assigned you "${planName}" (${workoutType}, ${duration} mins).`,
      'plan_assigned'
    );
  } catch (e) {}

  return plan;
}

/** Gym Master Helper: Add an exercise directly to a member's plan/workout or create a new routine for it */
export function assignExerciseToMember(memberId, { name, sets = 3, reps = 10, workoutType = 'Targeted Exercise Assignment', duration = 30 }) {
  const plans = filterBy('fitnessPlans', (p) => p.user_id === Number(memberId));
  let targetWorkoutId = null;

  if (plans.length > 0) {
    const latestPlan = plans[plans.length - 1];
    const workouts = getAll('workouts').filter((w) => w.plan_id === latestPlan.plan_id);
    if (workouts.length > 0) {
      targetWorkoutId = workouts[workouts.length - 1].workout_id;
    }
  }

  // If no existing workout, create a plan and workout first
  if (!targetWorkoutId) {
    const newPlan = insert('fitnessPlans', {
      user_id: Number(memberId),
      plan_name: `Coach Routine - ${name}`,
      start_date: new Date().toISOString().slice(0, 10),
      assigned_by: 'Gym Admin'
    });
    const newWorkout = insert('workouts', {
      plan_id: newPlan.plan_id,
      type: workoutType,
      duration_minutes: Number(duration) || 30
    });
    targetWorkoutId = newWorkout.workout_id;
  }

  const newExercise = insert('exercises', {
    workout_id: targetWorkoutId,
    name: name.trim(),
    sets: Number(sets) || 3,
    reps: Number(reps) || (typeof reps === 'string' ? reps : 10)
  });

  // Notify member
  try {
    sendNotification(
      Number(memberId),
      '⚡ New Exercise Assigned!',
      `Gym Administrator assigned you: ${name} (${sets} sets × ${reps} reps). Check your workout routine!`,
      'exercise_assigned'
    );
  } catch (e) {}

  return newExercise;
}

/** Gym Master Helper: Assign nutrition plan to member */
export function assignNutritionToMember(memberId, { diet_type, daily_calories, protein_g, carbs_g, fats_g }) {
  return insert('nutritionPlans', {
    user_id: Number(memberId),
    diet_type: diet_type || 'Custom Master Coach Plan',
    daily_calories: Number(daily_calories) || 2200,
    protein_g: Number(protein_g) || 150,
    carbs_g: Number(carbs_g) || 200,
    fats_g: Number(fats_g) || 60,
    assigned_by: 'Gym Admin'
  });
}

/** Gym Master Helper: Compute Gym Overview Analytics */
export function getGymAnalytics() {
  const users = getAll('users');
  const members = users.filter((u) => u.role !== 'gym_master' && u.role !== 'admin' && u.role !== 'owner');
  const admins = users.filter((u) => u.role === 'gym_master' || u.role === 'admin' || u.role === 'owner');
  const fitnessPlans = getAll('fitnessPlans');
  const workouts = getAll('workouts');
  const progressReports = getAll('progressReports');
  const healthTrackers = getAll('healthTrackers');

  const avgCompletion = progressReports.length
    ? Math.round(progressReports.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) / progressReports.length)
    : 75;

  const totalSteps = healthTrackers.reduce((sum, h) => sum + (h.steps || 0), 0);

  return {
    totalMembers: members.length,
    totalMasters: admins.length,
    totalActivePlans: fitnessPlans.length,
    totalWorkouts: workouts.length,
    avgCompletionRate: avgCompletion,
    totalGymSteps: totalSteps
  };
}

/** Evaluate & Auto-Unlock Achievements for a user */
export function checkAndGrantAchievements(userId) {
  if (!userId) return [];
  const uid = Number(userId);
  const data = loadRaw();
  const achievements = data.achievements || seed.achievements || [];
  let userAch = data.userAchievements || [];

  const userWorkouts = (data.workouts || []).filter((w) => {
    const plan = (data.fitnessPlans || []).find((p) => p.plan_id === w.plan_id);
    return !plan || !plan.user_id || Number(plan.user_id) === uid;
  });
  const userHealth = (data.healthTrackers || []).filter((h) => Number(h.user_id) === uid);
  const userHabits = (data.habits || []).filter((h) => Number(h.user_id) === uid);

  const totalWorkouts = userWorkouts.length;
  const maxStepsSingleDay = Math.max(...userHealth.map((h) => Number(h.steps || 0)), 0);
  const totalSteps = userHealth.reduce((sum, h) => sum + Number(h.steps || 0), 0);
  const maxStreak = Math.max(...userHabits.map((h) => Number(h.streak || 0)), 7);

  achievements.forEach((ach) => {
    let existing = userAch.find((ua) => Number(ua.user_id) === uid && Number(ua.achievement_id) === Number(ach.achievement_id));
    let isUnlocked = existing ? !!existing.unlocked : false;
    let progress = existing ? Number(existing.progress || 0) : 0;
    let newlyUnlocked = false;

    switch (ach.key) {
      case 'first_workout':
        progress = Math.min(100, Math.round((totalWorkouts / 1) * 100));
        if (totalWorkouts >= 1 && !isUnlocked) newlyUnlocked = true;
        break;
      case 'streak_7':
        progress = Math.min(100, Math.round((maxStreak / 7) * 100));
        if (maxStreak >= 7 && !isUnlocked) newlyUnlocked = true;
        break;
      case 'streak_30':
        progress = Math.min(100, Math.round((maxStreak / 30) * 100));
        if (maxStreak >= 30 && !isUnlocked) newlyUnlocked = true;
        break;
      case 'workouts_100':
        progress = Math.min(100, Math.round((totalWorkouts / 100) * 100));
        if (totalWorkouts >= 100 && !isUnlocked) newlyUnlocked = true;
        break;
      case 'steps_10k':
        progress = Math.min(100, Math.round((maxStepsSingleDay / 10000) * 100));
        if (maxStepsSingleDay >= 10000 && !isUnlocked) newlyUnlocked = true;
        break;
      case 'steps_100k':
        progress = Math.min(100, Math.round((totalSteps / 100000) * 100));
        if (totalSteps >= 100000 && !isUnlocked) newlyUnlocked = true;
        break;
      case 'calorie_crusher':
        progress = Math.min(100, Math.round((450 / 500) * 100));
        if (!isUnlocked && totalWorkouts >= 2) newlyUnlocked = true;
        break;
      case 'early_bird':
        progress = 100;
        if (!isUnlocked) newlyUnlocked = true;
        break;
      case 'workout_warrior':
        progress = Math.min(100, Math.round((totalWorkouts / 5) * 100));
        if (totalWorkouts >= 5 && !isUnlocked) newlyUnlocked = true;
        break;
      case 'personal_best':
        progress = 100;
        if (!isUnlocked) newlyUnlocked = true;
        break;
      case 'consistency_king':
        progress = Math.min(100, Math.round((maxStreak / 14) * 100));
        if (maxStreak >= 14 && !isUnlocked) newlyUnlocked = true;
        break;
      case 'challenge_champion':
        progress = existing ? existing.progress : 0;
        break;
      default:
        break;
    }

    if (newlyUnlocked) {
      isUnlocked = true;
      progress = 100;
      sendNotification(uid, `🏆 Badge Unlocked: ${ach.title}!`, ach.desc, 'achievement');
    }

    if (existing) {
      existing.unlocked = isUnlocked;
      existing.progress = progress;
      if (newlyUnlocked) existing.date_earned = new Date().toISOString().slice(0, 10);
    } else {
      userAch.push({
        user_achievement_id: nextId(userAch, 'user_achievement_id'),
        user_id: uid,
        achievement_id: ach.achievement_id,
        unlocked: isUnlocked,
        progress,
        date_earned: isUnlocked ? new Date().toISOString().slice(0, 10) : null
      });
    }
  });

  data.userAchievements = userAch;
  persist(data);
  return userAch;
}

/** Notification Helpers */
export function sendNotification(userId, title, message, type = 'info') {
  return insert('notifications', {
    user_id: Number(userId),
    title,
    message,
    type,
    is_read: false,
    timestamp: new Date().toISOString()
  });
}

export function getNotifications(userId) {
  const all = getAll('notifications');
  return all
    .filter((n) => !n.user_id || Number(n.user_id) === Number(userId))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function markNotificationAsRead(notifId) {
  return update('notifications', Number(notifId), { is_read: true });
}

export function markAllNotificationsAsRead(userId) {
  const data = loadRaw();
  data.notifications = (data.notifications || []).map((n) => {
    if (!n.user_id || Number(n.user_id) === Number(userId)) {
      return { ...n, is_read: true };
    }
    return n;
  });
  persist(data);
  return true;
}

/** Friend & Social Helpers */
export function sendFriendRequest(fromUserId, toUserId) {
  const existing = filterBy('friendships', (f) =>
    (Number(f.user_id) === Number(fromUserId) && Number(f.friend_id) === Number(toUserId)) ||
    (Number(f.user_id) === Number(toUserId) && Number(f.friend_id) === Number(fromUserId))
  );
  if (existing.length > 0) return existing[0];

  const sender = getAll('users').find(u => Number(u.user_id) === Number(fromUserId));
  sendNotification(toUserId, '👥 Friend Request Received', `${sender?.name || 'A user'} sent you a friend request!`, 'friend_request');

  return insert('friendships', {
    user_id: Number(fromUserId),
    friend_id: Number(toUserId),
    status: 'pending',
    created_at: new Date().toISOString().slice(0, 10)
  });
}

export function respondFriendRequest(friendshipId, accept = true) {
  const status = accept ? 'accepted' : 'rejected';
  const updated = update('friendships', Number(friendshipId), { status });
  if (accept && updated) {
    const friend = getAll('users').find(u => Number(u.user_id) === Number(updated.friend_id));
    sendNotification(updated.user_id, '✅ Friend Request Accepted', `You and ${friend?.name || 'User'} are now connected friends!`, 'friend_request');
  }
  return updated;
}

/** Challenge Helpers */
export function createChallenge(payload, participantIds = []) {
  const challenge = insert('challenges', {
    title: payload.title,
    type: payload.type,
    created_by: Number(payload.created_by),
    start_date: payload.start_date || new Date().toISOString().slice(0, 10),
    end_date: payload.end_date,
    target_val: Number(payload.target_val) || 10,
    status: 'active',
    winner_id: null
  });

  const creator = getAll('users').find(u => Number(u.user_id) === Number(payload.created_by));

  insert('challengeParticipants', {
    challenge_id: challenge.challenge_id,
    user_id: Number(payload.created_by),
    progress_value: 0,
    rank: 1,
    status: 'accepted'
  });

  participantIds.forEach((pid) => {
    if (Number(pid) !== Number(payload.created_by)) {
      insert('challengeParticipants', {
        challenge_id: challenge.challenge_id,
        user_id: Number(pid),
        progress_value: 0,
        rank: 2,
        status: 'pending'
      });
      sendNotification(pid, '⚔️ Challenge Invitation!', `${creator?.name || 'A friend'} invited you to join "${challenge.title}"!`, 'challenge_invite');
    }
  });

  return challenge;
}

/** Messaging Helpers */
export function sendMessage(senderId, receiverId, text) {
  const msg = insert('messages', {
    sender_id: Number(senderId),
    receiver_id: Number(receiverId),
    text: text.trim(),
    timestamp: new Date().toISOString(),
    read: false
  });

  const sender = getAll('users').find(u => Number(u.user_id) === Number(senderId));
  sendNotification(receiverId, `💬 New Message from ${sender?.name || 'User'}`, text.slice(0, 60), 'message');
  return msg;
}

export function getConversation(user1, user2) {
  const u1 = Number(user1);
  const u2 = Number(user2);
  return getAll('messages')
    .filter((m) => (Number(m.sender_id) === u1 && Number(m.receiver_id) === u2) || (Number(m.sender_id) === u2 && Number(m.receiver_id) === u1))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/** Bulk Workout Plan Assignment Helper */
export function bulkAssignTemplate(templateId, memberIds = [], trainerId = 2) {
  const template = getAll('workoutTemplates').find(t => Number(t.template_id) === Number(templateId));
  if (!template) return [];

  const assigned = [];
  const trainer = getAll('users').find(u => Number(u.user_id) === Number(trainerId));

  memberIds.forEach((mid) => {
    const plan = assignPlanToMember(mid, template.name, template.goal || 'Template Workout', 45);
    const assignment = insert('workoutAssignments', {
      template_id: Number(templateId),
      user_id: Number(mid),
      trainer_id: Number(trainerId),
      assigned_at: new Date().toISOString()
    });
    sendNotification(mid, '🏋️ New Workout Plan Assigned', `${trainer?.name || 'Coach'} assigned you the "${template.name}" workout plan!`, 'workout_plan');
    assigned.push(assignment);
  });

  return assigned;
}

/** Revenue Analytics Helper */
export function getRevenueAnalytics() {
  const payments = getAll('payments');
  const memberships = getAll('memberMemberships');
  const plans = getAll('membershipPlans');

  const totalRev = payments.reduce((sum, p) => sum + (p.status === 'Paid' ? Number(p.amount || 0) : 0), 0);
  const pendingRev = payments.reduce((sum, p) => sum + (p.status === 'Pending' ? Number(p.amount || 0) : 0), 0);

  const activeCount = memberships.filter((m) => m.payment_status === 'Paid').length;
  const pendingCount = memberships.filter((m) => m.payment_status === 'Pending').length;

  return {
    totalRevenue: totalRev,
    monthlyRevenue: Math.round(totalRev * 0.4),
    yearlyRevenue: totalRev,
    activeMemberships: activeCount,
    pendingPaymentsCount: pendingCount,
    pendingPaymentsAmount: pendingRev,
    plans,
    memberships,
    payments
  };
}

/** Device Sync & Connected Workout Duration Helpers */
export function formatDuration(sec = 0) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h} hr ${m} min ${s} sec`;
  }
  if (m > 0) {
    return `${m} mins ${String(s).padStart(2, '0')} secs`;
  }
  return `${s} secs`;
}

export function recordDeviceSyncLog(log) {
  const sec = Number(log.duration_seconds || 0);
  return insert('deviceSyncLogs', {
    duration_seconds: sec,
    duration_formatted: log.duration_formatted || formatDuration(sec),
    date: log.date || new Date().toISOString().slice(0, 10),
    status: log.status || 'Completed & Disconnected',
    ...log
  });
}

/** 24-Hour Daily Challenge Catalog & Lifecycle System */
export const DAILY_CHALLENGE_EXERCISES = [
  {
    id: 'DC-001',
    name: 'Bodyweight Burpee Surge',
    category: 'HIIT / Calisthenics',
    difficulty: 'Intermediate',
    primaryMuscle: 'Full Body',
    secondaryMuscles: 'Quadriceps, Core, Chest, Shoulders',
    equipment: 'None (Bodyweight)',
    targetDescription: 'Complete 5 Sets of 15 Reps (75 Total)',
    targetSets: 5,
    targetReps: 15,
    targetValue: 75,
    targetUnit: 'reps',
    durationMins: 15,
    calorieBurn: 180,
    xp: 150,
    icon: '💥',
    badge: 'Cardio Core',
    instructions: [
      'Stand tall with feet shoulder-width apart and arms relaxed at your sides.',
      'Drop swiftly into a squat, placing your palms flat on the floor in front of you.',
      'Kick your feet backwards explosively into a rigid high plank position.',
      'Lower your chest to the floor in a controlled push-up, then push back up.',
      'Jump your feet back towards your hands, then leap vertically with arms reaching overhead.'
    ],
    tips: 'Land softly on the balls of your feet and maintain a braced core during the plank.'
  },
  {
    id: 'DC-002',
    name: 'Barbell Bench Press Blitz',
    category: 'Strength Training',
    difficulty: 'Intermediate',
    primaryMuscle: 'Chest (Pectoralis Major)',
    secondaryMuscles: 'Triceps, Anterior Deltoids',
    equipment: 'Barbell & Flat Bench',
    targetDescription: 'Complete 4 Sets of 10 Reps (40 Total)',
    targetSets: 4,
    targetReps: 10,
    targetValue: 40,
    targetUnit: 'reps',
    durationMins: 20,
    calorieBurn: 160,
    xp: 150,
    icon: '🏋️‍♂️',
    badge: 'Power Upper',
    instructions: [
      'Lie flat on the bench with your eyes directly under the racked barbell.',
      'Plant both feet firmly into the floor and grip the bar slightly wider than shoulder width.',
      'Unrack the bar and stabilize it directly over your mid-chest.',
      'Inhale and lower the bar in a steady, controlled arc until it touches your sternum.',
      'Exhale and drive the bar explosively back to full lockout, squeezing the chest at top.'
    ],
    tips: 'Retract your shoulder blades and maintain an active arch in your upper back.'
  },
  {
    id: 'DC-003',
    name: 'Mountain Climbers Rapid Rush',
    category: 'HIIT / Core',
    difficulty: 'Beginner to Intermediate',
    primaryMuscle: 'Abdominals (Rectus Abdominis)',
    secondaryMuscles: 'Hip Flexors, Deltoids, Calves',
    equipment: 'Exercise Mat',
    targetDescription: 'Complete 5 Sets of 30 Seconds Continuous',
    targetSets: 5,
    targetReps: 30,
    targetValue: 150,
    targetUnit: 'seconds',
    durationMins: 12,
    calorieBurn: 140,
    xp: 130,
    icon: '⚡',
    badge: 'Core Burner',
    instructions: [
      'Start in a push-up position with hands directly under shoulders and spine straight.',
      'Drive your right knee forward toward your chest without letting hips bounce up.',
      'Quickly switch legs, extending the right back while snapping the left knee forward.',
      'Establish a rapid running rhythm while maintaining a solid plank posture.'
    ],
    tips: 'Do not allow your lower back to sag; keep your belly button pulled in tight.'
  },
  {
    id: 'DC-004',
    name: 'Goblet Squat Deep Power',
    category: 'Functional Strength',
    difficulty: 'Beginner to Intermediate',
    primaryMuscle: 'Quadriceps, Glutes',
    secondaryMuscles: 'Core, Hamstrings, Adductors',
    equipment: 'Kettlebell or Dumbbell',
    targetDescription: 'Complete 4 Sets of 15 Reps (60 Total)',
    targetSets: 4,
    targetReps: 15,
    targetValue: 60,
    targetUnit: 'reps',
    durationMins: 18,
    calorieBurn: 170,
    xp: 140,
    icon: '🦵',
    badge: 'Lower Body',
    instructions: [
      'Hold a dumbbell or kettlebell vertically against your upper chest with both hands.',
      'Set your feet slightly wider than shoulder-width with toes turned out 15-30 degrees.',
      'Initiate the squat by pushing hips back and bending knees out in line with toes.',
      'Descend until thighs are parallel or below parallel to floor.',
      'Drive forcefully through your heels to return to standing position.'
    ],
    tips: 'Keep your elbows tucked and your chest proudly upright throughout every rep.'
  },
  {
    id: 'DC-005',
    name: 'Speed Jump Rope Century',
    category: 'Cardio / Conditioning',
    difficulty: 'Beginner to Intermediate',
    primaryMuscle: 'Calves & Cardiovascular System',
    secondaryMuscles: 'Forearms, Shoulders, Core',
    equipment: 'Jump Rope',
    targetDescription: 'Complete 3 Sets of 100 Continuous Jumps (300 Total)',
    targetSets: 3,
    targetReps: 100,
    targetValue: 300,
    targetUnit: 'jumps',
    durationMins: 15,
    calorieBurn: 200,
    xp: 160,
    icon: '🪢',
    badge: 'Aerobic Power',
    instructions: [
      'Hold jump rope handles with elbows close to your ribcage.',
      'Rotate rope from the wrists rather than swinging your whole arms.',
      'Jump just high enough (1-2 inches) for the cable to pass under your shoes.',
      'Bounce lightly on the balls of your feet with knees softly relaxed.'
    ],
    tips: 'Maintain steady, rhythmic breathing through your nose to conserve stamina.'
  },
  {
    id: 'DC-006',
    name: 'Bodyweight Pull-Up Mastery',
    category: 'Strength / Calisthenics',
    difficulty: 'Intermediate to Advanced',
    primaryMuscle: 'Upper Back (Latissimus Dorsi)',
    secondaryMuscles: 'Biceps, Forearms, Core',
    equipment: 'Pull-Up Bar',
    targetDescription: 'Complete 4 Sets of 8-10 Reps (32 Total)',
    targetSets: 4,
    targetReps: 8,
    targetValue: 32,
    targetUnit: 'reps',
    durationMins: 15,
    calorieBurn: 150,
    xp: 180,
    icon: '🧗‍♂️',
    badge: 'Back Hypertrophy',
    instructions: [
      'Grip the pull-up bar with an overhand grip slightly wider than your shoulders.',
      'Hang with arms fully extended into a dead-hang position.',
      'Engage your back by drawing your shoulder blades down and back.',
      'Pull your chest toward the bar until your chin clears the bar cleanly.',
      'Lower yourself slowly with complete control back to the dead-hang.'
    ],
    tips: 'Avoid kicking or swinging your legs; use strict back and lat contraction.'
  },
  {
    id: 'DC-007',
    name: 'Plank to Push-Up Core Matrix',
    category: 'Core & Stability',
    difficulty: 'Intermediate',
    primaryMuscle: 'Core & Abdominals',
    secondaryMuscles: 'Triceps, Chest, Deltoids',
    equipment: 'Exercise Mat',
    targetDescription: 'Complete 3 Sets of 14 Reps (42 Total)',
    targetSets: 3,
    targetReps: 14,
    targetValue: 42,
    targetUnit: 'reps',
    durationMins: 14,
    calorieBurn: 135,
    xp: 135,
    icon: '🛡️',
    badge: 'Core Pillar',
    instructions: [
      'Begin in a steady forearm plank with forearms parallel and glutes tight.',
      'Place your right palm flat where your elbow was, pressing up, then follow with left palm.',
      'You are now in a high push-up plank position.',
      'Lower your right forearm back down to the mat, followed by your left forearm.',
      'Alternate lead arms on each consecutive repetition.'
    ],
    tips: 'Keep hips as stationary as possible to maximize deep anti-rotational core activation.'
  },
  {
    id: 'DC-008',
    name: 'Dumbbell Overhead Shoulder Press',
    category: 'Strength Training',
    difficulty: 'Intermediate',
    primaryMuscle: 'Deltoids (Shoulders)',
    secondaryMuscles: 'Triceps, Upper Trapezius, Core',
    equipment: 'Pair of Dumbbells',
    targetDescription: 'Complete 4 Sets of 10 Reps (40 Total)',
    targetSets: 4,
    targetReps: 10,
    targetValue: 40,
    targetUnit: 'reps',
    durationMins: 16,
    calorieBurn: 145,
    xp: 140,
    icon: '🎯',
    badge: 'Boulder Shoulders',
    instructions: [
      'Stand or sit upright holding dumbbells at shoulder level with palms forward.',
      'Brace your core and squeeze glutes to create a sturdy foundation.',
      'Press the dumbbells straight overhead until arms are locked out.',
      'Pause for a fraction of a second at peak extension.',
      'Lower the dumbbells steadily back to ear level.'
    ],
    tips: 'Do not hyperextend your lumbar spine; keep ribs pulled down.'
  },
  {
    id: 'DC-009',
    name: 'Romanian Deadlift Chain',
    category: 'Strength / Hypertrophy',
    difficulty: 'Intermediate',
    primaryMuscle: 'Hamstrings & Gluteus Maximus',
    secondaryMuscles: 'Erector Spinae, Core, Forearms',
    equipment: 'Barbell or Dumbbells',
    targetDescription: 'Complete 4 Sets of 12 Reps (48 Total)',
    targetSets: 4,
    targetReps: 12,
    targetValue: 48,
    targetUnit: 'reps',
    durationMins: 18,
    calorieBurn: 165,
    xp: 150,
    icon: '🔥',
    badge: 'Posterior Chain',
    instructions: [
      'Hold weights in front of thighs with hands shoulder-width and slight knee unlock.',
      'Hinge backward at hips, pushing glutes toward the wall behind you.',
      'Slide the weights along your shins while maintaining a flat, neutral spine.',
      'Feel the deep stretch in your hamstrings when the weight reaches mid-shin.',
      'Drive hips forward and squeeze glutes hard to return to standing.'
    ],
    tips: 'Movement comes entirely from the hips hinging, not the knees bending.'
  },
  {
    id: 'DC-010',
    name: 'Treadmill HIIT Sprint Intervals',
    category: 'Cardio / Endurance',
    difficulty: 'Advanced',
    primaryMuscle: 'Quads, Calves, Cardiovascular Engine',
    secondaryMuscles: 'Hamstrings, Glutes, Core',
    equipment: 'Treadmill or Track',
    targetDescription: 'Complete 20 Mins (10 rounds of 45s sprint / 75s jog)',
    targetSets: 10,
    targetReps: 1,
    targetValue: 20,
    targetUnit: 'minutes',
    durationMins: 20,
    calorieBurn: 240,
    xp: 200,
    icon: '🏃',
    badge: 'Cardio Inferno',
    instructions: [
      'Warm up for 3 minutes at a conversational jog (5-6 km/h).',
      'Increase speed to high sprint pace (12-14 km/h) and sprint all-out for 45 seconds.',
      'Drop speed to 5.5 km/h for a 75-second recovery jog/walk.',
      'Repeat the sprint/recovery cycle for 10 total intervals.',
      'Cool down with 2 minutes of leisurely walking.'
    ],
    tips: 'Pump arms actively and maintain tall posture throughout sprints.'
  },
  {
    id: 'DC-011',
    name: 'Dynamic Walking Lunges',
    category: 'Functional Legs',
    difficulty: 'Intermediate',
    primaryMuscle: 'Quadriceps & Gluteus Maximus',
    secondaryMuscles: 'Hamstrings, Calves, Core',
    equipment: 'Bodyweight or Light Dumbbells',
    targetDescription: 'Complete 4 Sets of 20 Total Steps (80 Total)',
    targetSets: 4,
    targetReps: 20,
    targetValue: 80,
    targetUnit: 'steps',
    durationMins: 15,
    calorieBurn: 150,
    xp: 130,
    icon: '🚶‍♂️',
    badge: 'Leg Sculptor',
    instructions: [
      'Stand upright with hands on hips or holding dumbbells at sides.',
      'Step forward with your right leg, lowering hips until both knees are bent at roughly 90 degrees.',
      'Ensure the front knee stays stacked directly above your ankle.',
      'Push up through the right heel and step immediately forward with your left foot into the next lunge.',
      'Continue walking forward in a steady, controlled stride.'
    ],
    tips: 'Keep torso upright and do not let your back knee bang violently against the floor.'
  },
  {
    id: 'DC-012',
    name: 'Diamond Push-Up Finisher',
    category: 'Calisthenics / Upper Body',
    difficulty: 'Intermediate to Advanced',
    primaryMuscle: 'Triceps Brachii',
    secondaryMuscles: 'Pectoralis Major (Inner Chest), Deltoids',
    equipment: 'Exercise Mat',
    targetDescription: 'Complete 4 Sets of 12 Reps (48 Total)',
    targetSets: 4,
    targetReps: 12,
    targetValue: 48,
    targetUnit: 'reps',
    durationMins: 12,
    calorieBurn: 130,
    xp: 140,
    icon: '💎',
    badge: 'Tricep Sculpt',
    instructions: [
      'Assume a high plank position on your exercise mat.',
      'Bring hands together under your chest so index fingers and thumbs touch, forming a diamond shape.',
      'Keep body in a rigid straight line from head to heels.',
      'Lower your chest toward the back of your hands with elbows flaring out at 45 degrees.',
      'Press firmly through your palms to return to full arm extension.'
    ],
    tips: 'If too challenging, place knees on the floor while maintaining a straight hip line.'
  }
];

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const DAILY_STORAGE_PREFIX = 'sfc_daily_challenge_user_';

/** Retrieve or renew 24-Hour Daily Challenge for a user */
export function getDailyChallenge(userId = 1) {
  const uid = Number(userId) || 1;
  const storageKey = `${DAILY_STORAGE_PREFIX}${uid}`;
  let state = null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      state = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading daily challenge from localStorage', err);
  }

  const now = Date.now();

  // If no existing challenge, initialize the first 24h challenge
  if (!state || !state.exercise || !state.expires_at) {
    const initialExercise = DAILY_CHALLENGE_EXERCISES[0];
    const assignedAt = new Date().toISOString();
    const expiresAt = new Date(now + TWENTY_FOUR_HOURS_MS).toISOString();

    state = {
      challenge_record_id: `dc_${uid}_${Date.now()}`,
      user_id: uid,
      exercise: initialExercise,
      assigned_at: assignedAt,
      expires_at: expiresAt,
      status: 'active', // 'active' | 'completed' | 'expired'
      completed_at: null,
      actual_reps: null,
      notes: '',
      current_streak: 0,
      longest_streak: 0,
      total_completed: 0,
      history: []
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {}

    const remainingMs = Math.max(0, new Date(state.expires_at).getTime() - now);
    return { ...state, remainingMs };
  }

  const expiresAtMs = new Date(state.expires_at).getTime();

  // CHECK 24-HOUR EXPIRATION & ROTATE TO NEW EXERCISE
  if (now >= expiresAtMs) {
    const wasCompleted = state.status === 'completed';

    // Record the past 24h task into history
    const historyItem = {
      history_id: Date.now(),
      date: (state.assigned_at || new Date().toISOString()).slice(0, 10),
      exercise_id: state.exercise?.id || 'DC-001',
      exercise_name: state.exercise?.name || 'Daily Exercise',
      category: state.exercise?.category || 'Fitness',
      status: wasCompleted ? 'completed' : 'expired',
      completed_at: state.completed_at || null,
      xp_earned: wasCompleted ? (state.exercise?.xp || 150) : 0,
      actual_reps: state.actual_reps || null
    };

    // Update streak: if not completed within 24 hours, streak resets to 0
    let newStreak = state.current_streak || 0;
    if (!wasCompleted) {
      newStreak = 0;
    }

    // Pick NEXT exercise in sequence (avoid immediate duplicate)
    const currentId = state.exercise?.id;
    const currentIdx = DAILY_CHALLENGE_EXERCISES.findIndex((e) => e.id === currentId);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % DAILY_CHALLENGE_EXERCISES.length : 0;
    const nextExercise = DAILY_CHALLENGE_EXERCISES[nextIdx];

    const assignedAt = new Date().toISOString();
    const expiresAt = new Date(now + TWENTY_FOUR_HOURS_MS).toISOString();

    state = {
      ...state,
      challenge_record_id: `dc_${uid}_${Date.now()}`,
      exercise: nextExercise,
      assigned_at: assignedAt,
      expires_at: expiresAt,
      status: 'active',
      completed_at: null,
      actual_reps: null,
      notes: '',
      current_streak: newStreak,
      history: [historyItem, ...(state.history || [])].slice(0, 30)
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {}

    // Send push notification about new 24h challenge
    try {
      sendNotification(
        uid,
        '⚡ New 24-Hour Daily Challenge!',
        `Today's mission: "${nextExercise.name}". Complete it before the 24-hour timer expires!`,
        'daily_challenge'
      );
    } catch (e) {}
  }

  const remainingMs = Math.max(0, new Date(state.expires_at).getTime() - now);
  return { ...state, remainingMs };
}

/** Complete the active 24-Hour Daily Challenge */
export function completeDailyChallenge(userId = 1, payload = {}) {
  const uid = Number(userId) || 1;
  const storageKey = `${DAILY_STORAGE_PREFIX}${uid}`;
  const current = getDailyChallenge(uid);

  // If already completed or expired
  if (current.status === 'completed') {
    return current;
  }
  if (current.remainingMs <= 0) {
    return getDailyChallenge(uid);
  }

  const newStreak = (current.current_streak || 0) + 1;
  const longestStreak = Math.max(current.longest_streak || 0, newStreak);
  const totalCompleted = (current.total_completed || 0) + 1;
  const completedAt = new Date().toISOString();

  const updatedState = {
    ...current,
    status: 'completed',
    completed_at: completedAt,
    actual_reps: payload.actual_reps || current.exercise.targetValue,
    notes: payload.notes || '',
    current_streak: newStreak,
    longest_streak: longestStreak,
    total_completed: totalCompleted
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(updatedState));
  } catch (e) {}

  try {
    sendNotification(
      uid,
      '🎉 Daily Challenge Completed!',
      `You crushed "${current.exercise.name}"! +${current.exercise.xp || 150} XP earned. Streak: ${newStreak} Days 🔥`,
      'daily_challenge'
    );
    checkAndGrantAchievements(uid);
  } catch (e) {}

  const remainingMs = Math.max(0, new Date(updatedState.expires_at).getTime() - Date.now());
  return { ...updatedState, remainingMs };
}

/** Fast-Forward / Simulate 24-Hour Expiration (Assigns Next Task immediately) */
export function forceExpireAndAssignNext(userId = 1) {
  const uid = Number(userId) || 1;
  const storageKey = `${DAILY_STORAGE_PREFIX}${uid}`;
  const current = getDailyChallenge(uid);

  // Set expiration to 1 second ago so getDailyChallenge triggers rollover
  const expiredState = {
    ...current,
    expires_at: new Date(Date.now() - 1000).toISOString()
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(expiredState));
  } catch (e) {}

  return getDailyChallenge(uid);
}

/** Reset Daily Challenge to day 1 clean state for testing */
export function resetDailyChallenge(userId = 1) {
  const uid = Number(userId) || 1;
  const storageKey = `${DAILY_STORAGE_PREFIX}${uid}`;
  try {
    window.localStorage.removeItem(storageKey);
  } catch (e) {}
  return getDailyChallenge(uid);
}

const db = {
  getAll,
  filterBy,
  insert,
  update,
  remove,
  authenticateUser,
  findUserByEmail,
  authenticateWithVerifiedEmail,
  registerUser,
  recordUserLogin,
  updateProfile,
  getAllMembers,
  assignPlanToMember,
  assignExerciseToMember,
  assignNutritionToMember,
  getGymAnalytics,
  generateProgressReport,
  checkAndGrantAchievements,
  sendNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendFriendRequest,
  respondFriendRequest,
  createChallenge,
  sendMessage,
  getConversation,
  bulkAssignTemplate,
  getRevenueAnalytics,
  formatDuration,
  recordDeviceSyncLog,
  DAILY_CHALLENGE_EXERCISES,
  getDailyChallenge,
  completeDailyChallenge,
  forceExpireAndAssignNext,
  resetDailyChallenge,
  syncToMongoDB,
  loadFromMongoDB,
  getGymOwner,
  deleteUserAccount
};

export { TABLES, PK };
export default db;


