import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Mail,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lock,
  Smartphone,
  Settings,
  Send,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  verifyOtp,
  sendOtp,
  getActiveOtp,
  dispatchRealEmail,
  getSmtpStatus,
  saveSmtpConfig
} from '../services/otpService.js';

export default function OtpVerification({
  email,
  purpose = 'login',
  metadata = {},
  isDark = true,
  onSuccess,
  onBack
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [shake, setShake] = useState(false);

  // Real Email Dispatch status
  const [deliveryStatus, setDeliveryStatus] = useState({
    loading: true,
    sent: false,
    message: 'Dispatching real email to your inbox...'
  });

  // SMTP Configuration Drawer
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpSender, setSmtpSender] = useState('');
  const [smtpService, setSmtpService] = useState('gmail');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpMsg, setSmtpMsg] = useState('');

  const inputRefs = useRef([]);

  // Check SMTP status and trigger real email dispatch on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAndSend() {
      try {
        const status = await getSmtpStatus();
        if (!isMounted) return;
        setSmtpConfigured(Boolean(status.configured));
        if (status.user) setSmtpSender(status.user);

        const active = getActiveOtp(email);
        if (active && active.code) {
          const res = await dispatchRealEmail(email, active.code, purpose);
          if (!isMounted) return;
          if (res.success) {
            setDeliveryStatus({
              loading: false,
              sent: true,
              message: `✅ Email sent! Check your mobile phone inbox (${email}).`
            });
          } else if (res.configured === false) {
            setDeliveryStatus({
              loading: false,
              sent: false,
              message:
                '⚠️ Real email requires sender credentials (e.g. Gmail App Password). Click "Email Settings" below to configure.'
            });
            setShowSmtpModal(true);
          } else {
            setDeliveryStatus({
              loading: false,
              sent: false,
              message: res.error || 'Failed to dispatch email. Check settings below.'
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setDeliveryStatus({
            loading: false,
            sent: false,
            message: 'Email service error: ' + err.message
          });
        }
      }
    }

    checkAndSend();

    return () => {
      isMounted = false;
    };
  }, [email, purpose]);

  // Resend countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Autofocus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    setError('');
    const char = value.slice(-1);

    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance
    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-verify if 6 digits entered
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      const fullCode = newDigits.join('');
      executeVerify(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const cleanNumbers = pasteData.replace(/\D/g, '').slice(0, 6);
    if (!cleanNumbers) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = cleanNumbers[i] || '';
    }
    setDigits(newDigits);

    if (cleanNumbers.length === 6) {
      if (inputRefs.current[5]) inputRefs.current[5].focus();
      executeVerify(cleanNumbers);
    } else {
      const nextIndex = Math.min(cleanNumbers.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const executeVerify = (codeToVerify) => {
    const code = codeToVerify || digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the OTP code you received on your email.');
      triggerShake();
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      const res = verifyOtp(email, code);
      setIsVerifying(false);

      if (res.valid) {
        setSuccessMsg('✅ OTP Verified Successfully! Logging into your dashboard...');
        setTimeout(() => {
          onSuccess({ email, purpose: res.purpose, metadata: res.metadata });
        }, 600);
      } else {
        setError(res.error || 'Invalid OTP code. Please check your email on your phone and try again.');
        triggerShake();
      }
    }, 450);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setSuccessMsg('');
    setDeliveryStatus({
      loading: true,
      sent: false,
      message: 'Sending a fresh OTP to your real email...'
    });

    try {
      const res = sendOtp(email, purpose, metadata);
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();

      // Dispatch real email
      const active = getActiveOtp(email);
      if (active && active.code) {
        const emailRes = await dispatchRealEmail(email, active.code, purpose);
        if (emailRes.success) {
          setDeliveryStatus({
            loading: false,
            sent: true,
            message: `✅ New OTP code sent! Check your phone inbox (${email}).`
          });
        } else {
          setDeliveryStatus({
            loading: false,
            sent: false,
            message: emailRes.error || 'Delivery failed. Check email settings below.'
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    if (!smtpUser.trim() || !smtpPass.trim()) {
      setSmtpMsg('Please provide your sender email and password / App Password.');
      return;
    }

    setSmtpSaving(true);
    setSmtpMsg('');

    try {
      const saveRes = await saveSmtpConfig({
        service: smtpService,
        user: smtpUser.trim(),
        pass: smtpPass.trim()
      });

      if (saveRes.success) {
        setSmtpConfigured(true);
        setSmtpSender(smtpUser.trim());
        setSmtpMsg('✅ Sender credentials saved! Now dispatching real email to your phone...');

        // Trigger email dispatch immediately
        const active = getActiveOtp(email);
        if (active && active.code) {
          const dispatchRes = await dispatchRealEmail(email, active.code, purpose);
          if (dispatchRes.success) {
            setDeliveryStatus({
              loading: false,
              sent: true,
              message: `✅ Real email sent to ${email}! Check your mobile phone now.`
            });
            setShowSmtpModal(false);
          } else {
            setSmtpMsg('⚠️ Saved, but send test failed: ' + dispatchRes.error);
          }
        }
      } else {
        setSmtpMsg('Error: ' + saveRes.error);
      }
    } catch (err) {
      setSmtpMsg('Error: ' + err.message);
    } finally {
      setSmtpSaving(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      {/* REAL EMAIL NOTIFICATION BANNER (CODE IS NEVER SHOWN ON SCREEN) */}
      <div
        style={{
          marginBottom: '1.4rem',
          padding: '1.25rem 1.4rem',
          borderRadius: '16px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(13, 22, 40, 0.95) 100%)'
            : 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
          border: isDark ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1.5px solid #86efac',
          boxShadow: isDark
            ? '0 8px 30px rgba(16, 185, 129, 0.15)'
            : '0 6px 20px rgba(16, 185, 129, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Smartphone size={20} color={isDark ? '#34d399' : '#059669'} />
            <span
              style={{
                fontWeight: 900,
                fontSize: '0.98rem',
                letterSpacing: '0.04em',
                color: isDark ? '#34d399' : '#047857'
              }}
            >
              REAL EMAIL OTP DISPATCHED
            </span>
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              background: deliveryStatus.sent
                ? (isDark ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7')
                : (isDark ? 'rgba(234, 179, 8, 0.25)' : '#fef3c7'),
              color: deliveryStatus.sent
                ? (isDark ? '#4ade80' : '#15803d')
                : (isDark ? '#fde047' : '#854d0e'),
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: deliveryStatus.sent ? '#22c55e' : '#eab308',
                display: 'inline-block'
              }}
            />
            {deliveryStatus.sent ? 'DELIVERED TO INBOX' : deliveryStatus.loading ? 'DISPATCHING...' : 'SETUP SENDER'}
          </span>
        </div>

        <div style={{ fontSize: '0.94rem', color: isDark ? '#e2e8f0' : '#334155', lineHeight: 1.5 }}>
          <div>
            <strong>Recipient Mail ID:</strong>{' '}
            <span style={{ color: isDark ? '#00F0FF' : '#0284c7', fontWeight: 900, fontSize: '1.02rem' }}>
              {email}
            </span>
          </div>
          <div style={{ marginTop: '0.35rem', color: isDark ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Smartphone size={16} color={isDark ? '#38bdf8' : '#0284c7'} />
            <span>
              <strong>Check your mobile phone!</strong> Open your email app to view your 6-digit verification code.
            </span>
          </div>

          <div
            style={{
              marginTop: '0.55rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              background: deliveryStatus.sent
                ? (isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4')
                : (isDark ? 'rgba(234, 179, 8, 0.15)' : '#fefce8'),
              border: deliveryStatus.sent
                ? (isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #bbf7d0')
                : (isDark ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid #fef08a'),
              fontSize: '0.88rem',
              color: deliveryStatus.sent
                ? (isDark ? '#86efac' : '#15803d')
                : (isDark ? '#fde047' : '#a16207'),
              fontWeight: 700
            }}
          >
            {deliveryStatus.message}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.3rem',
            paddingTop: '0.6rem',
            borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
            {smtpConfigured
              ? `Sender active: ${smtpSender || 'Configured'}`
              : 'Need real email sent via your own Gmail?'}
          </span>
          <button
            type="button"
            onClick={() => setShowSmtpModal(!showSmtpModal)}
            style={{
              background: 'none',
              border: 'none',
              color: isDark ? '#38bdf8' : '#0284c7',
              fontSize: '0.86rem',
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: 0
            }}
          >
            <Settings size={14} />
            {showSmtpModal ? 'Hide Email Sender Settings' : '⚙️ Configure Email Sender (Gmail / SMTP)'}
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE SMTP / GMAIL CONFIGURATION DRAWER */}
      {showSmtpModal && (
        <form
          onSubmit={handleSaveSmtp}
          style={{
            marginBottom: '1.4rem',
            padding: '1.3rem',
            borderRadius: '16px',
            background: isDark ? '#1e293b' : '#f8fafc',
            border: isDark ? '1.5px solid #38bdf8' : '1.5px solid #0284c7',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 900, fontSize: '1.05rem', color: isDark ? '#38bdf8' : '#0369a1' }}>
              ⚙️ REAL EMAIL SENDER SETUP (GMAIL SMTP)
            </span>
            <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              One-time setup
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.45, margin: '0 0 0.85rem' }}>
            To send actual emails to your mobile phone inbox (such as <strong>{email}</strong>), provide a sender Gmail account and a 16-character <strong>Google App Password</strong> (from Google Account Security).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#e2e8f0' : '#1e293b', display: 'block', marginBottom: '0.25rem' }}>
                SENDER GMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="e.g. sender@gmail.com"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  fontSize: '0.92rem',
                  background: isDark ? '#0f172a' : '#ffffff',
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: isDark ? '#ffffff' : '#0f172a'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#e2e8f0' : '#1e293b', display: 'block', marginBottom: '0.25rem' }}>
                GOOGLE APP PASSWORD (16 CHARS)
              </label>
              <input
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  fontSize: '0.92rem',
                  background: isDark ? '#0f172a' : '#ffffff',
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: isDark ? '#ffffff' : '#0f172a'
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.85rem' }}>
            💡 <strong>How to get Google App Password:</strong> Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: isDark ? '#38bdf8' : '#0284c7', textDecoration: 'underline' }}>myaccount.google.com/apppasswords</a>, type "Smart Fitness", copy the 16 letters and paste above.
          </div>

          {smtpMsg && (
            <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: isDark ? '#0f172a' : '#ffffff', fontSize: '0.85rem', fontWeight: 700, color: smtpMsg.startsWith('✅') ? '#22c55e' : '#ef4444', marginBottom: '0.75rem' }}>
              {smtpMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="submit"
              disabled={smtpSaving}
              style={{
                flex: 1,
                padding: '0.7rem',
                borderRadius: '8px',
                border: 'none',
                background: isDark ? 'linear-gradient(135deg, #00F0FF 0%, #0284c7 100%)' : '#0284c7',
                color: isDark ? '#000000' : '#ffffff',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: smtpSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem'
              }}
            >
              {smtpSaving ? <RefreshCw size={16} className="spin-animation" /> : <Send size={16} />}
              Save & Dispatch Real Email Now
            </button>
            <button
              type="button"
              onClick={() => setShowSmtpModal(false)}
              style={{
                padding: '0.7rem 1.1rem',
                borderRadius: '8px',
                border: isDark ? '1px solid #475569' : '1px solid #cbd5e1',
                background: 'transparent',
                color: isDark ? '#94a3b8' : '#64748b',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </form>
      )}

      {/* CARD BODY WITH 6-DIGIT PIN INPUTS */}
      <div
        className={shake ? 'sfc-shake-animation' : ''}
        style={{
          background: isDark ? '#111827' : '#ffffff',
          padding: '2.2rem 2rem',
          borderRadius: '20px',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 12px 40px rgba(0, 0, 0, 0.65)'
            : '0 8px 30px rgba(0, 0, 0, 0.08)',
          textAlign: 'center'
        }}
      >
        {/* SHIELD ICON */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(17, 24, 39, 0.8) 100%)'
              : 'radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, #ffffff 100%)',
            border: isDark ? '2px solid #00F0FF' : '2px solid #0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.3rem',
            boxShadow: isDark
              ? '0 0 25px rgba(0, 240, 255, 0.35)'
              : '0 0 15px rgba(2, 132, 199, 0.2)'
          }}
        >
          <ShieldCheck size={36} color={isDark ? '#00F0FF' : '#0284c7'} />
        </div>

        <h2
          style={{
            fontSize: '1.9rem',
            fontWeight: 900,
            margin: '0 0 0.5rem',
            letterSpacing: '0.02em',
            color: isDark ? '#ffffff' : '#0f172a'
          }}
        >
          ENTER VERIFICATION CODE
        </h2>

        <p
          style={{
            fontSize: '1.05rem',
            color: isDark ? '#94a3b8' : '#64748b',
            margin: '0 0 0.4rem',
            lineHeight: 1.5
          }}
        >
          Check the 6-digit verification code received on:
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: isDark ? 'rgba(0, 240, 255, 0.08)' : '#f0f9ff',
            padding: '0.45rem 1.1rem',
            borderRadius: '999px',
            border: isDark ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid #bae6fd',
            marginBottom: '1.8rem'
          }}
        >
          <Mail size={16} color={isDark ? '#00F0FF' : '#0284c7'} />
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: isDark ? '#00F0FF' : '#0284c7'
            }}
          >
            {email}
          </span>
          <button
            type="button"
            onClick={onBack}
            title="Change Email Address"
            style={{
              background: 'none',
              border: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'underline',
              marginLeft: '0.35rem',
              padding: 0
            }}
          >
            Change
          </button>
        </div>

        {/* 6-DIGIT INPUT BOXES */}
        <div
          onPaste={handlePaste}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.65rem',
            marginBottom: '1.5rem'
          }}
        >
          {digits.map((digit, index) => {
            const isFilled = Boolean(digit);
            return (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  width: '56px',
                  height: '66px',
                  fontSize: '1.9rem',
                  fontWeight: 900,
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: isFilled
                    ? (isDark ? '2.5px solid #00F0FF' : '2.5px solid #0284c7')
                    : (isDark ? '1.5px solid #374151' : '1.5px solid #cbd5e1'),
                  background: isDark
                    ? (isFilled ? 'rgba(0, 240, 255, 0.08)' : '#1f2937')
                    : (isFilled ? '#e0f2fe' : '#ffffff'),
                  color: isDark ? '#ffffff' : '#0f172a',
                  outline: 'none',
                  boxShadow: isFilled
                    ? (isDark ? '0 0 14px rgba(0, 240, 255, 0.35)' : '0 2px 8px rgba(2, 132, 199, 0.2)')
                    : 'none',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDark ? '#00F0FF' : '#0284c7';
                  e.target.style.boxShadow = isDark
                    ? '0 0 18px rgba(0, 240, 255, 0.45)'
                    : '0 0 12px rgba(2, 132, 199, 0.25)';
                }}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.style.borderColor = isDark ? '#374151' : '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            );
          })}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: isDark ? 'rgba(239, 68, 68, 0.18)' : '#fee2e2',
              border: isDark ? '1px solid #ef4444' : '1px solid #f87171',
              color: isDark ? '#fca5a5' : '#b91c1c',
              fontSize: '0.98rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1.2rem'
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {successMsg && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: isDark ? 'rgba(34, 197, 94, 0.18)' : '#dcfce7',
              border: isDark ? '1px solid #22c55e' : '1px solid #4ade80',
              color: isDark ? '#86efac' : '#15803d',
              fontSize: '0.98rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1.2rem'
            }}
          >
            <CheckCircle size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VERIFY SUBMIT BUTTON */}
        <button
          type="button"
          disabled={isVerifying || digits.some((d) => !d)}
          onClick={() => executeVerify()}
          style={{
            width: '100%',
            padding: '1.15rem',
            borderRadius: '14px',
            border: 'none',
            background: digits.every((d) => d)
              ? (isDark ? 'linear-gradient(135deg, #00F0FF 0%, #38bdf8 100%)' : '#0284c7')
              : (isDark ? '#374151' : '#94a3b8'),
            color: digits.every((d) => d)
              ? (isDark ? '#000000' : '#ffffff')
              : (isDark ? '#9ca3af' : '#ffffff'),
            fontSize: '1.22rem',
            fontWeight: 900,
            letterSpacing: '0.05em',
            cursor: digits.every((d) => d) && !isVerifying ? 'pointer' : 'not-allowed',
            boxShadow: digits.every((d) => d)
              ? (isDark ? '0 4px 20px rgba(0, 240, 255, 0.4)' : '0 4px 15px rgba(2, 132, 199, 0.35)')
              : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            transition: 'all 0.2s ease',
            marginBottom: '1.3rem'
          }}
        >
          {isVerifying ? (
            <>
              <RefreshCw size={22} className="spin-animation" />
              VERIFYING CODE...
            </>
          ) : (
            <>
              <Lock size={20} />
              VERIFY OTP & ACCESS DASHBOARD
            </>
          )}
        </button>

        {/* RESEND & FOOTER ACTIONS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
            paddingTop: '1.1rem',
            fontSize: '0.96rem'
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '8px'
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>

          <button
            type="button"
            disabled={cooldown > 0}
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: cooldown > 0
                ? (isDark ? '#64748b' : '#94a3b8')
                : (isDark ? '#00F0FF' : '#0284c7'),
              fontWeight: 800,
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '8px'
            }}
          >
            <RefreshCw size={15} />
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend Code to Phone'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sfc-shake-animation {
          animation: sfcShake 0.45s ease-in-out;
        }
        @keyframes sfcShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
