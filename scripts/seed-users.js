#!/usr/bin/env node
/**
 * Delta SJEC Virtual Workspace — User Seeder
 * Creates test and club member accounts in Supabase Auth using the admin API.
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
  auth: { autoRefreshToken: false, persistSession: false },
})

const SEED_USERS = [
  // ── HEADS ───────────────────────────────────────────────────
  {
    login_id: 'DEL0126528',
    name: 'Shawn Vas',
    email: 'del0126528@delta.sjec.ac.in',
    password: 'ShawnMedia@26',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Media Head',
    role: 'head',
    is_club_wide: true,
  },
  {
    login_id: 'DEL0326419',
    name: 'Nikhitha HL',
    email: 'del0326419@delta.sjec.ac.in',
    password: 'NikhithaVP@26',
    branch: 'ECE',
    department: 'ECE',
    role_title: 'Vice president of ECE',
    role: 'head',
    is_club_wide: true,
  },
  {
    login_id: 'DEL0326936',
    name: 'Jawahar Lawrence Rodrigues',
    email: 'del0326936@delta.sjec.ac.in',
    password: 'JawaharPresident@26',
    branch: 'ECE',
    department: 'ECE',
    role_title: 'President',
    role: 'head',
    is_club_wide: true,
  },
  {
    login_id: 'DEL0426731',
    name: 'Norman Daran Dsouza',
    email: 'del0426731@delta.sjec.ac.in',
    password: 'NormanFounder@26',
    branch: 'MECH',
    department: 'MECH',
    role_title: 'Founder & VP, Mechanical Engineering',
    role: 'head',
    is_club_wide: true,
  },
  {
    login_id: 'DEL0126473',
    name: 'Anjali R Rai',
    email: 'del0126473@delta.sjec.ac.in',
    password: 'AnjaliManage@26',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Management Head',
    role: 'head',
    is_club_wide: true,
  },
  {
    login_id: 'DEL0126839',
    name: 'Melrick Prith Dsouza',
    email: 'del0126839@delta.sjec.ac.in',
    password: 'MelrickVP@26',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Vice president of CSE',
    role: 'head',
    is_club_wide: true,
  },

  // ── MEMBERS ─────────────────────────────────────────────────
  {
    login_id: 'DEL0126847',
    name: 'Anish Dsouza',
    email: 'del0126847@delta.sjec.ac.in',
    password: 'Anish@847',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Computing Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    login_id: 'DEL0126193',
    name: 'Sanmith S Joseph',
    email: 'del0126193@delta.sjec.ac.in',
    password: 'Samith@193',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Computing Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    login_id: 'DEL0126385',
    name: 'Melria Smitha Gonsalves',
    email: 'del0126385@delta.sjec.ac.in',
    password: 'Melria@385',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Computing Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    login_id: 'DEL0326164',
    name: 'Vanyashree',
    email: 'del0326164@delta.sjec.ac.in',
    password: 'Vanya@164',
    branch: 'ECE',
    department: 'ECE',
    role_title: 'Electronics Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    login_id: 'DEL0226592',
    name: 'Anika Chrisal Patrao',
    email: 'del0226592@delta.sjec.ac.in',
    password: 'Anika@592',
    branch: 'CSE',
    department: 'CSE',
    role_title: 'Digital Systems Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    login_id: 'DEL0226148',
    name: 'Ananya Amarnath',
    email: 'del0226148@delta.sjec.ac.in',
    password: 'Ananya@148',
    branch: 'CSE',
    department: 'CSE',
    role_title: 'Digital Systems Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    login_id: 'DEL0226916',
    name: 'Darren Merce Aranha',
    email: 'del0226916@delta.sjec.ac.in',
    password: 'Darren@916',
    branch: 'CSE',
    department: 'CSE',
    role_title: 'Creative Editor',
    role: 'member',
    is_club_wide: false,
  },

  // ── Existing Test Accounts (Fallback) ─────────────────────────
  {
    login_id: 'test_head',
    name: 'Test Head',
    email: 'test_head@delta.sjec.ac.in',
    password: 'Delta@2026',
    role: 'head',
    department: 'Computing',
    is_club_wide: true,
  },
  {
    login_id: 'test_member',
    name: 'Test Member',
    email: 'test_member@delta.sjec.ac.in',
    password: 'Delta@2026',
    role: 'member',
    department: 'Mechanical',
    is_club_wide: false,
  },
]

async function main() {
  console.log('\n🌱  Delta SJEC — User Seeder')
  console.log(`📡  Supabase: ${SUPABASE_URL}\n`)

  for (const u of SEED_USERS) {
    process.stdout.write(`  Processing ${u.name} [${u.login_id}] (${u.role})... `)

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        name: u.name,
        login_id: u.login_id,
        role: u.role,
        role_title: u.role_title || u.role,
        branch: u.branch || '',
        department: u.department,
        is_club_wide: u.is_club_wide,
      },
    })

    let userId = data?.user?.id

    if (error) {
      if (error.message.includes('already been registered')) {
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
        if (usersError) throw usersError
        userId = users.users.find(existingUser => existingUser.email === u.email)?.id

        if (userId) {
          // Update password and metadata for existing user
          await supabase.auth.admin.updateUserById(userId, {
            password: u.password,
            user_metadata: {
              name: u.name,
              login_id: u.login_id,
              role: u.role,
              role_title: u.role_title || u.role,
              branch: u.branch || '',
              department: u.department,
              is_club_wide: u.is_club_wide,
            },
          })
          console.log(`synced (updated password/role)`)
        }
      } else {
        console.log(`❌  ${error.message}`)
        continue
      }
    } else {
      console.log(`✅ created`)
    }

    if (!userId) {
      console.error(`Could not locate user ID for ${u.email}`)
      continue
    }

    // Ensure public.users row exists and has exact role & department
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        is_club_wide: u.is_club_wide,
      })

    if (profileError) {
      console.error(`   ⚠️ Failed to update public.users: ${profileError.message}`)
    }
  }

  console.log('\n✨  Seeding complete!')
  console.log('📋  All accounts have been created/updated with their Login IDs and passwords.\n')
}

main().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})
