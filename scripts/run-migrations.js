#!/usr/bin/env node
/**
 * Delta SJEC Virtual Workspace — Migration Runner
 * Executes SQL migrations against Supabase via the pg REST SQL endpoint.
 *
 * Usage:  node scripts/run-migrations.js
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env\n')
  process.exit(1)
}

// Extract project ref: https://xyzxyz.supabase.co → xyzxyz
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0]

async function executeSQL(sql) {
  // Use Supabase's built-in SQL-over-REST via the pg endpoint
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ query: sql }),
    }
  )

  if (response.ok) return { ok: true }

  // Fallback: try the pg/query endpoint
  const response2 = await fetch(
    `${SUPABASE_URL}/pg/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  )

  if (response2.ok) return { ok: true }

  const errText = await response2.text().catch(() => response.statusText)
  return { ok: false, error: errText }
}

async function executeViaHttpBatch(sql) {
  // Split on statement boundaries and run via PostgREST's SQL passthrough
  // PostgREST doesn't support raw SQL — use Supabase SQL API directly
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // This endpoint requires a Supabase PAT — not available here.
      // Falling back to direct DB connection approach.
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  const text = await response.text()
  if (response.ok) return { ok: true }
  return { ok: false, error: text.slice(0, 500) }
}

async function main() {
  console.log('\n🚀  Delta SJEC — Migration Runner')
  console.log(`📡  Project: ${projectRef}.supabase.co\n`)

  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log(`📁  Found ${files.length} migration file(s)\n`)

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')
    process.stdout.write(`  ▶  ${file} ... `)

    // Try primary endpoint
    let result = await executeSQL(sql)
    if (!result.ok) {
      // Try management API
      result = await executeViaHttpBatch(sql)
    }

    if (result.ok) {
      console.log('✅')
    } else {
      console.log(`❌\n     ${result.error?.slice(0, 300)}\n`)
      console.log('⚠️   Stopping. Run remaining migrations manually in the SQL Editor.\n')
      process.exit(1)
    }
  }

  console.log('\n✨  All migrations applied successfully!\n')
}

main().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})
