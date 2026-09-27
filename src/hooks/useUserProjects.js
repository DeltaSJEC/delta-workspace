import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches all projects submitted by a specific user.
 */
export function useUserProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUserProjects = useCallback(async (userId) => {
    if (!userId) return
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          created_at,
          target_departments,
          project_files(id),
          reactions(id, type),
          comments(id)
        `)
        .eq('posted_by', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setProjects(data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { projects, loading, error, fetchUserProjects }
}
