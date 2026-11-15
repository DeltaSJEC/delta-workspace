import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { buildMemberSubmissionPath } from '../utils/fileHelpers'
import { validateUploadFileAsync } from '../constants/uploads'

/**
 * Hook for member work submissions on a project.
 * - Members: upload/delete their own submissions, fetch their own.
 * - Heads: fetch ALL submissions for a project.
 */
export function useMemberSubmissions(projectId) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  // ── Fetch submissions for a project ────────────────────────────────────────
  // RLS ensures: heads see all, members see only their own.
  const fetchSubmissions = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchErr } = await supabase
        .from('member_submissions')
        .select(`
          id,
          project_id,
          submitted_by,
          storage_path,
          filename,
          file_type,
          size_bytes,
          note,
          submitted_at,
          submitted_by_user:users!member_submissions_submitted_by_fkey(id, name, department, role)
        `)
        .eq('project_id', projectId)
        .order('submitted_at', { ascending: false })

      if (fetchErr) setError(fetchErr.message)
      else setSubmissions(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // ── Upload a submission ─────────────────────────────────────────────────────
  const uploadSubmission = useCallback(async ({ file, note, userId }) => {
    if (!file || !projectId || !userId) return

    const validationError = await validateUploadFileAsync(file)
    if (validationError) return { success: false, error: validationError }

    setUploading(true)
    setError(null)
    try {
      // 1. Upload to storage
      const storagePath = buildMemberSubmissionPath(projectId, userId, file.name)

      const { error: storageErr } = await supabase.storage
        .from('member-submissions')
        .upload(storagePath, file, { upsert: false })

      if (storageErr) throw new Error(storageErr.message)

      // 2. Insert metadata row
      const { error: insertErr } = await supabase
        .from('member_submissions')
        .insert({
          project_id: projectId,
          submitted_by: userId,
          storage_path: storagePath,
          filename: file.name,
          file_type: file.type,
          size_bytes: file.size,
          note: note?.trim() || '',
        })

      if (insertErr) {
        // Rollback storage upload
        const { error: rollbackError } = await supabase.storage.from('member-submissions').remove([storagePath])
        if (rollbackError) console.error('Could not roll back submission upload:', rollbackError)
        throw new Error(insertErr.message)
      }

      await fetchSubmissions()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setUploading(false)
    }
  }, [projectId, fetchSubmissions])

  // ── Delete a submission ─────────────────────────────────────────────────────
  const deleteSubmission = useCallback(async (submission) => {
    try {
      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('member-submissions')
        .remove([submission.storage_path])

      if (storageError) throw new Error(storageError.message)

      // Remove metadata
      const { error: delErr } = await supabase
        .from('member_submissions')
        .delete()
        .eq('id', submission.id)

      if (delErr) throw new Error(delErr.message)

      setSubmissions(prev => prev.filter(s => s.id !== submission.id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // ── Download / signed URL ───────────────────────────────────────────────────
  const getDownloadUrl = useCallback(async (storagePath) => {
    const { data, error: urlErr } = await supabase.storage
      .from('member-submissions')
      .createSignedUrl(storagePath, 120)

    if (urlErr) return { url: null, error: urlErr.message }
    return { url: data.signedUrl, error: null }
  }, [])

  return {
    submissions,
    loading,
    uploading,
    error,
    fetchSubmissions,
    uploadSubmission,
    deleteSubmission,
    getDownloadUrl,
  }
}
