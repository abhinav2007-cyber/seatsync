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

  // ── Phone: Send OTP ─────────────────────────────────────────
  const sendOTP = async (phoneNumber) => {
    setAuthError('');
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
      }
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirm(result);
      setPhoneStep('sent');
    } catch (e) {
      setAuthError(e.message);
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
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
      window.recaptchaVerifier.clear();
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
      {/* Invisible reCAPTCHA container required by Firebase Phone Auth */}
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
