import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import Sidebar from './components/layout/Sidebar';
import PlayerBar from './components/player/PlayerBar';
import PWABanner from './components/layout/PWABanner';

import Home from './pages/Home';
import SearchPage from './pages/Search';
import AlbumPage from './pages/Album';
import Profile from './pages/Profile';
import Premium from './pages/Premium';
import { LoginPage, RegisterPage } from './pages/Auth';
import AuthCallback from './pages/AuthCallback';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAlbums from './pages/admin/Albums';
import AdminUsers from './pages/admin/Users';
import NewRelease from './pages/admin/NewRelease';

import './index.css';

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <PlayerBar />
      <PWABanner />
    </div>
  );
}

function AdminRoute() {
  const { user, loading, isAdmin } = useAuthStore();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <Outlet />;
}

function PrivateRoute() {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  const { init } = useAuthStore();
  useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg-2)', color: 'var(--text)', border: '1px solid var(--border)' },
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/premium" element={<Premium />} />

          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/albums" element={<AdminAlbums />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/new-release" element={<NewRelease />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}