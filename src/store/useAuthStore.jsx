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
  const [phoneStep, setPhoneStep]   = useState('idle');
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

  // ── Clear reCAPTCHA helper ───────────────────────────────────
  const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
    // Reset the container HTML so Firebase can re-render
    const el = document.getElementById('recaptcha-container');
    if (el) el.innerHTML = '';
  };

  // ── Phone: Send OTP ─────────────────────────────────────────
  const sendOTP = async (phoneNumber) => {
    setAuthError('');
    clearRecaptcha(); // Always start fresh

    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          clearRecaptcha();
          setAuthError('reCAPTCHA expired. Please try again.');
          setPhoneStep('idle');
        },
      });

      await verifier.render(); // force render before use
      window.recaptchaVerifier = verifier;

      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirm(result);
      setPhoneStep('sent');
    } catch (e) {
      console.error('Phone OTP error:', e);
      clearRecaptcha();

      // Show user-friendly error messages
      if (e.code === 'auth/too-many-requests') {
        setAuthError('Too many attempts. Please wait a few minutes and try again.');
      } else if (e.code === 'auth/invalid-phone-number') {
        setAuthError('Invalid phone number. Please enter a valid 10-digit Indian number.');
      } else if (e.code === 'auth/operation-not-allowed') {
        setAuthError('Phone sign-in is not enabled. Please contact support.');
      } else if (e.code === 'auth/billing-not-enabled') {
        setAuthError('SMS service requires Firebase Blaze plan. Please contact admin.');
      } else {
        setAuthError(e.message || 'Failed to send OTP. Please try again.');
      }
    }
  };

  // ── Phone: Verify OTP ───────────────────────────────────────
  const verifyOTP = async (otp) => {
    setAuthError('');
    setPhoneStep('verifying');
    try {
      await confirmResult.confirm(otp);
      clearRecaptcha();
    } catch (e) {
      console.error('OTP verify error:', e);
      if (e.code === 'auth/code-expired') {
        setAuthError('OTP has expired. Please request a new one.');
        setPhoneStep('idle');
      } else {
        setAuthError('Invalid OTP. Please try again.');
        setPhoneStep('sent');
      }
    }
  };

  const logout = () => {
    signOut(auth);
    setPhoneStep('idle');
    setConfirm(null);
    clearRecaptcha();
  };

  const resetPhone = () => {
    setPhoneStep('idle');
    setConfirm(null);
    setAuthError('');
    clearRecaptcha();
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      loginWithGoogle,
      sendOTP, verifyOTP, resetPhone,
      phoneStep, authError,
      logout,
    }}>
      {/* Invisible reCAPTCHA mount point — must stay in DOM */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, zIndex: -1 }} />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
