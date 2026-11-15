import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMemberSubmissionPath, buildStoragePath } from '../src/utils/fileHelpers.js'
import {
  MAX_UPLOAD_SIZE_BYTES,
  validateUploadFile,
  validateUploadFileAsync,
  inspectMagicBytes,
  validateFileBytes,
} from '../src/constants/uploads.js'

test('accepts a supported non-empty file within the limit', () => {
  const result = validateUploadFile({ size: 1024, type: 'application/pdf' })
  assert.equal(result, null)
})

test('rejects empty, oversized, and unsupported files', () => {
  assert.match(validateUploadFile({ size: 0, type: 'application/pdf' }), /Empty/)
  assert.match(validateUploadFile({ size: MAX_UPLOAD_SIZE_BYTES + 1, type: 'application/pdf' }), /50 MB/)
  assert.match(validateUploadFile({ size: 1024, type: 'text/html' }), /not supported/)
})

test('storage paths preserve the required ownership segments and sanitize names', () => {
  const projectPath = buildStoragePath('project-id', 'unsafe name!.pdf')
  assert.match(projectPath, /^project-id\/\d+_unsafe_name_\.pdf$/)

  const submissionPath = buildMemberSubmissionPath('project-id', 'user-id', 'unsafe name!.pdf')
  assert.match(submissionPath, /^project-id\/user-id\/\d+_unsafe_name_\.pdf$/)
})

test('magic-bytes: accepts legitimate file signatures', async () => {
  // 1. PDF ('%PDF-1.4')
  const pdfBytes = Buffer.from('%PDF-1.4 sample pdf content')
  const pdfResult = await validateUploadFileAsync({
    size: pdfBytes.length,
    type: 'application/pdf',
    buffer: pdfBytes,
  })
  assert.equal(pdfResult, null)

  // 2. PNG (\x89PNG\r\n\x1a\n)
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])
  const pngResult = await validateUploadFileAsync({
    size: pngBytes.length,
    type: 'image/png',
    buffer: pngBytes,
  })
  assert.equal(pngResult, null)

  // 3. JPEG (FF D8 FF)
  const jpegBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
  const jpegResult = await validateUploadFileAsync({
    size: jpegBytes.length,
    type: 'image/jpeg',
    buffer: jpegBytes,
  })
  assert.equal(jpegResult, null)

  // 4. ZIP / DOCX (PK\x03\x04)
  const zipBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00])
  const zipResult = await validateUploadFileAsync({
    size: zipBytes.length,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: zipBytes,
  })
  assert.equal(zipResult, null)
})

test('magic-bytes: detects and rejects disguised executable binaries', async () => {
  // Disguised Windows PE Executable (starts with 'MZ' 0x4D 0x5A) renamed to document.pdf
  const fakePdfExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00])
  const resultExe = await validateUploadFileAsync({
    size: fakePdfExe.length,
    type: 'application/pdf',
    buffer: fakePdfExe,
  })
  assert.match(resultExe, /Security violation: Executable or dangerous content detected/)
  assert.match(resultExe, /Windows Executable/)

  // Disguised Linux ELF Binary (starts with '\x7FELF' 0x7F 0x45 0x4C 0x46)
  const fakeElf = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00])
  const resultElf = await validateUploadFileAsync({
    size: fakeElf.length,
    type: 'application/pdf',
    buffer: fakeElf,
  })
  assert.match(resultElf, /Security violation: Executable or dangerous content detected/)
  assert.match(resultElf, /Linux ELF/)

  // Disguised Shell Script (starts with '#!' 0x23 0x21)
  const fakeSh = Buffer.from('#!/bin/bash\nrm -rf /')
  const resultSh = await validateUploadFileAsync({
    size: fakeSh.length,
    type: 'application/pdf',
    buffer: fakeSh,
  })
  assert.match(resultSh, /Security violation: Executable or dangerous content detected/)
  assert.match(resultSh, /Shell Script/)
})

test('magic-bytes: rejects mismatched content types', async () => {
  // Declaring application/pdf but uploading PNG image bytes
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const mismatchResult = await validateUploadFileAsync({
    size: pngBytes.length,
    type: 'application/pdf',
    buffer: pngBytes,
  })
  assert.match(mismatchResult, /File content signature \(image\/png\) does not match declared type/)
  assert.match(mismatchResult, /Disguised files are rejected/)
})
