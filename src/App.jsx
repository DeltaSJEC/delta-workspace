import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { HeadOnlyRoute } from './routes/HeadOnlyRoute'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'))
const HeadDashboard = lazy(() => import('./pages/HeadDashboard'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'))
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'))
const CreateAnnouncementPage = lazy(() => import('./pages/CreateAnnouncementPage'))
const LoginActivityPage = lazy(() => import('./pages/LoginActivityPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

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

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#0c0f0f]" />}>
          <AppRoutes />
        </Suspense>
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
    </ErrorBoundary>
  )
}
