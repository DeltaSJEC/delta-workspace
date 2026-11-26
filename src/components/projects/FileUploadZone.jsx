import { useState, useRef } from 'react'
import { formatFileSize } from '../../utils/fileHelpers'
import { UPLOAD_ACCEPT, validateUploadFileAsync } from '../../constants/uploads'
import toast from 'react-hot-toast'

export function FileUploadZone({ files, onChange }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  async function handleFiles(newFiles) {
    const list = Array.from(newFiles || [])
    if (list.length === 0) return

    const validFiles = []
    for (const file of list) {
      const errorMsg = await validateUploadFileAsync(file)
      if (errorMsg) {
        toast.error(`${file.name}: ${errorMsg}`)
      } else {
        validFiles.push(file)
      }
    }

    if (validFiles.length === 0) return

    onChange(prev => {
      const existing = new Set(prev.map(f => `${f.name}:${f.size}:${f.lastModified}`))
      const unique = validFiles.filter(f => !existing.has(`${f.name}:${f.size}:${f.lastModified}`))
      return [...prev, ...unique]
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeFile(name) {
    onChange(prev => prev.filter(f => f.name !== name))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={UPLOAD_ACCEPT}
          className="hidden"
          onChange={e => {
            const selected = Array.from(e.target.files || [])
            e.target.value = ''
            handleFiles(selected)
          }}
        />
        <span className="material-symbols-outlined text-[#424754] mb-3 block" style={{ fontSize: 36 }}>
          cloud_upload
        </span>
        <p className="text-sm text-[#8c909f]">
          Drag & drop files here, or <span className="text-[#aec6ff]">click to browse</span>
        </p>
        <p className="text-xs text-[#424754] mt-1">Max 50MB per file</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map(file => (
            <div key={file.name} className="flex items-center gap-3 p-3 bg-[#1a1c1c] rounded-sm border border-[#333535]">
              <span className="material-symbols-outlined text-[#aec6ff] text-[18px]">insert_drive_file</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#c2c6d6] truncate">{file.name}</p>
                <p className="text-xs text-[#525252]">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                className="btn-ghost w-7 h-7 p-0 text-[#fa4d56]"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
