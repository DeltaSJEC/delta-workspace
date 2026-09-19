import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { HeadOnlyRoute } from './routes/HeadOnlyRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import MemberDashboard from './pages/MemberDashboard'
import HeadDashboard from './pages/HeadDashboard'
import ProjectDetailPage from './pages/ProjectDetailPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import CreateProjectPage from './pages/CreateProjectPage'
import CreateAnnouncementPage from './pages/CreateAnnouncementPage'
import LoginActivityPage from './pages/LoginActivityPage'
import ProfilePage from './pages/ProfilePage'

// Smart dashboard redirect based on role
function DashboardRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return null
  return <Navigate to={profile?.role === 'head' ? '/head-dashboard' : '/member-dashboard'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Smart redirect */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
      } />

      {/* Member + Head */}
      <Route path="/member-dashboard" element={
        <ProtectedRoute><MemberDashboard /></ProtectedRoute>
      } />
      <Route path="/project/:id" element={
        <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>
      } />
      <Route path="/announcements" element={
        <ProtectedRoute><AnnouncementsPage /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />

      {/* Head only */}
      <Route path="/head-dashboard" element={
        <ProtectedRoute><HeadOnlyRoute><HeadDashboard /></HeadOnlyRoute></ProtectedRoute>
      } />
      <Route path="/create-project" element={
        <ProtectedRoute><HeadOnlyRoute><CreateProjectPage /></HeadOnlyRoute></ProtectedRoute>
      } />
      <Route path="/create-announcement" element={
        <ProtectedRoute><HeadOnlyRoute><CreateAnnouncementPage /></HeadOnlyRoute></ProtectedRoute>
      } />
      <Route path="/login-activity" element={
        <ProtectedRoute><HeadOnlyRoute><LoginActivityPage /></HeadOnlyRoute></ProtectedRoute>
      } />

      {/* Catch-all: authenticated users go to dashboard, guests to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1c1c',
              color: '#e2e2e2',
              border: '1px solid rgba(174,198,255,0.15)',
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#64dcb4', secondary: '#1a1c1c' } },
            error: { iconTheme: { primary: '#fa4d56', secondary: '#1a1c1c' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
