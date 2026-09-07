import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function HeadOnlyRoute({ children }) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#aec6ff] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (profile?.role !== 'head') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
