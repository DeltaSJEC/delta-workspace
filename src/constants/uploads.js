export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024

export const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
]

export const UPLOAD_ACCEPT = ALLOWED_UPLOAD_TYPES.join(',')

export function validateUploadFile(file) {
  if (!file) return 'Choose a file first.'
  if (file.size < 1) return 'Empty files cannot be uploaded.'
  if (file.size > MAX_UPLOAD_SIZE_BYTES) return 'Each file must be 50 MB or smaller.'
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return 'This file type is not supported.'
  return null
}
