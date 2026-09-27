import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches workspace performance (total time + yearly daily activity + streaks) for a given user.
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

      // Build dailyMap — all sessions grouped by YYYY-MM-DD
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      /** @type {Record<string, number>} date → session count */
      const dailyMap = {}
      sessions.forEach(s => {
        const d = new Date(s.login_time)
        const key = d.toISOString().slice(0, 10) // 'YYYY-MM-DD'
        dailyMap[key] = (dailyMap[key] || 0) + 1
      })

      // ── Streak calculations ───────────────────────────────────────
      // Helper: date → 'YYYY-MM-DD' string in LOCAL time
      function toDateStr(d) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }

      // Current streak: walk backward from today (or yesterday if today has no session yet)
      const todayStr = toDateStr(new Date())
      let currentStreak = 0
      const probe = new Date()
      // If today has activity start from today; otherwise start from yesterday
      if (!dailyMap[todayStr]) probe.setDate(probe.getDate() - 1)
      while (true) {
        const key = toDateStr(probe)
        if (!dailyMap[key]) break
        currentStreak++
        probe.setDate(probe.getDate() - 1)
      }

      // Longest streak: scan all active dates sorted ascending
      const activeDates = Object.keys(dailyMap).sort()
      let longestStreak = 0
      let runStreak = 0
      let prevDate = null
      for (const dateStr of activeDates) {
        const d = new Date(dateStr)
        if (prevDate) {
          const diffDays = Math.round((d - prevDate) / 86400000)
          if (diffDays === 1) {
            runStreak++
          } else {
            longestStreak = Math.max(longestStreak, runStreak)
            runStreak = 1
          }
        } else {
          runStreak = 1
        }
        prevDate = d
      }
      longestStreak = Math.max(longestStreak, runStreak)

      const yearSessions = Object.entries(dailyMap)
        .filter(([k]) => new Date(k) >= oneYearAgo)
        .reduce((a, [, v]) => a + v, 0)

      setStats({
        totalSessions,
        totalSeconds,
        avgSeconds,
        lastSeen,
        dailyMap,
        yearSessions,
        currentStreak,
        longestStreak,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, loading, error, fetchPerformance }
}

