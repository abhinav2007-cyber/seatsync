import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, CheckCircle, RotateCcw, Loader2, ChevronLeft, Timer } from 'lucide-react';
import { useAuth } from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';

const OTP_EXPIRY_SECONDS = 60;

export default function Login() {
  const { user, loading, loginWithGoogle, sendOTP, verifyOTP, resetPhone, phoneStep, authError } = useAuth();

  const [phone, setPhone]           = useState('');
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [mode, setMode]             = useState('choose'); // choose | phone
  const [sending, setSending]       = useState(false);
  const [timer, setTimer]           = useState(0);
  const timerRef                    = useRef(null);

  // Already logged in → redirect home
  if (!loading && user) return <Navigate to="/" replace />;

  // ── Countdown Timer ─────────────────────────────────────────
  useEffect(() => {
    if (phoneStep === 'sent') {
      setTimer(OTP_EXPIRY_SECONDS);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phoneStep]);

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

  const handleSend = async () => {
    if (phone.length < 10 || sending) return;
    setSending(true);
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    await sendOTP(formatted);
    setSending(false);
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 6) verifyOTP(code);
  };

  const handleResend = async () => {
    clearInterval(timerRef.current);
    setOtp(['', '', '', '', '', '']);
    resetPhone();
    setSending(true);
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    await sendOTP(formatted);
    setSending(false);
  };

  const handleBack = () => {
    setMode('choose');
    resetPhone();
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    clearInterval(timerRef.current);
    setTimer(0);
  };

  // Timer display
  const timerColor = timer > 20 ? 'text-green-500' : timer > 10 ? 'text-yellow-500' : 'text-red-500';
  const timerPct   = (timer / OTP_EXPIRY_SECONDS) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #ede9fe 100%)' }}>

      {/* Background blobs */}
      <div style={{ position:'absolute', top:'-15%', left:'-10%', width:'500px', height:'500px',
        background:'rgba(99,102,241,0.08)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-10%', right:'-8%', width:'420px', height:'420px',
        background:'rgba(59,130,246,0.08)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'420px', margin:'0 16px' }}
      >
        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(99,102,241,0.12)',
          border: '1px solid rgba(255,255,255,0.7)',
          padding: '36px 32px',
        }}>
          {/* Logo */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'28px' }}>
            <div style={{
              width:'56px', height:'56px', borderRadius:'16px',
              background:'linear-gradient(135deg, #4f46e5, #3b82f6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 8px 24px rgba(79,70,229,0.3)', marginBottom:'16px'
            }}>
              <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h1 style={{ fontSize:'22px', fontWeight:800, color:'#1e293b', margin:0, letterSpacing:'-0.5px' }}>
              Welcome to SeatSync
            </h1>
            <p style={{ fontSize:'13px', color:'#64748b', margin:'4px 0 0' }}>
              Smart Library Occupancy Platform
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── CHOOSE MODE ─────────────────────────────────── */}
            {mode === 'choose' && (
              <motion.div key="choose"
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

                {/* Google */}
                <button onClick={loginWithGoogle} style={{
                  width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
                  padding:'14px 20px', borderRadius:'16px', border:'2px solid #e2e8f0',
                  background:'white', cursor:'pointer', fontWeight:600, fontSize:'14px', color:'#334155',
                  transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.06)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#818cf8'; e.currentTarget.style.background='#f8faff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='white'; }}
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
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
                  <span style={{ fontSize:'11px', color:'#94a3b8', fontWeight:600, letterSpacing:'0.5px' }}>OR</span>
                  <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
                </div>

                {/* Phone */}
                <button onClick={() => setMode('phone')} style={{
                  width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
                  padding:'14px 20px', borderRadius:'16px', border:'none',
                  background:'linear-gradient(135deg, #4f46e5, #3b82f6)',
                  cursor:'pointer', fontWeight:600, fontSize:'14px', color:'white',
                  boxShadow:'0 4px 16px rgba(79,70,229,0.3)', transition:'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(79,70,229,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 16px rgba(79,70,229,0.3)'; }}
                >
                  <Phone size={17} />
                  Continue with Phone Number
                </button>

                {authError && (
                  <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'10px 14px' }}>
                    <p style={{ fontSize:'12px', color:'#ef4444', margin:0 }}>{authError}</p>
                  </div>
                )}

                <p style={{ fontSize:'11px', color:'#94a3b8', textAlign:'center', margin:'4px 0 0' }}>
                  By signing in you agree to the library's usage policies.
                </p>
              </motion.div>
            )}

            {/* ── PHONE MODE ──────────────────────────────────── */}
            {mode === 'phone' && (
              <motion.div key="phone"
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

                <button onClick={handleBack} style={{
                  display:'flex', alignItems:'center', gap:'4px', background:'none', border:'none',
                  cursor:'pointer', fontSize:'13px', color:'#64748b', padding:0, width:'fit-content'
                }}>
                  <ChevronLeft size={15}/> Back
                </button>

                <AnimatePresence mode="wait">

                  {/* Enter phone number */}
                  {phoneStep === 'idle' && (
                    <motion.div key="enter-phone"
                      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

                      <div>
                        <label style={{ fontSize:'13px', fontWeight:600, color:'#374151', display:'block', marginBottom:'8px' }}>
                          Mobile Number
                        </label>
                        <div style={{
                          display:'flex', alignItems:'center', gap:'8px',
                          border:'2px solid #e2e8f0', borderRadius:'14px',
                          padding:'12px 16px', background:'white', transition:'border-color 0.2s'
                        }}
                          onFocusCapture={e => e.currentTarget.style.borderColor='#6366f1'}
                          onBlurCapture={e => e.currentTarget.style.borderColor='#e2e8f0'}
                        >
                          <span style={{ fontSize:'13px', fontWeight:700, color:'#6366f1' }}>🇮🇳 +91</span>
                          <div style={{ width:'1px', height:'18px', background:'#e2e8f0' }} />
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Enter 10-digit number"
                            style={{
                              flex:1, outline:'none', border:'none', background:'transparent',
                              fontSize:'14px', fontWeight:500, color:'#1e293b'
                            }}
                          />
                        </div>
                      </div>

                      {authError && (
                        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'10px 14px' }}>
                          <p style={{ fontSize:'12px', color:'#ef4444', margin:0 }}>{authError}</p>
                        </div>
                      )}

                      <button onClick={handleSend}
                        disabled={phone.length < 10 || sending}
                        style={{
                          width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                          padding:'14px 20px', borderRadius:'14px', border:'none',
                          background: phone.length < 10 || sending
                            ? '#cbd5e1'
                            : 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                          cursor: phone.length < 10 || sending ? 'not-allowed' : 'pointer',
                          fontWeight:600, fontSize:'14px', color:'white',
                          boxShadow: phone.length < 10 || sending ? 'none' : '0 4px 16px rgba(79,70,229,0.3)',
                          transition:'all 0.2s',
                        }}
                      >
                        {sending
                          ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Sending OTP...</>
                          : <><ArrowRight size={16} /> Send OTP</>
                        }
                      </button>
                    </motion.div>
                  )}

                  {/* Enter OTP */}
                  {(phoneStep === 'sent' || phoneStep === 'verifying') && (
                    <motion.div key="enter-otp"
                      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

                      {/* Header */}
                      <div style={{ textAlign:'center' }}>
                        <div style={{
                          width:'48px', height:'48px', borderRadius:'50%',
                          background:'linear-gradient(135deg, #eef2ff, #dbeafe)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          margin:'0 auto 12px', border:'2px solid #c7d2fe'
                        }}>
                          <Phone size={20} color="#4f46e5" />
                        </div>
                        <p style={{ fontSize:'14px', fontWeight:600, color:'#374151', margin:0 }}>
                          OTP sent to <span style={{ color:'#4f46e5' }}>+91 {phone}</span>
                        </p>
                        <p style={{ fontSize:'12px', color:'#94a3b8', margin:'4px 0 0' }}>
                          Enter the 6-digit code below
                        </p>
                      </div>

                      {/* Countdown Timer */}
                      <div style={{
                        background:'#f8faff', borderRadius:'14px', padding:'12px 16px',
                        border:'1px solid #e0e7ff', display:'flex', flexDirection:'column', gap:'8px'
                      }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <Timer size={14} color={timer > 0 ? '#6366f1' : '#ef4444'} />
                            <span style={{ fontSize:'12px', fontWeight:600, color:'#64748b' }}>
                              {timer > 0 ? 'OTP expires in' : 'OTP expired'}
                            </span>
                          </div>
                          <span style={{ fontSize:'15px', fontWeight:800, fontFamily:'monospace' }}
                            className={timerColor}>
                            {timer > 0 ? `${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}` : '00:00'}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height:'4px', background:'#e2e8f0', borderRadius:'99px', overflow:'hidden' }}>
                          <div style={{
                            height:'100%', borderRadius:'99px', transition:'width 1s linear',
                            width:`${timerPct}%`,
                            background: timer > 20 ? '#22c55e' : timer > 10 ? '#f59e0b' : '#ef4444'
                          }} />
                        </div>
                      </div>

                      {/* OTP Input Boxes */}
                      <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
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
                            style={{
                              width:'44px', height:'48px', textAlign:'center',
                              fontSize:'20px', fontWeight:700,
                              border:`2px solid ${digit ? '#4f46e5' : '#e2e8f0'}`,
                              borderRadius:'12px', outline:'none',
                              background: digit ? '#eef2ff' : 'white',
                              color:'#1e293b', transition:'all 0.15s',
                            }}
                          />
                        ))}
                      </div>

                      {authError && (
                        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'10px 14px' }}>
                          <p style={{ fontSize:'12px', color:'#ef4444', margin:0, textAlign:'center' }}>{authError}</p>
                        </div>
                      )}

                      {/* Verify button */}
                      <button onClick={handleVerify}
                        disabled={otp.join('').length < 6 || phoneStep === 'verifying' || timer === 0}
                        style={{
                          width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                          padding:'14px 20px', borderRadius:'14px', border:'none',
                          background: otp.join('').length < 6 || phoneStep === 'verifying' || timer === 0
                            ? '#cbd5e1'
                            : 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                          cursor: otp.join('').length < 6 || phoneStep === 'verifying' || timer === 0
                            ? 'not-allowed' : 'pointer',
                          fontWeight:600, fontSize:'14px', color:'white',
                          boxShadow:'0 4px 16px rgba(79,70,229,0.25)', transition:'all 0.2s',
                        }}
                      >
                        {phoneStep === 'verifying'
                          ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Verifying...</>
                          : <><CheckCircle size={16} /> Verify OTP</>
                        }
                      </button>

                      {/* Resend */}
                      <button
                        onClick={handleResend}
                        disabled={timer > 0 || sending}
                        style={{
                          width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                          background:'none', border:'none', cursor: timer > 0 || sending ? 'not-allowed' : 'pointer',
                          fontSize:'12px', color: timer > 0 ? '#cbd5e1' : '#6366f1',
                          fontWeight:600, padding:'4px 0', transition:'color 0.2s'
                        }}
                      >
                        <RotateCcw size={13}/>
                        {sending ? 'Sending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p style={{ textAlign:'center', fontSize:'11px', color:'#94a3b8', marginTop:'16px' }}>
          🔒 Secured by Firebase Authentication
        </p>
      </motion.div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
