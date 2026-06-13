import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, CheckCircle, RotateCcw, Loader2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { user, loading, loginWithGoogle, sendOTP, verifyOTP, resetPhone, phoneStep, authError } = useAuth();

  const [phone, setPhone]         = useState('');
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [mode, setMode]           = useState('choose'); // choose | phone

  // Already logged in → redirect home
  if (!loading && user) return <Navigate to="/" replace />;

  // ── OTP box handlers ────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handleSend = () => {
    if (phone.length < 10) return;
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    sendOTP(formatted);
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 6) verifyOTP(code);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

      {/* Background blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-8%] w-[420px] h-[420px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/60 p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome to SeatSync</h1>
            <p className="text-sm text-slate-500 mt-1 text-center">Smart Library Occupancy Platform</p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── CHOOSE MODE ─────────────────────────────────── */}
            {mode === 'choose' && (
              <motion.div key="choose" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">

                {/* Google */}
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 font-semibold text-slate-700 shadow-sm hover:shadow-md group"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#4285F4" d="M45.1 24.6c0-1.5-.1-3-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.3 6.5v5.4h7c4.1-3.8 6.6-9.4 6.6-15.9z"/>
                    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7-5.4c-2 1.3-4.5 2.1-7.5 2.1-5.7 0-10.6-3.9-12.4-9.1H4.3v5.6C7.9 41.5 15.4 46 24 46z"/>
                    <path fill="#FBBC05" d="M11.6 28.2c-.5-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.6H4.3C2.8 17.2 2 20.5 2 24s.8 6.8 2.3 9.8l7.3-5.6z"/>
                    <path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.3 3.3l6.2-6.2C34.9 4.1 29.9 2 24 2 15.4 2 7.9 6.5 4.3 13.4l7.3 5.6c1.8-5.2 6.7-8.3 12.4-8.3z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">OR</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Phone */}
                <button
                  onClick={() => setMode('phone')}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Phone size={18} />
                  Continue with Phone Number
                </button>

                {authError && (
                  <p className="text-xs text-red-500 text-center mt-2 bg-red-50 px-3 py-2 rounded-xl border border-red-100">{authError}</p>
                )}

                <p className="text-xs text-slate-400 text-center pt-2">
                  By signing in, you agree to the library's usage policies.
                </p>
              </motion.div>
            )}

            {/* ── PHONE MODE ──────────────────────────────────── */}
            {mode === 'phone' && (
              <motion.div key="phone" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-5">

                <button onClick={() => { setMode('choose'); resetPhone(); setPhone(''); setOtp(['','','','','','']); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  <ChevronLeft size={16}/> Back
                </button>

                <AnimatePresence mode="wait">

                  {/* Enter phone */}
                  {phoneStep === 'idle' && (
                    <motion.div key="enter-phone" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Mobile Number</label>
                        <div className="flex items-center gap-2 border-2 border-slate-200 focus-within:border-blue-400 rounded-2xl px-4 py-3 bg-white transition-all">
                          <span className="text-slate-500 font-semibold text-sm">+91</span>
                          <div className="w-px h-5 bg-slate-200" />
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit number"
                            className="flex-1 outline-none text-slate-800 font-medium text-sm placeholder:text-slate-300 bg-transparent"
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                          />
                        </div>
                      </div>

                      {authError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">{authError}</p>}

                      <button
                        onClick={handleSend}
                        disabled={phone.length < 10}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        Send OTP <ArrowRight size={16} />
                      </button>
                    </motion.div>
                  )}

                  {/* Sent / verify */}
                  {(phoneStep === 'sent' || phoneStep === 'verifying') && (
                    <motion.div key="enter-otp" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-5">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 border-2 border-blue-100">
                          <Phone size={20} className="text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">OTP sent to <span className="text-blue-600">+91 {phone}</span></p>
                        <p className="text-xs text-slate-400 mt-1">Enter the 6-digit code below</p>
                      </div>

                      {/* OTP boxes */}
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(e.target.value, idx)}
                            onKeyDown={e => handleOtpKeyDown(e, idx)}
                            className="w-11 h-12 text-center text-lg font-bold border-2 border-slate-200 focus:border-blue-500 rounded-xl outline-none transition-colors bg-white text-slate-800"
                          />
                        ))}
                      </div>

                      {authError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100 text-center">{authError}</p>}

                      <button
                        onClick={handleVerify}
                        disabled={otp.join('').length < 6 || phoneStep === 'verifying'}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        {phoneStep === 'verifying' ? (
                          <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                        ) : (
                          <><CheckCircle size={16} /> Verify OTP</>
                        )}
                      </button>

                      <button onClick={() => { resetPhone(); setOtp(['','','','','','']); }} className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors">
                        <RotateCcw size={13}/> Resend OTP
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer tag */}
        <p className="text-center text-xs text-slate-400 mt-5">
          🔒 Secured by Firebase Authentication
        </p>
      </motion.div>
    </div>
  );
}
