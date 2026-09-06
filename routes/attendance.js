const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')

// POST /api/attendance/entry
router.post('/entry', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('attendance')
    .upsert({
      user_id: req.user.id,
      date: new Date().toISOString().split('T')[0],
      time_in: new Date().toISOString(),
    })
    .select()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

// POST /api/attendance/exit
router.post('/exit', requireAuth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await req.supabase
    .from('attendance')
    .update({ time_out: new Date().toISOString() })
    .eq('user_id', req.user.id)
    .eq('date', today)
    .select()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

// GET /api/attendance/history?start=2023-10-01&end=2023-10-31
router.get('/history', requireAuth, async (req, res) => {
  const { start, end } = req.query
  if (!start || !end) return res.status(400).json({ error: 'start and end dates are required' })

  const { data, error } = await req.supabase
    .from('attendance')
    .select('*')
    .eq('user_id', req.user.id)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

module.exports = router
