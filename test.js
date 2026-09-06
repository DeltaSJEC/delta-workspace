/**
 * Delta Backend — Full API Test Suite
 * Run: node test.js
 *
 * Tests every endpoint for:
 *  - Input validation (400s)
 *  - Missing / invalid auth (401s)
 *  - Role guard (403s)
 *  - Correct response shape on happy path (needs real creds)
 *
 * Sections:
 *  1. Auth routes   (/api/auth/*)
 *  2. Dashboard     (/api/dashboard)
 *  3. Attendance    (/api/attendance/*)
 *  4. Files         (/api/files/*)
 *  5. Admin         (/api/admin/*)
 *  6. Notices       (/api/notices/*)
 */

const BASE = 'http://localhost:4000'

// ─── tiny helpers ──────────────────────────────────────────────────────────

let passed = 0
let failed = 0
const results = []

function log(icon, name, detail = '') {
  const line = `  ${icon} ${name}${detail ? ' — ' + detail : ''}`
  results.push(line)
  console.log(line)
}

async function req(method, path, { body, token } = {}) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  let fetchBody
  if (body) {
    headers['Content-Type'] = 'application/json'
    fetchBody = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: fetchBody })
  let json
  try { json = await res.json() } catch { json = {} }
  return { status: res.status, json }
}

async function expect(label, fn) {
  try {
    await fn()
    passed++
    log('✅', label)
  } catch (err) {
    failed++
    log('❌', label, err.message)
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg)
}

function assertStatus(actual, expected) {
  assert(actual === expected, `expected HTTP ${expected}, got ${actual}`)
}

function assertField(obj, field) {
  assert(field in obj, `response missing field "${field}"`)
}

// ─── 0. Server health ───────────────────────────────────────────────────────

async function testHealth() {
  console.log('\n━━━ 0. Server Health ━━━')
  await expect('GET / returns 200 with status field', async () => {
    const { status, json } = await req('GET', '/')
    assertStatus(status, 200)
    assertField(json, 'status')
  })
}

// ─── 1. Auth ────────────────────────────────────────────────────────────────

async function testAuth() {
  console.log('\n━━━ 1. Auth (/api/auth/*) ━━━')

  // --- login ---
  await expect('POST /login — 400 when body is empty', async () => {
    const { status } = await req('POST', '/api/auth/login', { body: {} })
    assertStatus(status, 400)
  })

  await expect('POST /login — 400 when password is missing', async () => {
    const { status } = await req('POST', '/api/auth/login', { body: { idOrUsername: 'USR-1234' } })
    assertStatus(status, 400)
  })

  await expect('POST /login — 400 when idOrUsername is missing', async () => {
    const { status } = await req('POST', '/api/auth/login', { body: { password: 'abc' } })
    assertStatus(status, 400)
  })

  await expect('POST /login — 401 on wrong credentials', async () => {
    const { status } = await req('POST', '/api/auth/login', {
      body: { idOrUsername: 'USR-0000', password: 'wrongpassword' },
    })
    assertStatus(status, 401)
  })

  await expect('POST /login — error field present on failure', async () => {
    const { json } = await req('POST', '/api/auth/login', {
      body: { idOrUsername: 'USR-0000', password: 'wrongpassword' },
    })
    assertField(json, 'error')
  })

  // --- forgot-password ---
  await expect('POST /forgot-password — 400 when email is missing', async () => {
    const { status } = await req('POST', '/api/auth/forgot-password', { body: {} })
    assertStatus(status, 400)
  })

  await expect('POST /forgot-password — error field on missing email', async () => {
    const { json } = await req('POST', '/api/auth/forgot-password', { body: {} })
    assertField(json, 'error')
  })

  // --- reset-password ---
  await expect('POST /reset-password — 400 when access_token is missing', async () => {
    const { status } = await req('POST', '/api/auth/reset-password', {
      body: { newPassword: 'newpass123' },
    })
    assertStatus(status, 400)
  })

  await expect('POST /reset-password — 400 when newPassword is missing', async () => {
    const { status } = await req('POST', '/api/auth/reset-password', {
      body: { access_token: 'fake-token' },
    })
    assertStatus(status, 400)
  })

  await expect('POST /reset-password — 400 on invalid/fake token', async () => {
    const { status } = await req('POST', '/api/auth/reset-password', {
      body: { access_token: 'fake-invalid-token', refresh_token: 'fake', newPassword: 'newpass' },
    })
    assertStatus(status, 400)
  })

  // --- signup ---
  await expect('POST /signup — 400 when name is missing', async () => {
    const { status } = await req('POST', '/api/auth/signup', {
      body: { email: 'test@example.com', password: 'pass123' },
    })
    assertStatus(status, 400)
  })

  await expect('POST /signup — 400 when email is missing', async () => {
    const { status } = await req('POST', '/api/auth/signup', {
      body: { name: 'Test', password: 'pass123' },
    })
    assertStatus(status, 400)
  })

  await expect('POST /signup — 400 when password is missing', async () => {
    const { status } = await req('POST', '/api/auth/signup', {
      body: { name: 'Test', email: 'test@example.com' },
    })
    assertStatus(status, 400)
  })

  await expect('POST /signup — error field on validation failure', async () => {
    const { json } = await req('POST', '/api/auth/signup', { body: {} })
    assertField(json, 'error')
  })
}

// ─── 2. Dashboard ────────────────────────────────────────────────────────────

async function testDashboard() {
  console.log('\n━━━ 2. Dashboard (/api/dashboard) ━━━')

  await expect('GET / — 401 when no Authorization header', async () => {
    const { status } = await req('GET', '/api/dashboard')
    assertStatus(status, 401)
  })

  await expect('GET / — 401 when token is garbage', async () => {
    const { status } = await req('GET', '/api/dashboard', { token: 'garbage-token' })
    assertStatus(status, 401)
  })

  await expect('GET / — error field on 401', async () => {
    const { json } = await req('GET', '/api/dashboard')
    assertField(json, 'error')
  })
}

// ─── 3. Attendance ───────────────────────────────────────────────────────────

async function testAttendance() {
  console.log('\n━━━ 3. Attendance (/api/attendance/*) ━━━')

  await expect('POST /entry — 401 without auth', async () => {
    const { status } = await req('POST', '/api/attendance/entry')
    assertStatus(status, 401)
  })

  await expect('POST /exit — 401 without auth', async () => {
    const { status } = await req('POST', '/api/attendance/exit')
    assertStatus(status, 401)
  })

  await expect('GET /history — 401 without auth', async () => {
    const { status } = await req('GET', '/api/attendance/history?start=2024-01-01&end=2024-01-31')
    assertStatus(status, 401)
  })

  await expect('GET /history — 401 with garbage token', async () => {
    const { status } = await req('GET', '/api/attendance/history?start=2024-01-01&end=2024-01-31', {
      token: 'bad-token',
    })
    assertStatus(status, 401)
  })

  console.log('  ℹ️  /history missing-param 400 test requires a real token (needs real login)')
}

// ─── 4. Files ────────────────────────────────────────────────────────────────

async function testFiles() {
  console.log('\n━━━ 4. Files (/api/files/*) ━━━')

  await expect('GET / — 401 without auth', async () => {
    const { status } = await req('GET', '/api/files')
    assertStatus(status, 401)
  })

  await expect('GET /url — 401 without auth', async () => {
    const { status } = await req('GET', '/api/files/url?path=test.pdf')
    assertStatus(status, 401)
  })

  await expect('POST /upload — 401 without auth', async () => {
    const { status } = await req('POST', '/api/files/upload')
    assertStatus(status, 401)
  })

  await expect('GET / — 401 with garbage token', async () => {
    const { status } = await req('GET', '/api/files', { token: 'garbage' })
    assertStatus(status, 401)
  })

  console.log('  ℹ️  /url missing-path 400 + file upload 403 (non-head) require a real token')
}

// ─── 5. Admin ────────────────────────────────────────────────────────────────

async function testAdmin() {
  console.log('\n━━━ 5. Admin (/api/admin/*) ━━━')

  const adminPaths = [
    ['GET', '/api/admin/overview'],
    ['GET', '/api/admin/logs'],
    ['GET', '/api/admin/members'],
    ['PATCH', '/api/admin/members/fake-id/status'],
    ['GET', '/api/admin/attendance-report?start=2024-01-01&end=2024-01-31'],
  ]

  for (const [method, path] of adminPaths) {
    await expect(`${method} ${path} — 401 without auth`, async () => {
      const { status } = await req(method, path)
      assertStatus(status, 401)
    })

    await expect(`${method} ${path} — 401 with garbage token`, async () => {
      const { status } = await req(method, path, { token: 'garbage' })
      assertStatus(status, 401)
    })
  }

  console.log('  ℹ️  403 (non-head) and 200 happy-path tests require a real member + head token')
}

// ─── 6. Notices ──────────────────────────────────────────────────────────────

async function testNotices() {
  console.log('\n━━━ 6. Notices (/api/notices/*) ━━━')

  await expect('GET /latest — 401 without auth', async () => {
    const { status } = await req('GET', '/api/notices/latest')
    assertStatus(status, 401)
  })

  await expect('GET /latest — 401 with garbage token', async () => {
    const { status } = await req('GET', '/api/notices/latest', { token: 'garbage' })
    assertStatus(status, 401)
  })

  await expect('POST / — 401 without auth', async () => {
    const { status } = await req('POST', '/api/notices', { body: { message: 'hello' } })
    assertStatus(status, 401)
  })

  console.log('  ℹ️  POST / 403 (non-head) + 400 missing-message require a real token')
}

// ─── 7. CORS header check ────────────────────────────────────────────────────

async function testCORS() {
  console.log('\n━━━ 7. CORS ━━━')

  await expect('OPTIONS / returns CORS headers for allowed origin', async () => {
    const res = await fetch(`${BASE}/`, {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'GET' },
    })
    const allow = res.headers.get('access-control-allow-origin')
    assert(allow === 'http://localhost:3000', `Expected CORS origin header to be http://localhost:3000, got: ${allow}`)
  })

  await expect('GET / from disallowed origin does NOT reflect origin back', async () => {
    const res = await fetch(`${BASE}/`, {
      headers: { Origin: 'http://evil.com' },
    })
    const allow = res.headers.get('access-control-allow-origin')
    assert(allow !== 'http://evil.com', `CORS incorrectly allowed evil.com — got: ${allow}`)
  })
}

// ─── 8. Edge cases & defensive checks ───────────────────────────────────────

async function testEdgeCases() {
  console.log('\n━━━ 8. Edge Cases ━━━')

  await expect('Unknown route returns non-200 (no silent 200 on 404)', async () => {
    const { status } = await req('GET', '/api/does-not-exist')
    assert(status !== 200, `Expected non-200, got ${status}`)
  })

  await expect('Authorization header without "Bearer " prefix returns 401', async () => {
    const res = await fetch(`${BASE}/api/dashboard`, {
      headers: { Authorization: 'Token abc123' },
    })
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  await expect('Empty Bearer token returns 400 or 401', async () => {
    const res = await fetch(`${BASE}/api/dashboard`, {
      headers: { Authorization: 'Bearer ' },
    })
    assert([400, 401].includes(res.status), `Expected 400/401, got ${res.status}`)
  })

  await expect('POST /login — SQL injection-style input does not crash server', async () => {
    const { status } = await req('POST', '/api/auth/login', {
      body: { idOrUsername: "' OR 1=1; --", password: "' OR 1=1; --" },
    })
    assert([400, 401].includes(status), `Got unexpected status ${status}`)
  })

  await expect('Extremely long input does not crash server', async () => {
    const { status } = await req('POST', '/api/auth/login', {
      body: { idOrUsername: 'A'.repeat(10000), password: 'B'.repeat(10000) },
    })
    assert([400, 401, 413].includes(status), `Got unexpected status ${status}`)
  })
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('   Delta Backend — API Test Suite')
  console.log('═══════════════════════════════════════════')

  try {
    await fetch(`${BASE}/`)
  } catch {
    console.error(`\n❌ Cannot reach server at ${BASE}`)
    console.error('   Make sure the server is running: node server.js\n')
    process.exit(1)
  }

  await testHealth()
  await testAuth()
  await testDashboard()
  await testAttendance()
  await testFiles()
  await testAdmin()
  await testNotices()
  await testCORS()
  await testEdgeCases()

  const total = passed + failed
  console.log('\n═══════════════════════════════════════════')
  console.log(`   Results: ${passed}/${total} passed  |  ${failed} failed`)
  console.log('═══════════════════════════════════════════')

  if (failed > 0) {
    console.log('\n⚠️  Failed tests:')
    results.filter(r => r.includes('❌')).forEach(r => console.log(r))
  }

  console.log(`
📝 NOTE — Tests skipped (require real user credentials):
   • POST /login happy path
   • POST /signup happy path + member ID collision
   • GET  /api/dashboard with valid token
   • POST /api/attendance/entry | exit with valid token
   • GET  /api/attendance/history missing-params 400
   • GET  /api/files/url missing path 400
   • POST /api/files/upload 403 (member) + 200 (head)
   • All /api/admin/* 403 (member) + 200 (head) paths
   • POST /api/notices 400 (missing message) + 200 (head)
   • POST /api/auth/reset-password happy path
  `)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Unexpected error in test runner:', err)
  process.exit(1)
})
