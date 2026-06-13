import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  INITIAL_DESKS,
  ACTIVITY_FEED,
  SUMMARY_STATS,
  STUDENTS,
  CURRENT_STUDENT,
} from '../data/mockData';

const API_BASE = 'http://localhost:5000/api';

// ── Initial State ─────────────────────────────────────────────
const initialState = {
  desks: INITIAL_DESKS,
  activityFeed: [...ACTIVITY_FEED].reverse().slice(0, 20),
  stats: { ...SUMMARY_STATS },
  currentStudent: CURRENT_STUDENT,
  students: STUDENTS,
  myDeskId: 'C07',
  awayModal: { open: false, deskId: null },
  highlightedDesks: [],
  notification: null,
};

// ── Reducer ───────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_DATA': {
      const { desks, activityFeed } = action.payload;
      
      // Calculate stats based on fetched desks
      const total = desks.length;
      const available = desks.filter(d => d.status === 'available').length;
      const occupied  = desks.filter(d => d.status === 'occupied').length;
      const away      = desks.filter(d => d.status === 'away').length;
      const abandoned = desks.filter(d => d.status === 'abandoned').length;
      const occupancyPercent = Math.round(((occupied + away + abandoned) / total) * 100);

      const stats = {
        ...state.stats,
        totalDesks: total,
        available,
        occupied,
        away,
        abandoned,
        occupancyPercent
      };

      // Check if current student's desk is still occupied by them
      const myDesk = desks.find(d => d.student === state.currentStudent.id);
      const myDeskId = myDesk ? myDesk.id : null;

      // Keep away modal in sync
      const isMyDeskAway = myDesk && myDesk.status === 'away';
      const awayModal = isMyDeskAway 
        ? { open: true, deskId: myDeskId } 
        : { open: false, deskId: null };

      return {
        ...state,
        desks,
        activityFeed,
        stats,
        myDeskId,
        awayModal
      };
    }

    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };

    case 'CLOSE_AWAY_MODAL':
      return { ...state, awayModal: { open: false, deskId: null } };

    case 'SET_HIGHLIGHTED_DESKS':
      return { ...state, highlightedDesks: action.payload };

    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch all live data from backend
  const refreshData = useCallback(async () => {
    try {
      const [seatsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/seats`),
        fetch(`${API_BASE}/activity`)
      ]);
      if (seatsRes.ok && activityRes.ok) {
        const desks = await seatsRes.json();
        const activityFeed = await activityRes.json();
        dispatch({ type: 'SET_DATA', payload: { desks, activityFeed } });
      }
    } catch (error) {
      console.warn('Backend server not reachable, using mock data mode.', error);
    }
  }, []);

  // Poll server for updates in real time (every 3 seconds)
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Actions
  const checkIn = useCallback(async (deskId, studentId) => {
    try {
      const res = await fetch(`${API_BASE}/seats/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId, studentId }),
      });
      if (res.ok) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'success', message: `Checked into Desk ${deskId}` } });
        refreshData();
      } else {
        const err = await res.json();
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: err.error || 'Failed to check in' } });
      }
    } catch (e) {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Backend unreachable.' } });
    }
  }, [refreshData]);

  const markAway = useCallback(async (deskId) => {
    try {
      const res = await fetch(`${API_BASE}/seats/away`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  }, [refreshData]);

  const returnDesk = useCallback(async (deskId) => {
    // Return desk just checkin the student back in
    try {
      const res = await fetch(`${API_BASE}/seats/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId, studentId: state.currentStudent.id }),
      });
      if (res.ok) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'info', message: `Welcome back! Desk ${deskId} is yours.` } });
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  }, [state.currentStudent.id, refreshData]);

  const releaseDesk = useCallback(async (deskId) => {
    try {
      const res = await fetch(`${API_BASE}/seats/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      if (res.ok) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'warning', message: `Desk ${deskId} released and available.` } });
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  }, [refreshData]);

  const abandonDesk = useCallback(async (deskId) => {
    // Simply check out the seat from client side view
    try {
      await fetch(`${API_BASE}/seats/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  }, [refreshData]);

  const resetDesk = useCallback(async (deskId) => {
    try {
      const res = await fetch(`${API_BASE}/seats/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      if (res.ok) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'success', message: `Desk ${deskId} reset to available.` } });
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  }, [refreshData]);

  const resetAllAbandoned = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/seats/reset-all-abandoned`, {
        method: 'POST',
      });
      if (res.ok) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'success', message: 'All abandoned desks have been reset.' } });
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  }, [refreshData]);

  const closeAwayModal    = useCallback(() => dispatch({ type: 'CLOSE_AWAY_MODAL' }),    []);
  const setHighlighted    = useCallback((ids) => dispatch({ type: 'SET_HIGHLIGHTED_DESKS', payload: ids }), []);
  const clearNotification = useCallback(() => dispatch({ type: 'CLEAR_NOTIFICATION' }),  []);

  const getStudent = useCallback((id) => state.students.find(s => s.id === id) ?? null, [state.students]);
  const getMyDesk  = useCallback(() => state.desks.find(d => d.id === state.myDeskId) ?? null, [state.desks, state.myDeskId]);

  return (
    <AppContext.Provider value={{
      state,
      checkIn, markAway, returnDesk, releaseDesk, abandonDesk,
      resetDesk, resetAllAbandoned, closeAwayModal, setHighlighted, clearNotification,
      getStudent, getMyDesk,
    }}>
      {children}
      {/* Self-healing polling indicator */}
      <div className="fixed bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-800 text-[10px] text-slate-400 font-mono px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg select-none z-50">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        LIVE SYNCED
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
