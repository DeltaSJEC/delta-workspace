const { supabasePublic, supabaseAdmin, getSupabaseForToken } = require('../supabaseClient')
const express = require('express')
const router = express.Router()

// POST /api/auth/login
// Body: { idOrUsername, password }
router.post('/login', async (req, res) => {
  const { idOrUsername, password } = req.body
  if (!idOrUsername || !password) {
    return res.status(400).json({ error: 'ID and password are required' })
  }

  // Resolve the member ID (e.g. USR-4920) to the email Supabase Auth needs
  const { data: email, error: lookupError } = await supabasePublic.rpc(
    'get_email_by_member_id',
    { p_member_id: idOrUsername }
  )

  if (lookupError || !email) {
    return res.status(401).json({ error: 'Invalid ID or password' })
  }

  const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password })
  if (error) {
    return res.status(401).json({ error: 'Invalid ID or password' })
  }

  const { data: profile } = await supabasePublic
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  // Return the session tokens — the frontend stores these and sends the
  // access_token back as "Authorization: Bearer <token>" on every future request.
  res.json({
    session: data.session,
    user: data.user,
    profile,
  })
})

// POST /api/auth/forgot-password
// Body: { email }
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  const { error } = await supabasePublic.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  })

  if (error) {
    return res.status(400).json({ error: 'Could not send reset link. Check the email is registered.' })
  }

  res.json({ success: true })
})

// POST /api/auth/reset-password
// Body: { access_token, refresh_token, newPassword }
// access_token/refresh_token come from the URL Supabase redirects the user to
// after they click the email link — the frontend reads them from the URL
// and sends them here along with the new password.
router.post('/reset-password', async (req, res) => {
  const { access_token, refresh_token, newPassword } = req.body
  if (!access_token || !newPassword) {
    return res.status(400).json({ error: 'Missing token or new password' })
  }

  // Use a per-request client scoped to this token so concurrent resets
  // don't clobber each other's sessions on the shared supabasePublic singleton.
  const supabase = getSupabaseForToken(access_token)

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  })
  if (sessionError) {
    return res.status(400).json({ error: 'Reset link is invalid or expired' })
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) {
    return res.status(400).json({ error: 'Could not update password' })
  }

  await supabase.auth.signOut()
  res.json({ success: true })
})

// POST /api/auth/signup
// Body: { name, email, password, department }
router.post('/signup', async (req, res) => {
  const { name, email, password, department } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' })
  }

  // 1. Create the auth user, pre-confirmed so no email verification step is needed
  const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    return res.status(400).json({ error: createError.message })
  }

  // 2. Auto-generate a member ID (e.g. USR-4821)
  const memberId = `USR-${Math.floor(1000 + Math.random() * 9000)}`

  // 3. Create their profile row
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    member_id: memberId,
    name,
    email,
    department,
    role: 'member',
  })

  if (profileError) {
    // Roll back the auth user if the profile insert failed, so we don't leave orphaned accounts
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return res.status(400).json({ error: profileError.message })
  }

  // 4. Sign them in immediately so they land in the app straight away
  const { data: sessionData, error: signInError } = await supabasePublic.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return res.status(400).json({ error: 'Account created, but auto-login failed. Please log in.' })
  }

  res.json({
    session: sessionData.session,
    user: sessionData.user,
    profile: { member_id: memberId, name, email, department, role: 'member' },
  })
})

module.exports = router
