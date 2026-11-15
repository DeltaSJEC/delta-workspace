import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { FileUploadZone } from '../components/projects/FileUploadZone'
import { DepartmentSelector } from '../components/projects/DepartmentSelector'
import { Spinner } from '../components/ui/Spinner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { buildStoragePath } from '../utils/fileHelpers'
import { validateUploadFileAsync } from '../constants/uploads'
import toast from 'react-hot-toast'

export default function CreateProjectPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDepts, setTargetDepts] = useState(['all'])
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

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
      // 1. Insert project
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          title: title.trim(),
          description: description.trim(),
          posted_by: user.id,
          target_departments: targetDepts,
        })
        .select()
        .single()

      if (projErr) throw projErr

      // 2. Upload files
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const validationError = await validateUploadFileAsync(file)
          if (validationError) throw new Error(`${file.name}: ${validationError}`)
          setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`)
          const storagePath = buildStoragePath(project.id, file.name)

          const { error: storageErr } = await supabase.storage
            .from('project-files')
            .upload(storagePath, file)

          if (storageErr) throw new Error(`Failed to upload ${file.name}: ${storageErr.message}`)

          const { error: fileRecordError } = await supabase.from('project_files').insert({
            project_id: project.id,
            storage_path: storagePath,
            filename: file.name,
            file_type: file.type || 'application/octet-stream',
            size_bytes: file.size,
          })
          if (fileRecordError) {
            const { error: rollbackError } = await supabase.storage.from('project-files').remove([storagePath])
            if (rollbackError) console.error('Could not roll back project file upload:', rollbackError)
            throw new Error(`Failed to save ${file.name}: ${fileRecordError.message}`)
          }
        }
      }

      toast.success('Project created!')
      navigate(`/project/${project.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to create project')
    } finally {
      setSubmitting(false)
      setUploadProgress('')
    }
  }

  return (
    <AppShell pageTitle="New Project">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#e2e2e2]">Create New Project</h2>
          <p className="text-sm text-[#525252] mt-1">Share a project with your team</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
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

          {/* Department targeting */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider mb-4">
              Target Audience
            </h3>
            <DepartmentSelector selected={targetDepts} onChange={setTargetDepts} />
          </div>

          {/* File upload */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider mb-4">
              Attachments <span className="text-[#424754] normal-case font-normal">(optional)</span>
            </h3>
            <FileUploadZone files={files} onChange={setFiles} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">{uploadProgress || 'Creating...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">publish</span>
                  Publish Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
