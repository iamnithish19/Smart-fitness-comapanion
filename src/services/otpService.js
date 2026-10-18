// src/services/otpService.js
// Enterprise-grade OTP generation, storage, real email dispatch, and verification service.

const OTP_STORAGE_KEY = 'sfc_active_otp';
const OTP_HISTORY_KEY = 'sfc_otp_history';
const EXPIRY_SECONDS = 300; // 5 minutes validity

/**
 * Generate a random 6-digit numeric OTP string
 */
export function generateOtpCode(digits = 6) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Dispatch real email via backend API endpoint (Nodemailer / SMTP)
 */
export async function dispatchRealEmail(email, code, purpose = 'login') {
  try {
    const res = await fetch('/api/send-otp-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, purpose })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Real email dispatch network error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if SMTP is configured on the server
 */
export async function getSmtpStatus() {
  try {
    const res = await fetch('/api/get-smtp-status');
    const data = await res.json();
    return data;
  } catch {
    return { configured: false };
  }
}

/**
 * Save SMTP configuration on server
 */
export async function saveSmtpConfig(config) {
  try {
    const res = await fetch('/api/save-smtp-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send / Generate OTP for a specified email address
 * @param {string} email - Recipient email
 * @param {string} purpose - 'login' | 'register' | 'demo'
 * @param {object} metadata - Optional user or registration details
 * @returns {object} { success: boolean, email, code, expiresAt, expiresIn }
 */
export function sendOtp(email, purpose = 'login', metadata = {}) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please provide a valid email address to receive an OTP.');
  }

  const code = generateOtpCode(6);
  const now = Date.now();
  const expiresAt = now + EXPIRY_SECONDS * 1000;

  const otpPayload = {
    email: cleanEmail,
    code,
    purpose,
    metadata,
    createdAt: now,
    expiresAt,
    attempts: 0
  };

  // Persist in localStorage
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpPayload));

  // Log in history for audit trail
  try {
    const rawHistory = localStorage.getItem(OTP_HISTORY_KEY);
    const history = rawHistory ? JSON.parse(rawHistory) : [];
    history.unshift({
      id: 'otp_' + now,
      email: cleanEmail,
      purpose,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(OTP_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  } catch (err) {
    console.warn('Could not record OTP history', err);
  }

  // Trigger real email dispatch asynchronously
  if (typeof fetch !== 'undefined') {
    dispatchRealEmail(cleanEmail, code, purpose);
  }

  // Dispatch custom browser event for components that need to know dispatch occurred
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sfc-otp-dispatched', {
        detail: {
          email: cleanEmail,
          purpose,
          expiresAt
        }
      })
    );
  }

  return {
    success: true,
    email: cleanEmail,
    expiresAt,
    expiresIn: EXPIRY_SECONDS
  };
}

/**
 * Retrieve the current active OTP object if it matches the email and hasn't expired
 */
export function getActiveOtp(email) {
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const cleanEmail = (email || '').trim().toLowerCase();

    if (data.email !== cleanEmail) return null;
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(OTP_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Verify submitted OTP against stored code
 * @param {string} email
 * @param {string} inputCode
 * @returns {{ valid: boolean, error?: string, purpose?: string, metadata?: object }}
 */
export function verifyOtp(email, inputCode) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const raw = localStorage.getItem(OTP_STORAGE_KEY);

  if (!raw) {
    return {
      valid: false,
      error: 'No active OTP found. Please request a new verification code.'
    };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { valid: false, error: 'Verification error. Please request a new code.' };
  }

  if (data.email !== cleanEmail) {
    return {
      valid: false,
      error: 'Email mismatch. Please request a code for this email address.'
    };
  }

  if (Date.now() > data.expiresAt) {
    localStorage.removeItem(OTP_STORAGE_KEY);
    return {
      valid: false,
      error: 'Verification code has expired. Please request a fresh OTP.'
    };
  }

  if (data.attempts >= 5) {
    localStorage.removeItem(OTP_STORAGE_KEY);
    return {
      valid: false,
      error: 'Maximum verification attempts exceeded. Please request a new OTP.'
    };
  }

  const cleanInput = (inputCode || '').toString().trim();

  if (data.code !== cleanInput) {
    data.attempts = (data.attempts || 0) + 1;
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(data));
    const remaining = 5 - data.attempts;
    return {
      valid: false,
      error: `Invalid verification code (${remaining} attempt${remaining === 1 ? '' : 's'} remaining). Check your email on your phone.`
    };
  }

  // Code verified! Remove active OTP
  localStorage.removeItem(OTP_STORAGE_KEY);

  return {
    valid: true,
    purpose: data.purpose,
    metadata: data.metadata || {}
  };
}

/**
 * Clear any active OTP
 */
export function clearOtp() {
  localStorage.removeItem(OTP_STORAGE_KEY);
}
