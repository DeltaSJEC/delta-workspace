/**
 * Format file size in bytes to a human-readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Get a file icon name (Material Symbols) based on MIME type
 * @param {string} fileType
 * @returns {string}
 */
export function getFileIcon(fileType) {
  if (!fileType) return 'insert_drive_file'
  if (fileType.includes('pdf')) return 'picture_as_pdf'
  if (fileType.includes('image')) return 'image'
  if (fileType.includes('video')) return 'video_file'
  if (fileType.includes('audio')) return 'audio_file'
  if (fileType.includes('word') || fileType.includes('document')) return 'description'
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) return 'table_chart'
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'slideshow'
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'folder_zip'
  if (fileType.includes('text')) return 'text_snippet'
  return 'insert_drive_file'
}

/**
 * Generate a safe storage path for a project file
 * @param {string} projectId
 * @param {string} filename
 * @returns {string}
 */
export function buildStoragePath(projectId, filename) {
  const timestamp = Date.now()
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${projectId}/${timestamp}_${safeName}`
}

export function buildMemberSubmissionPath(projectId, userId, filename) {
  const timestamp = Date.now()
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${projectId}/${userId}/${timestamp}_${safeName}`
}
