import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useProjects() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        posted_by_user:users!projects_posted_by_fkey(id, name, department, role),
        project_files(id, filename, file_type, size_bytes, storage_path),
        reactions(id, user_id, type),
        comments(id)
      `)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [profile])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Real-time subscription
  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile, fetchProjects])

  return { projects, loading, error, refetch: fetchProjects }
}

export function useProject(projectId) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProject = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        posted_by_user:users!projects_posted_by_fkey(id, name, department, role),
        project_files(*),
        reactions(id, user_id, type)
      `)
      .eq('id', projectId)
      .single()

    if (fetchError) setError(fetchError.message)
    else setProject(data)
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return { project, loading, error, refetch: fetchProject }
}
