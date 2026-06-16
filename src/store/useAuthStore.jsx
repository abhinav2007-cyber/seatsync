import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [phoneStep, setPhoneStep]   = useState('idle'); // idle | sent | verifying
  const [confirmResult, setConfirm] = useState(null);
  const [authError, setAuthError]   = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Google Sign-In ──────────────────────────────────────────
  const loginWithGoogle = async () => {
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      setAuthError(e.message);
    }
  };

  // ── Helper: fresh reCAPTCHA verifier ────────────────────────
  const getRecaptcha = async () => {
    // Clear any stale instance first
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch (_) {}
          window.recaptchaVerifier = null;
        }
      },
    });
    await verifier.render();
    window.recaptchaVerifier = verifier;
    return verifier;
  };

  // ── Phone: Send OTP ─────────────────────────────────────────
  const sendOTP = async (phoneNumber) => {
    setAuthError('');
    try {
      const verifier = await getRecaptcha();
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirm(result);
      setPhoneStep('sent');
    } catch (e) {
      console.error('Phone auth error:', e.code, e.message);
      // Friendly error messages
      const msgs = {
        'auth/invalid-phone-number':    'Invalid phone number. Use 10-digit Indian number.',
        'auth/too-many-requests':       'Too many attempts. Please wait a few minutes.',
        'auth/operation-not-allowed':   'Phone auth is not enabled in Firebase Console.',
        'auth/billing-not-enabled':     'Firebase billing not enabled for SMS.',
        'auth/quota-exceeded':          'SMS quota exceeded. Try later.',
        'auth/captcha-check-failed':    'reCAPTCHA failed. Please refresh and try again.',
      };
      setAuthError(msgs[e.code] || e.message || 'Failed to send OTP. Please try again.');
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
    }
  };

  // ── Phone: Verify OTP ───────────────────────────────────────
  const verifyOTP = async (otp) => {
    setAuthError('');
    setPhoneStep('verifying');
    try {
      await confirmResult.confirm(otp);
    } catch (e) {
      setAuthError('Invalid OTP. Please try again.');
      setPhoneStep('sent');
    }
  };

  const logout = () => {
    signOut(auth);
    setPhoneStep('idle');
    setConfirm(null);
  };

  const resetPhone = () => {
    setPhoneStep('idle');
    setConfirm(null);
    setAuthError('');
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      loginWithGoogle,
      sendOTP, verifyOTP, resetPhone,
      phoneStep, authError,
      logout,
    }}>
      {/* Invisible reCAPTCHA anchor — must stay in DOM at all times */}
      <div id="recaptcha-container" />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
