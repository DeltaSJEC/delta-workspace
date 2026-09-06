const express = require('express')
const router = express.Router()
const { requireAuth, requireHead } = require('../middleware/auth')

// GET /api/notices/latest
router.get('/latest', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('notices')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

// POST /api/notices   Body: { message, audience, priority }
router.post('/', requireAuth, requireHead, async (req, res) => {
  const { message, audience, priority } = req.body
  if (!message) return res.status(400).json({ error: 'message is required' })

  const { data, error } = await req.supabase
    .from('notices')
    .insert({ message, audience, priority, posted_by: req.user.id })
    .select()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

module.exports = router
