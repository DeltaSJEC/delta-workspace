import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMemberSubmissionPath, buildStoragePath } from '../src/utils/fileHelpers.js'
import { MAX_UPLOAD_SIZE_BYTES, validateUploadFile } from '../src/constants/uploads.js'

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
