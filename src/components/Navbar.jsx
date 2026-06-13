import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, QrCode, Shield, BarChart3,
  Zap, Menu, X, BookOpen, LogOut
} from 'lucide-react';
import { useApp } from '../store/useAppStore';
import { useAuth } from '../store/useAuthStore';

const NAV_LINKS = [
  { to: '/',           label: 'Home',       icon: BookOpen },
  { to: '/map',        label: 'Live Map',   icon: Map },
  { to: '/student',    label: 'My Desk',    icon: LayoutDashboard },
  { to: '/qr',         label: 'Check In',   icon: QrCode },
  { to: '/librarian',  label: 'Librarian',  icon: Shield },
  { to: '/analytics',  label: 'Analytics',  icon: BarChart3 },
];

export default function Navbar() {
  const { state } = useApp();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const occ = state.stats.occupancyPercent;

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-md'
        }`}
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Zap size={18} color="white" fill="white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SeatSync</span>
            </NavLink>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-3">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                const isActiveLink = to === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                      isActiveLink
                        ? 'bg-blue-50/50 text-blue-700 border-blue-200 shadow-sm'
                        : 'text-slate-600 border-slate-200/60 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <Icon size={16} className={isActiveLink ? 'text-blue-600' : 'text-slate-400'} />
                    <span>{label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Live Badge + User */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="relative w-2 h-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {occ}% Occupied
                </span>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-9 h-9 rounded-full border-2 border-blue-200 shadow-sm object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {(user.displayName || user.phoneNumber || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={logout}
                    title="Logout"
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-200"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl"
            >
              <div className="p-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
