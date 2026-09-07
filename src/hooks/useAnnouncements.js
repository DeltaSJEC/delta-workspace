import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useAnnouncements() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnnouncements = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('announcements')
      .select(`
        *,
        posted_by_user:users!announcements_posted_by_fkey(id, name, department, role)
      `)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (fetchError) setError(fetchError.message)
    else setAnnouncements(data || [])
    setLoading(false)
  }, [profile])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  // Real-time subscription
  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel('announcements-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchAnnouncements()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile, fetchAnnouncements])

  return { announcements, loading, error, refetch: fetchAnnouncements }
}
