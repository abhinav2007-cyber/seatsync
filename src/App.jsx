import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import AwayModeModal from './components/AwayModeModal';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Landing from './pages/Landing';
import StudentDashboard from './pages/StudentDashboard';
import LibraryMap from './pages/LibraryMap';
import QRCheckin from './pages/QRCheckin';
import LibrarianCenter from './pages/LibrarianCenter';
import Analytics from './pages/Analytics';

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Navbar />}
      {!isLoginPage && <AwayModeModal />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/"          element={<RequireAuth><Landing /></RequireAuth>} />
          <Route path="/student"   element={<RequireAuth><StudentDashboard /></RequireAuth>} />
          <Route path="/map"       element={<RequireAuth><LibraryMap /></RequireAuth>} />
          <Route path="/qr"        element={<RequireAuth><QRCheckin /></RequireAuth>} />
          <Route path="/librarian" element={<RequireAuth><LibrarianCenter /></RequireAuth>} />
          <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
          <Route path="*"          element={<RequireAuth><Landing /></RequireAuth>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

