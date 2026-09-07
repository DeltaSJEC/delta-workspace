import { supabase } from '../../lib/supabaseClient'
import { formatFileSize, getFileIcon } from '../../utils/fileHelpers'
import toast from 'react-hot-toast'

export function ProjectFileList({ files, projectId, canDelete = false, onDeleted }) {
  if (!files || files.length === 0) return null

  async function handleDownload(file) {
    const { data, error } = await supabase.storage
      .from('project-files')
      .createSignedUrl(file.storage_path, 60)

    if (error) {
      toast.error('Could not generate download link')
      return
    }
    window.open(data.signedUrl, '_blank')
  }

  async function handleDelete(file) {
    if (!confirm(`Delete "${file.filename}"?`)) return
    // Delete from storage
    await supabase.storage.from('project-files').remove([file.storage_path])
    // Delete metadata record
    const { error } = await supabase.from('project_files').delete().eq('id', file.id)
    if (error) {
      toast.error('Failed to delete file')
    } else {
      toast.success('File deleted')
      onDeleted?.()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {files.map(file => (
        <div
          key={file.id}
          className="flex items-center gap-3 p-3 rounded-sm border border-[rgba(174,198,255,0.08)] bg-[rgba(14,20,40,0.4)] hover:border-[rgba(174,198,255,0.15)] transition-colors group"
        >
          <span className="material-symbols-outlined text-[#aec6ff] text-[20px] shrink-0">
            {getFileIcon(file.file_type)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#c2c6d6] truncate">{file.filename}</p>
            <p className="text-xs text-[#525252]">{formatFileSize(file.size_bytes)}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDownload(file)}
              className="btn-ghost w-8 h-8 p-0"
              title="Download"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
            </button>
            {canDelete && (
              <button
                onClick={() => handleDelete(file)}
                className="btn-ghost w-8 h-8 p-0 text-[#fa4d56] hover:bg-[rgba(218,30,40,0.1)]"
                title="Delete"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
