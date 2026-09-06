const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')

// GET /api/dashboard
router.get('/', requireAuth, async (req, res) => {
  const supabase = req.supabase
  const userId = req.user.id
  const today = new Date().toISOString().split('T')[0]

  const [{ data: todayAttendance }, { data: recentActivity }, { data: recentFiles }] =
    await Promise.all([
      supabase.from('attendance').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
      supabase.from('activity_log').select('*, profiles(name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('files').select('*').order('created_at', { ascending: false }).limit(3),
    ])

  res.json({ todayAttendance, recentActivity, recentFiles })
})

module.exports = router
