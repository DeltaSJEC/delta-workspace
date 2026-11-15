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

/**
 * Inspects binary magic bytes to determine file signature.
 * Returns an object with detected type, danger flag, and description.
 */
export function inspectMagicBytes(bytes) {
  if (!bytes || bytes.length === 0) return null

  // ── 1. Blacklist: Executable & Dangerous Binary Signatures ──────────
  // Windows PE (.exe, .dll, .sys, .com, .scr): 4D 5A ('MZ')
  if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
    return { type: 'application/x-msdownload', dangerous: true, description: 'Windows Executable (MZ/PE)' }
  }

  // Linux ELF Executable: 7F 45 4C 46 ('\x7FELF')
  if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
    return { type: 'application/x-executable', dangerous: true, description: 'Linux ELF Executable' }
  }

  // macOS Mach-O Executable
  if (
    (bytes[0] === 0xfe && bytes[1] === 0xed && bytes[2] === 0xfa && (bytes[3] === 0xce || bytes[3] === 0xcf)) ||
    (bytes[0] === 0xce && bytes[1] === 0xfa && bytes[2] === 0xed && bytes[3] === 0xfe) ||
    (bytes[0] === 0xcf && bytes[1] === 0xfa && bytes[2] === 0xed && bytes[3] === 0xfe)
  ) {
    return { type: 'application/x-mach-binary', dangerous: true, description: 'macOS Mach-O Executable' }
  }

  // Java Class / Fat Binary: CA FE BA BE
  if (bytes[0] === 0xca && bytes[1] === 0xfe && bytes[2] === 0xba && bytes[3] === 0xbe) {
    return { type: 'application/java-vm', dangerous: true, description: 'Java Class / Fat Binary' }
  }

  // Executable Shell Script: '#!' (0x23, 0x21)
  if (bytes[0] === 0x23 && bytes[1] === 0x21) {
    return { type: 'application/x-sh', dangerous: true, description: 'Executable Shell Script' }
  }

  // ── 2. Whitelist: Legitimate File Signatures ────────────────────────
  // PDF: '%PDF' (0x25, 0x50, 0x44, 0x46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { type: 'application/pdf', category: 'pdf' }
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { type: 'image/png', category: 'image' }
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { type: 'image/jpeg', category: 'image' }
  }

  // GIF: 'GIF87a' or 'GIF89a' (47 49 46 38 37/39 61)
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61
  ) {
    return { type: 'image/gif', category: 'image' }
  }

  // WEBP: starts with 'RIFF' (52 49 46 46) and bytes 8-11 are 'WEBP' (57 45 42 50)
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { type: 'image/webp', category: 'image' }
  }

  // WAV: starts with 'RIFF' (52 49 46 46) and bytes 8-11 are 'WAVE' (57 41 56 45)
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45
  ) {
    return { type: 'audio/wav', category: 'audio' }
  }

  // ZIP / DOCX / XLSX / PPTX: 'PK\x03\x04' (50 4B 03 04) or empty zip (50 4B 05 06)
  if (
    bytes[0] === 0x50 && bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) || (bytes[2] === 0x05 && bytes[3] === 0x06))
  ) {
    return {
      type: 'application/zip',
      allowedMimes: [
        'application/zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
      category: 'archive/office-openxml',
    }
  }

  // Legacy MS Office (DOC, XLS, PPT): D0 CF 11 E0 A1 B1 1A E1
  if (
    bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 && bytes[5] === 0xb1 && bytes[6] === 0x1a && bytes[7] === 0xe1
  ) {
    return {
      type: 'application/msword',
      allowedMimes: [
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
      ],
      category: 'legacy-office',
    }
  }

  // MP4 / M4V: bytes 4-7 are 'ftyp' (66 74 79 70)
  if (
    bytes.length >= 8 &&
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
  ) {
    return { type: 'video/mp4', category: 'video' }
  }

  // WebM: 1A 45 DF A3
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return { type: 'video/webm', category: 'video' }
  }

  // MP3: 'ID3' (49 44 33) or MPEG sync frame (FF FB / FF F3 / FF F2)
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) ||
    (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
  ) {
    return { type: 'audio/mpeg', category: 'audio' }
  }

  // Text / CSV: check for ASCII/UTF-8 printable text characters (no null bytes 0x00)
  if (isPrintableText(bytes)) {
    const textSample = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 256)).toLowerCase()
    if (textSample.includes('<script') || textSample.includes('<html') || textSample.includes('<?php')) {
      return { type: 'text/html', dangerous: true, description: 'Embedded HTML/Script content' }
    }
    return { type: 'text/plain', allowedMimes: ['text/plain', 'text/csv'], category: 'text' }
  }

  return { type: 'unknown', description: 'Unrecognized or generic binary stream' }
}

function isPrintableText(bytes) {
  const checkLen = Math.min(bytes.length, 512)
  if (checkLen === 0) return false
  for (let i = 0; i < checkLen; i++) {
    const b = bytes[i]
    if (b === 0x00) return false // null bytes indicate binary files
    if (b < 32 && b !== 9 && b !== 10 && b !== 13) return false
  }
  return true
}

/**
 * Validates extracted bytes against the declared MIME type.
 * Returns null if valid, or an error message if rejected.
 */
export function validateFileBytes(bytes, declaredType) {
  if (!bytes || bytes.length === 0) return 'File content is empty or unreadable.'
  const sig = inspectMagicBytes(bytes)
  if (!sig) return 'Unable to determine file content signature.'

  if (sig.dangerous) {
    return `Security violation: Executable or dangerous content detected (${sig.description}). Upload rejected.`
  }

  // Verify that the detected signature matches the declared type
  if (sig.allowedMimes) {
    if (!sig.allowedMimes.includes(declaredType)) {
      return `File content signature (${sig.type}) does not match declared type (${declaredType}). Disguised files are rejected.`
    }
  } else if (sig.type !== 'unknown' && sig.type !== declaredType) {
    return `File content signature (${sig.type}) does not match declared type (${declaredType}). Disguised files are rejected.`
  }

  return null
}

/**
 * Synchronous basic validation (checks size, empty files, declared type,
 * and if byte buffer is attached, verifies magic bytes).
 */
export function validateUploadFile(file) {
  if (!file) return 'Choose a file first.'
  if (file.size < 1) return 'Empty files cannot be uploaded.'
  if (file.size > MAX_UPLOAD_SIZE_BYTES) return 'Each file must be 50 MB or smaller.'
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return 'This file type is not supported.'

  // If buffer / bytes are present synchronously, validate magic bytes immediately
  if (file.buffer || file.bytes) {
    const raw = file.bytes || (file.buffer instanceof Uint8Array ? file.buffer : new Uint8Array(file.buffer))
    return validateFileBytes(raw.slice(0, 512), file.type)
  }

  return null
}

/**
 * Asynchronous deep validation: performs size and MIME checks, then extracts the
 * initial header bytes from Browser File / Blob / Buffer to verify magic numbers.
 */
export async function validateUploadFileAsync(file) {
  const basicErr = validateUploadFile(file)
  if (basicErr) return basicErr

  let headerBytes = null

  if (file.bytes instanceof Uint8Array) {
    headerBytes = file.bytes.slice(0, 512)
  } else if (file.buffer) {
    const buf = file.buffer instanceof Uint8Array ? file.buffer : new Uint8Array(file.buffer)
    headerBytes = buf.slice(0, 512)
  } else if (typeof file.slice === 'function') {
    try {
      const slice = file.slice(0, 512)
      if (typeof slice.arrayBuffer === 'function') {
        const ab = await slice.arrayBuffer()
        headerBytes = new Uint8Array(ab)
      }
    } catch {
      // slice failed, fallback to arrayBuffer if available
    }
  }

  if (!headerBytes && typeof file.arrayBuffer === 'function') {
    try {
      const ab = await file.arrayBuffer()
      headerBytes = new Uint8Array(ab.slice(0, 512))
    } catch {
      // unable to read
    }
  }

  if (headerBytes && headerBytes.length > 0) {
    return validateFileBytes(headerBytes, file.type)
  }

  return null
}
