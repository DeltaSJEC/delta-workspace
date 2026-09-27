import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches all member submissions made by a specific user.
 * Used in ProfilePage → "Previous Work Submitted" section.
 *
 * Each row includes the parent project title/description so we can
 * show a card linking to that project.
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
        .from('member_submissions')
        .select(`
          id,
          project_id,
          filename,
          file_type,
          size_bytes,
          note,
          submitted_at,
          project:projects(
            id,
            title,
            description,
            created_at,
            target_departments,
            reactions(id, type),
            comments(id)
          )
        `)
        .eq('submitted_by', userId)
        .order('submitted_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        // Normalise: attach submission-level metadata so ProfilePage can render
        const rows = (data || []).map(s => ({
          // submission info
          submissionId: s.id,
          submittedAt: s.submitted_at,
          filename: s.filename,
          fileType: s.file_type,
          sizeBytes: s.size_bytes,
          note: s.note,
          // project info (flattened for compatibility with existing card rendering)
          id: s.project?.id,
          title: s.project?.title,
          description: s.project?.description,
          created_at: s.project?.created_at,
          target_departments: s.project?.target_departments,
          reactions: s.project?.reactions || [],
          comments: s.project?.comments || [],
          project_files: [],
        }))
        setProjects(rows)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { projects, loading, error, fetchUserProjects }
}
