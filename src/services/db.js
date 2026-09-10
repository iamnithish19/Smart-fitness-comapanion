// src/services/db.js
//
// Tiny embedded database for Smart Fitness Companion.
// Persistent state via browser localStorage across 18 feature modules.

import seed from '../data/db.json';

const STORAGE_KEY = 'sfc_database_v7';
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
  'communityRankings'
];

const PK = {
  users: 'user_id',
  userLogins: 'log_id',
  fitnessPlans: 'plan_id',
  workouts: 'workout_id',
  exercises: 'exercise_id',
  healthTrackers: 'record_id',
  devices: 'device_id',
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
  communityRankings: 'rank'
};

function loadRaw() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = structuredClone(seed);
    if (!initial.userLogins) initial.userLogins = [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    persistTextFiles(initial);
    return initial;
  }
  try {
    const parsed = JSON.parse(stored);
    let modified = false;
    TABLES.forEach((table) => {
      if (!parsed[table]) {
        parsed[table] = structuredClone(seed[table] || []);
        modified = true;
      }
    });
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

function persist(data) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  persistTextFiles(data);
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
    if (row[pk] === id) {
      updated = { ...row, ...patch, [pk]: id };
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
  const nowStr = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = data.userLogins[existingIndex];
    data.userLogins[existingIndex] = {
      ...existing,
      name: user.name || existing.name,
      email: user.email || existing.email,
      last_login_at: nowStr,
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
      login_count: 1
    });
  }

  persist(data);
  return data.userLogins;
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
  let patchWithAvatar = { ...profilePatch };
  if (profilePatch.name && (!profilePatch.avatar || profilePatch.avatar.startsWith('data:image/svg+xml'))) {
    const existing = getAll('users').find(u => u.user_id === userId);
    patchWithAvatar.avatar = generateLetterAvatarSvg(profilePatch.name, existing?.role === 'gym_master');
  }

  const updatedUser = update('users', userId, patchWithAvatar);
  
  if (updatedUser) {
    const data = loadRaw();
    let modified = false;

    // Sync with communityRankings
    if (data.communityRankings) {
      data.communityRankings = data.communityRankings.map((r) => {
        if (r.user_id === userId || r.name.replace(/\s*\(You\)$/i, '') === updatedUser.name) {
          modified = true;
          return {
            ...r,
            user_id: userId,
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
        if (l.user_id === userId) {
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

/** User Auth */
export function authenticateUser(emailOrName, password) {
  const users = getAll('users');
  const term = emailOrName.trim().toLowerCase();

  const user = users.find((u) => {
    const userEmail = (u.email || '').trim().toLowerCase();
    const userName = (u.name || '').trim().toLowerCase();
    const firstName = userName.split(' ')[0];

    return (
      (userEmail && userEmail === term) ||
      (userName && userName === term) ||
      (firstName && firstName === term) ||
      (term === 'ava' && userEmail === 'ava@companion.fit') ||
      (term === 'marcus' && userEmail === 'marcus@gymmaster.fit')
    );
  });

  if (!user) {
    throw new Error('User not found. Please check your email or name, or create a new account.');
  }

  if (user.password && user.password !== password) {
    throw new Error('Invalid password. Please check your password and try again.');
  }

  recordUserLogin(user);
  return user;
}

/** Helper to generate crisp Data URL SVG profile photo containing user's First Letter */
export function generateLetterAvatarSvg(name, isMaster = false) {
  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  const bg = isMaster ? '%23ca8a04' : '%232563eb';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="${bg}" rx="60"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="64" font-weight="900">${initial}</text></svg>`;
}

/** User Registration with Role support */
export function registerUser({ name, email, password, role = 'member', age = 25, weight = 65, gym_name = 'Gym Master Club', specialty = 'Head Coach', avatar }) {
  const users = getAll('users');
  if (users.some((u) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  // Set First Letter profile photo by default for all new user logins
  const userAvatar = avatar || generateLetterAvatarSvg(name, role === 'gym_master');

  const newUser = insert('users', {
    name,
    email,
    password,
    role: role || 'member',
    age: Number(age),
    weight: Number(weight),
    height: 170,
    fitness_level: role === 'gym_master' ? 'Gym Master / Trainer' : 'Beginner',
    gym_name: role === 'gym_master' ? gym_name : undefined,
    specialty: role === 'gym_master' ? specialty : undefined,
    avatar: userAvatar
  });

  recordUserLogin(newUser);

  if (role !== 'gym_master') {
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

/** Gym Master Helper: Get all members */
export function getAllMembers() {
  return getAll('users').filter((u) => u.role !== 'gym_master');
}

/** Gym Master Helper: Assign workout plan to member */
export function assignPlanToMember(memberId, planName, workoutType = 'Custom Workout Routine', duration = 45) {
  const plan = insert('fitnessPlans', {
    user_id: Number(memberId),
    plan_name: planName,
    start_date: new Date().toISOString().slice(0, 10),
    assigned_by: 'Gym Master'
  });

  const workout = insert('workouts', {
    plan_id: plan.plan_id,
    type: workoutType,
    duration_minutes: Number(duration)
  });

  insert('exercises', { workout_id: workout.workout_id, name: 'Barbell Squats', sets: 4, reps: 10 });
  insert('exercises', { workout_id: workout.workout_id, name: 'Dumbbell Incline Press', sets: 4, reps: 12 });

  return plan;
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
    assigned_by: 'Gym Master'
  });
}

/** Gym Master Helper: Compute Gym Overview Analytics */
export function getGymAnalytics() {
  const users = getAll('users');
  const members = users.filter((u) => u.role !== 'gym_master');
  const gymMasters = users.filter((u) => u.role === 'gym_master');
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
    totalMasters: gymMasters.length,
    totalActivePlans: fitnessPlans.length,
    totalWorkouts: workouts.length,
    avgCompletionRate: avgCompletion,
    totalGymSteps: totalSteps
  };
}

export { TABLES, PK };

