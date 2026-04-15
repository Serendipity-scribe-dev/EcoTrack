import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { refreshUser } from './features/userSlice';
import { resetActivities } from './features/activitySlice';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.user);
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

// Layout wrapper for authenticated pages
function AppLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--eco-bg)' }}>
      <TopNav />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.user);

  // Handle Google redirect result FIRST (runs after Google redirects back)


  // Listen for Firebase auth state changes (handles page refresh / already signed-in)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('ecotrack_token', token);
          dispatch(refreshUser());
        } catch (err) {
          console.error('Token refresh failed:', err);
          dispatch(resetActivities());
        }
      } else {
        localStorage.removeItem('ecotrack_token');
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/log" element={
          <ProtectedRoute>
            <AppLayout><LogActivity /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <AppLayout><Leaderboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
