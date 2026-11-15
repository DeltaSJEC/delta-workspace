import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getMemberDetails } from '../constants/members'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)       // auth.user
  const [profile, setProfile] = useState(null) // public.users row
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const currentSessionRowId = useRef(null)

  // ────────────────────────────────────────────────────────────────
  // Fetch public profile from users table
  // ────────────────────────────────────────────────────────────────
  async function fetchProfile(userId, authUser) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    const memberMeta = getMemberDetails(data.email) || {}
    const authMeta = authUser?.user_metadata || {}

    return {
      ...data,
      name: memberMeta.name || data.name,
      role_title: memberMeta.role_title || authMeta.role_title || (data.role === 'head' ? 'Head' : 'Member'),
      branch: memberMeta.branch || authMeta.branch || '',
      department: memberMeta.department || data.department,
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Log login session
  // ────────────────────────────────────────────────────────────────
  async function logLogin(userId) {
    const { data, error } = await supabase
      .from('login_sessions')
      .insert({ user_id: userId, login_time: new Date().toISOString() })
      .select('id')
      .single()
    if (error) {
      console.error('Error logging login session:', error)
      return null
    }
    currentSessionRowId.current = data.id
    return data.id
  }

  // ────────────────────────────────────────────────────────────────
  // Log logout — update session row
  // ────────────────────────────────────────────────────────────────
  async function logLogout() {
    if (!currentSessionRowId.current) return
    const logoutTime = new Date().toISOString()

    // Fetch login_time first to compute duration
    const { data: sessionRow } = await supabase
      .from('login_sessions')
      .select('login_time')
      .eq('id', currentSessionRowId.current)
      .single()

    if (sessionRow) {
      const loginTime = new Date(sessionRow.login_time)
      const duration = Math.floor((new Date() - loginTime) / 1000)
      await supabase
        .from('login_sessions')
        .update({ logout_time: logoutTime, duration_seconds: duration })
        .eq('id', currentSessionRowId.current)
    }
    currentSessionRowId.current = null
  }

  // ────────────────────────────────────────────────────────────────
  // Init — check existing session
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (!mounted) return

      if (existingSession) {
        setSession(existingSession)
        setUser(existingSession.user)
        const p = await fetchProfile(existingSession.user.id, existingSession.user)
        if (mounted) setProfile(p)
      }
      if (mounted) setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        const p = await fetchProfile(newSession.user.id, newSession.user)
        if (mounted) setProfile(p)
      } else {
        setProfile(null)
      }

      if (event === 'SIGNED_OUT') {
        currentSessionRowId.current = null
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ────────────────────────────────────────────────────────────────
  // Login (supports Login ID or Email)
  // ────────────────────────────────────────────────────────────────
  async function login(identifier, password) {
    setError(null)
    const trimmed = identifier.trim()
    const email = trimmed.includes('@')
      ? trimmed.toLowerCase()
      : `${trimmed.toLowerCase()}@delta.sjec.ac.in`

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      throw authError
    }

    // Immediately fetch profile for fast routing
    const p = await fetchProfile(data.user.id, data.user)
    setProfile(p)

    // Log the session
    await logLogin(data.user.id)
    return { ...data, profile: p }
  }

  // ────────────────────────────────────────────────────────────────
  // Logout
  // ────────────────────────────────────────────────────────────────
  async function logout() {
    await logLogout()
    await supabase.auth.signOut()
  }

  // ────────────────────────────────────────────────────────────────
  // Change password
  // ────────────────────────────────────────────────────────────────
  async function changePassword(newPassword) {
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) throw updateError
  }

  const value = {
    session,
    user,
    profile,
    loading,
    error,
    login,
    logout,
    changePassword,
    isHead: profile?.role === 'head',
    isMember: profile?.role === 'member',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// This hook intentionally shares a module with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
