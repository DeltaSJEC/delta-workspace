import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches workspace performance (total time + yearly daily activity) for a given user.
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
      // Fetch all sessions for this user (up to last 365 days is enough for heatmap)
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)

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

      // Sessions in past year — group by YYYY-MM-DD
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      /** @type {Record<string, number>} date string → session count */
      const dailyMap = {}
      sessions.forEach(s => {
        const d = new Date(s.login_time)
        if (d >= oneYearAgo) {
          const key = d.toISOString().slice(0, 10) // 'YYYY-MM-DD'
          dailyMap[key] = (dailyMap[key] || 0) + 1
        }
      })

      setStats({
        totalSessions,
        totalSeconds,
        avgSeconds,
        lastSeen,
        dailyMap,           // for heatmap
        yearSessions: Object.values(dailyMap).reduce((a, b) => a + b, 0),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, loading, error, fetchPerformance }
}
