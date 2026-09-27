import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches workspace performance (total time spent) for a given user.
 * Sums all completed session duration_seconds from login_sessions.
 */
export function usePerformance() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPerformance = useCallback(async (userId) => {
    if (!userId) return
    setLoading(true)
    setError(null)

    try {
      // Fetch all sessions for this user
      const { data, error: fetchError } = await supabase
        .from('login_sessions')
        .select('duration_seconds, login_time, logout_time')
        .eq('user_id', userId)
        .order('login_time', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      const sessions = data || []
      const totalSessions = sessions.length
      const completedSessions = sessions.filter(s => s.duration_seconds !== null)
      const totalSeconds = completedSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0)

      // Average session duration
      const avgSeconds = completedSessions.length > 0
        ? Math.round(totalSeconds / completedSessions.length)
        : 0

      // Last seen (most recent login)
      const lastSeen = sessions.length > 0 ? sessions[0].login_time : null

      // Sessions in the past 7 days
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const recentSessions = sessions.filter(s => new Date(s.login_time) >= oneWeekAgo).length

      setStats({
        totalSessions,
        totalSeconds,
        avgSeconds,
        lastSeen,
        recentSessions,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, loading, error, fetchPerformance }
}
