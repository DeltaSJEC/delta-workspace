#!/usr/bin/env node
/**
 * Delta SJEC Virtual Workspace — User Seeder
 * Creates test user accounts in Supabase Auth using the admin API.
 * The on_auth_user_created trigger will auto-populate public.users.
 *
 * Usage:
 *   node scripts/seed-users.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env\n')
  process.exit(1)
}

// Admin client (service role — bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const SEED_USERS = [
  {
    email: 'test_head@delta.sjec.ac.in',
    password: 'Delta@2026',
    name: 'Test Head',
    role: 'head',
    department: 'Computing',
    is_club_wide: true,
  },
  {
    email: 'test_member@delta.sjec.ac.in',
    password: 'Delta@2026',
    name: 'Test Member',
    role: 'member',
    department: 'Mechanical',
    is_club_wide: false,
  },
]

async function main() {
  console.log('\n🌱  Delta SJEC — User Seeder')
  console.log(`📡  Supabase: ${SUPABASE_URL}\n`)

  for (const u of SEED_USERS) {
    process.stdout.write(`  Creating ${u.name} (${u.email})... `)
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        name: u.name,
        role: u.role,
        department: u.department,
        is_club_wide: u.is_club_wide,
      },
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log('⏭️  already exists')
      } else {
        console.log(`❌  ${error.message}`)
      }
    } else {
      console.log(`✅  (${u.role})`)
    }
  }

  console.log('\n✨  Seeding complete!')
  console.log('📋  Test credentials: email above, password: Delta@2026\n')
}

main().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})
