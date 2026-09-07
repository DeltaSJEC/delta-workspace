import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useComments(projectId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, name, department, role)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (fetchError) setError(fetchError.message)
    else setComments(data || [])
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // Real-time subscription
  useEffect(() => {
    if (!projectId) return
    const channel = supabase
      .channel(`comments-${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `project_id=eq.${projectId}`,
      }, () => {
        fetchComments()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [projectId, fetchComments])

  async function addComment(text, userId) {
    setSubmitting(true)
    const { error: insertError } = await supabase
      .from('comments')
      .insert({ project_id: projectId, user_id: userId, text })
    setSubmitting(false)
    if (insertError) throw insertError
  }

  async function deleteComment(commentId) {
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    if (deleteError) throw deleteError
  }

  return { comments, loading, error, submitting, addComment, deleteComment, refetch: fetchComments }
}
