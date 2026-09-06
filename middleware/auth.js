const { getSupabaseForToken } = require('../supabaseClient')

// Verifies the Authorization: Bearer <token> header on every protected route.
// Attaches req.user (the Supabase user) and req.supabase (a client scoped to
// that user's token, so RLS policies apply correctly).
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = authHeader.split(' ')[1]
  const supabase = getSupabaseForToken(token)

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  req.user = data.user
  req.supabase = supabase
  next()
}

// Use AFTER requireAuth on routes only the Head role should access.
async function requireHead(req, res, next) {
  const { data: profile, error } = await req.supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single()

  if (error || profile?.role !== 'head') {
    return res.status(403).json({ error: 'Head access only' })
  }

  next()
}

module.exports = { requireAuth, requireHead }
