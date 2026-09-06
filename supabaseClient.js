const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Public client — used only for things that happen BEFORE a user is logged in
// (e.g. the ID -> email lookup, sign in, forgot password).
const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Per-request client — scoped to the logged-in user's access token.
// This is what makes your RLS policies actually apply per-user instead of
// bypassing them. Always use this (via req.supabase from the auth middleware)
// for anything a logged-in user does.
function getSupabaseForToken(accessToken) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  })
}

const { createClient: createAdminClient } = require('@supabase/supabase-js')

// Elevated client — bypasses RLS and can auto-confirm emails.
// Server-side only. NEVER send this key or client to the frontend.
const supabaseAdmin = createAdminClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = { supabasePublic, getSupabaseForToken, supabaseAdmin }