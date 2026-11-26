import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { FileUploadZone } from '../components/projects/FileUploadZone'
import { DepartmentSelector } from '../components/projects/DepartmentSelector'
import { Spinner } from '../components/ui/Spinner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useProject } from '../hooks/useProjects'
import { buildStoragePath, formatFileSize, getFileIcon } from '../utils/fileHelpers'
import { validateUploadFileAsync, resolveUploadMimeType } from '../constants/uploads'
import toast from 'react-hot-toast'

export default function EditProjectPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { project, loading: projectLoading, error: projectError } = useProject(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDepts, setTargetDepts] = useState(['all'])
  const [existingFiles, setExistingFiles] = useState([])
  const [filesToDelete, setFilesToDelete] = useState([]) // IDs of existing files to remove on save
  const [newFiles, setNewFiles] = useState([])           // brand-new File objects to upload
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Pre-fill the form once the project data arrives
  useEffect(() => {
    if (project && !initialized) {
      setTitle(project.title)
      setDescription(project.description)
      setTargetDepts(project.target_departments?.length ? project.target_departments : ['all'])
      setExistingFiles(project.project_files || [])
      setInitialized(true)
    }
  }, [project, initialized])

  // Redirect if the signed-in head is not the project owner
  useEffect(() => {
    if (project && profile && project.posted_by !== profile.id) {
      toast.error('You can only edit your own projects')
      navigate(`/project/${id}`, { replace: true })
    }
  }, [project, profile, id, navigate])

  // ── Existing file helpers ──────────────────────────────────────────────
  function markForDeletion(fileId) {
    setFilesToDelete(prev => [...prev, fileId])
  }
  function undoDeletion(fileId) {
    setFilesToDelete(prev => prev.filter(fid => fid !== fileId))
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required')
      return
    }
    if (targetDepts.length === 0) {
      toast.error('Select at least one department target')
      return
    }
    setSubmitting(true)

    try {
      // 1. Update the project row
      const { error: updateErr } = await supabase
        .from('projects')
        .update({
          title: title.trim(),
          description: description.trim(),
          target_departments: targetDepts,
        })
        .eq('id', id)

      if (updateErr) throw updateErr

      // 2. Delete files the user marked for removal
      const toDelete = existingFiles.filter(f => filesToDelete.includes(f.id))
      for (const file of toDelete) {
        // Remove from storage (best-effort — don't block on failure)
        const { error: storageErr } = await supabase.storage
          .from('project-files')
          .remove([file.storage_path])
        if (storageErr) console.error('Storage remove failed:', storageErr)

        // Remove the DB record
        const { error: dbErr } = await supabase
          .from('project_files')
          .delete()
          .eq('id', file.id)
        if (dbErr) throw new Error(`Failed to delete ${file.filename}: ${dbErr.message}`)
      }

      // 3. Upload new files
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
        const validationError = await validateUploadFileAsync(file)
        if (validationError) throw new Error(`${file.name}: ${validationError}`)

        setUploadProgress(`Uploading ${i + 1}/${newFiles.length}: ${file.name}`)
        const storagePath = buildStoragePath(id, file.name)
        const contentType = resolveUploadMimeType(file) || 'application/octet-stream'

        const { error: storageErr } = await supabase.storage
          .from('project-files')
          .upload(storagePath, file, { contentType })
        if (storageErr) throw new Error(`Failed to upload ${file.name}: ${storageErr.message}`)

        const { error: fileRecordErr } = await supabase.from('project_files').insert({
          project_id: id,
          storage_path: storagePath,
          filename: file.name,
          file_type: contentType,
          size_bytes: file.size,
        })
        if (fileRecordErr) {
          // Rollback the storage upload
          await supabase.storage.from('project-files').remove([storagePath])
          throw new Error(`Failed to save ${file.name}: ${fileRecordErr.message}`)
        }
      }

      toast.success('Project updated!')
      navigate(`/project/${id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update project')
    } finally {
      setSubmitting(false)
      setUploadProgress('')
    }
  }

  // ── Loading / error states ─────────────────────────────────────────────
  if (projectLoading) {
    return (
      <AppShell pageTitle="Edit Project">
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </AppShell>
    )
  }

  if (projectError || !project) {
    return (
      <AppShell pageTitle="Edit Project">
        <div className="glass-card p-10 text-center max-w-lg mx-auto mt-10">
          <span className="material-symbols-outlined text-[#fa4d56] block mb-3" style={{ fontSize: 40 }}>error</span>
          <p className="text-[#fa4d56]">{projectError || 'Project not found'}</p>
        </div>
      </AppShell>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AppShell pageTitle="Edit Project">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#e2e2e2]">Edit Project</h2>
          <p className="text-sm text-[#525252] mt-1">Update your project details and files</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Title & Description ── */}
          <div className="glass-card p-6 flex flex-col gap-5">
            <div>
              <label className="carbon-label" htmlFor="proj-title">Project Title *</label>
              <input
                id="proj-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="carbon-input"
                placeholder="e.g. Robotic Arm — Phase 2"
                maxLength={120}
                required
              />
            </div>
            <div>
              <label className="carbon-label" htmlFor="proj-desc">Description *</label>
              <textarea
                id="proj-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="carbon-textarea"
                placeholder="Describe the project, goals, progress, and any relevant details..."
                rows={6}
                maxLength={5000}
                required
              />
            </div>
          </div>

          {/* ── Department targeting ── */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider mb-4">
              Target Audience
            </h3>
            <DepartmentSelector selected={targetDepts} onChange={setTargetDepts} />
          </div>

          {/* ── Existing attachments ── */}
          {existingFiles.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider mb-4">
                Current Attachments
              </h3>
              <div className="flex flex-col gap-2">
                {existingFiles.map(file => {
                  const marked = filesToDelete.includes(file.id)
                  return (
                    <div
                      key={file.id}
                      className={`flex items-center gap-3 p-3 rounded-sm border transition-all ${
                        marked
                          ? 'bg-[rgba(218,30,40,0.08)] border-[rgba(218,30,40,0.3)] opacity-60'
                          : 'bg-[#1a1c1c] border-[#333535]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[#aec6ff] text-[18px]">
                        {getFileIcon(file.file_type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${marked ? 'line-through text-[#525252]' : 'text-[#c2c6d6]'}`}>
                          {file.filename}
                        </p>
                        <p className="text-xs text-[#525252]">{formatFileSize(file.size_bytes)}</p>
                      </div>
                      {marked ? (
                        <button
                          type="button"
                          onClick={() => undoDeletion(file.id)}
                          className="btn-ghost h-7 px-2 text-xs text-[#64dcb4] flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">undo</span>
                          Undo
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markForDeletion(file.id)}
                          className="btn-ghost w-7 h-7 p-0 text-[#fa4d56]"
                          title="Remove this file"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              {filesToDelete.length > 0 && (
                <p className="text-xs text-[#fa4d56] mt-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  {filesToDelete.length} file{filesToDelete.length !== 1 ? 's' : ''} will be permanently deleted on save
                </p>
              )}
            </div>
          )}

          {/* ── Add new files ── */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider mb-4">
              Add New Attachments <span className="text-[#424754] normal-case font-normal">(optional)</span>
            </h3>
            <FileUploadZone files={newFiles} onChange={setNewFiles} />
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate(`/project/${id}`)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">{uploadProgress || 'Saving...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
