import { useState, useRef } from 'react'
import { formatFileSize, getFileIcon } from '../../utils/fileHelpers'
import { Spinner } from '../ui/Spinner'
import toast from 'react-hot-toast'

/**
 * Panel shown to MEMBERS so they can upload their work for a project.
 * Heads do not see this — they see MemberSubmissionsPanel instead.
 */
export function MemberSubmissionUpload({ projectId, userId, onUploaded }) {
  const [file, setFile] = useState(null)
  const [note, setNote] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  function pickFile(files) {
    if (!files?.length) return
    setFile(files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    pickFile(e.dataTransfer.files)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) { toast.error('Please select a file first'); return }

    setUploading(true)
    try {
      // Delegate actual upload to parent via callback (uses useMemberSubmissions)
      const result = await onUploaded({ file, note, userId })
      if (result?.success) {
        toast.success('Work submitted successfully!')
        setFile(null)
        setNote('')
      } else {
        toast.error(result?.error || 'Upload failed')
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      background: 'rgba(174,198,255,0.02)',
      border: '1px solid rgba(174,198,255,0.1)',
      borderRadius: '4px',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="material-symbols-outlined text-[#aec6ff]" style={{ fontSize: '18px' }}>upload_file</span>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#aec6ff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Submit Your Work
        </h3>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Drop zone */}
        {!file ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'rgba(174,198,255,0.5)' : 'rgba(174,198,255,0.18)'}`,
              borderRadius: '4px',
              padding: '28px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: dragOver ? 'rgba(174,198,255,0.05)' : 'transparent',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={e => pickFile(e.target.files)}
            />
            <span className="material-symbols-outlined text-[#525252]" style={{ fontSize: '36px' }}>
              cloud_upload
            </span>
            <p style={{ fontSize: '13px', color: '#8c909f' }}>
              Drag & drop your file, or{' '}
              <span style={{ color: '#aec6ff' }}>click to browse</span>
            </p>
            <p style={{ fontSize: '11px', color: '#424754' }}>Max 50 MB</p>
          </div>
        ) : (
          /* Selected file preview */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'rgba(174,198,255,0.06)',
            border: '1px solid rgba(174,198,255,0.15)',
            borderRadius: '4px',
          }}>
            <span className="material-symbols-outlined text-[#aec6ff]" style={{ fontSize: '20px' }}>
              {getFileIcon(file.type)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', color: '#e2e2e2', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </p>
              <p style={{ fontSize: '11px', color: '#525252' }}>{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="btn-ghost w-7 h-7 p-0"
              style={{ color: '#fa4d56', flexShrink: 0 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            </button>
          </div>
        )}

        {/* Optional note */}
        <div>
          <label className="carbon-label" htmlFor="submission-note">Note (optional)</label>
          <input
            id="submission-note"
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="carbon-input"
            placeholder="Brief description of what you're submitting…"
            maxLength={200}
          />
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="btn-primary"
          style={{ alignSelf: 'flex-end' }}
        >
          {uploading ? <Spinner size="sm" /> : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
              Submit Work
            </>
          )}
        </button>
      </form>
    </div>
  )
}
