import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, ArrowRight, CheckCircle, RotateCcw,
  Loader2, ChevronLeft, Timer, MapPin, Users, Shield, Zap
} from 'lucide-react';
import { useAuth } from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';

const OTP_EXPIRY = 60;

const FEATURES = [
  { icon: MapPin,  title: 'Real-time Seat Map',    desc: 'See exactly which seats are free across every floor instantly.' },
  { icon: Users,   title: 'Anti-Hoarding System',  desc: 'Smart away-mode alerts keep seats fair for everyone.' },
  { icon: Zap,     title: 'QR Quick Check-in',     desc: 'Scan and reserve your seat in under 3 seconds.' },
  { icon: Shield,  title: 'Librarian Dashboard',   desc: 'Full occupancy analytics and override controls.' },
];

export default function Login() {
  const { user, loading, loginWithGoogle, sendOTP, verifyOTP, resetPhone, phoneStep, authError } = useAuth();

  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [mode, setMode]       = useState('choose');
  const [sending, setSending] = useState(false);
  const [timer, setTimer]     = useState(OTP_EXPIRY);
  const [expired, setExpired] = useState(false);
  const timerRef              = useRef(null);

  useEffect(() => {
    if (phoneStep === 'sent') {
      setTimer(OTP_EXPIRY); setExpired(false);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(p => { if (p <= 1) { clearInterval(timerRef.current); setExpired(true); return 0; } return p - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phoneStep]);
  useEffect(() => () => clearInterval(timerRef.current), []);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
  };
  const handleSend = async () => {
    if (phone.length < 10 || sending) return;
    setSending(true);
    await sendOTP(phone.startsWith('+') ? phone : `+91${phone}`);
    setSending(false);
  };
  const handleResend = async () => {
    resetPhone(); setOtp(['','','','','','']); setExpired(false); setTimer(OTP_EXPIRY);
    await new Promise(r => setTimeout(r, 300));
    await sendOTP(phone.startsWith('+') ? phone : `+91${phone}`);
  };
  const handleVerify = () => { const c = otp.join(''); if (c.length === 6) verifyOTP(c); };

  const mm = String(Math.floor(timer / 60)).padStart(2, '0');
  const ss = String(timer % 60).padStart(2, '0');
  const pct = (timer / OTP_EXPIRY) * 100;

  return (
    <div className="min-h-screen flex bg-[#0A0F1E] overflow-hidden">

      {/* ── LEFT PANEL ───────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-14">

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">SeatSync</span>
        </motion.div>

        {/* Hero text */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Smart Library Platform
          </div>
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Never lose <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              your seat
            </span>
            <br />again.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Real-time occupancy tracking, smart anti-hoarding, and QR-based check-in — all in one platform built for modern libraries.
          </p>

          {/* Feature list */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                  <Icon size={16} className="text-blue-400" />
                </div>
                <p className="text-white text-sm font-semibold mb-1">{title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-8 relative z-10">
          {[['500+', 'Seats Tracked'], ['98%', 'Uptime'], ['<3s', 'Check-in']].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="text-white text-2xl font-black">{val}</p>
              <p className="text-slate-500 text-xs mt-0.5">{lbl}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">

        {/* Subtle noise */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1424] to-[#0A0F1E] lg:from-[#0D1424] lg:to-[#0D1424]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-white font-bold text-lg">SeatSync</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">
              {mode === 'choose' ? 'Sign in' : phoneStep === 'idle' ? 'Enter number' : 'Verify OTP'}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === 'choose'
                ? 'Choose your preferred sign-in method'
                : phoneStep === 'idle'
                ? 'We\'ll send a 6-digit code to your number'
                : `Code sent to +91 ${phone}`}
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── CHOOSE ── */}
            {mode === 'choose' && (
              <motion.div key="choose" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-3">

                {/* Google */}
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white hover:bg-slate-50 transition-all duration-200 font-semibold text-slate-800 shadow-xl shadow-black/20 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 48 48">
                      <path fill="#4285F4" d="M45.1 24.6c0-1.5-.1-3-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.3 6.5v5.4h7c4.1-3.8 6.6-9.4 6.6-15.9z"/>
                      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7-5.4c-2 1.3-4.5 2.1-7.5 2.1-5.7 0-10.6-3.9-12.4-9.1H4.3v5.6C7.9 41.5 15.4 46 24 46z"/>
                      <path fill="#FBBC05" d="M11.6 28.2c-.5-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.6H4.3C2.8 17.2 2 20.5 2 24s.8 6.8 2.3 9.8l7.3-5.6z"/>
                      <path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.3 3.3l6.2-6.2C34.9 4.1 29.9 2 24 2 15.4 2 7.9 6.5 4.3 13.4l7.3 5.6c1.8-5.2 6.7-8.3 12.4-8.3z"/>
                    </svg>
                  </div>
                  <span className="flex-1 text-left text-[15px]">Continue with Google</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/[0.08]" />
                  <span className="text-xs text-slate-600 font-medium">or</span>
                  <div className="flex-1 h-px bg-white/[0.08]" />
                </div>

                {/* Phone */}
                <button
                  onClick={() => setMode('phone')}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 font-semibold text-white shadow-xl shadow-blue-900/40 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Phone size={17} />
                  </div>
                  <span className="flex-1 text-left text-[15px]">Continue with Phone</span>
                  <ArrowRight size={16} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
                </button>

                {authError && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{authError}</div>
                )}

                <p className="text-xs text-slate-600 text-center pt-2">
                  By signing in you agree to the library's usage policies.
                </p>
              </motion.div>
            )}

            {/* ── PHONE ── */}
            {mode === 'phone' && (
              <motion.div key="phone" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-5">

                <button onClick={() => { setMode('choose'); resetPhone(); setPhone(''); setOtp(['','','','','','']); clearInterval(timerRef.current); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors">
                  <ChevronLeft size={16}/> Back
                </button>

                <AnimatePresence mode="wait">

                  {/* Enter number */}
                  {phoneStep === 'idle' && (
                    <motion.div key="number" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-4">
                      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] focus-within:border-blue-500/50 focus-within:bg-white/[0.06] rounded-2xl px-5 py-4 transition-all duration-200">
                        <span className="text-slate-400 font-semibold text-sm shrink-0">+91</span>
                        <div className="w-px h-5 bg-white/10 shrink-0" />
                        <input
                          type="tel" maxLength={10} value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          className="flex-1 bg-transparent outline-none text-white font-medium text-[15px] placeholder:text-slate-600"
                          onKeyDown={e => e.key === 'Enter' && handleSend()}
                          autoFocus
                        />
                      </div>

                      {authError && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{authError}</div>}

                      <button
                        onClick={handleSend}
                        disabled={phone.length < 10 || sending}
                        className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-[15px] shadow-xl shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {sending ? <><Loader2 size={17} className="animate-spin" /> Sending OTP...</> : <>Send OTP <ArrowRight size={17} /></>}
                      </button>
                    </motion.div>
                  )}

                  {/* OTP entry */}
                  {(phoneStep === 'sent' || phoneStep === 'verifying') && (
                    <motion.div key="otp" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-5">

                      {/* OTP boxes */}
                      <div className="flex gap-2.5 justify-center">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx} id={`otp-${idx}`} type="text" inputMode="numeric"
                            maxLength={1} value={digit}
                            onChange={e => handleOtpChange(e.target.value, idx)}
                            onKeyDown={e => handleOtpKey(e, idx)}
                            disabled={expired || phoneStep === 'verifying'}
                            autoFocus={idx === 0}
                            className={`w-12 h-14 text-center text-xl font-bold rounded-2xl outline-none transition-all duration-200 bg-white/[0.04] border text-white disabled:opacity-40
                              ${digit ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 focus:border-blue-500/60 focus:bg-white/[0.06]'}`}
                          />
                        ))}
                      </div>

                      {/* Timer bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Timer size={12} />
                            {expired ? 'OTP expired' : 'Expires in'}
                          </span>
                          <span className={`font-mono font-bold ${expired ? 'text-red-400' : timer <= 10 ? 'text-orange-400' : 'text-slate-300'}`}>
                            {mm}:{ss}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full transition-colors duration-1000 ${expired ? 'bg-red-500' : timer <= 10 ? 'bg-orange-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {authError && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{authError}</div>}

                      {!expired && (
                        <button
                          onClick={handleVerify}
                          disabled={otp.join('').length < 6 || phoneStep === 'verifying'}
                          className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-[15px] shadow-xl shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {phoneStep === 'verifying' ? <><Loader2 size={17} className="animate-spin" /> Verifying...</> : <><CheckCircle size={17} /> Verify & Sign In</>}
                        </button>
                      )}

                      <button
                        onClick={handleResend}
                        disabled={!expired}
                        className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors py-1"
                      >
                        <RotateCcw size={13}/>
                        {expired ? 'Resend OTP' : `Resend in ${ss}s`}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
