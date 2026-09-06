const express = require('express')
const router = express.Router()
const { requireAuth, requireHead } = require('../middleware/auth')

// Every route below requires the user to be logged in AND have role='head'
router.use(requireAuth, requireHead)

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  const supabase = req.supabase
  const today = new Date().toISOString().split('T')[0]

  const [{ count: totalFiles }, { count: totalMembers }, { data: todayAttendance }] =
    await Promise.all([
      supabase.from('files').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
      supabase.from('attendance').select('status').eq('date', today),
    ])

  const present = todayAttendance?.filter((a) => a.status === 'present').length ?? 0
  const absent = todayAttendance?.filter((a) => a.status === 'absent').length ?? 0

  res.json({ totalFiles, totalMembers, present, absent })
})

// GET /api/admin/logs?userIdOrName=&accessPoint=&start=&end=
router.get('/logs', async (req, res) => {
  const { userIdOrName, accessPoint, start, end } = req.query

  let query = req.supabase
    .from('access_logs')
    .select('*')
    .order('logged_at', { ascending: false })

  if (start) query = query.gte('logged_at', start)
  if (end) query = query.lte('logged_at', end)
  if (userIdOrName) query = query.ilike('name', `%${userIdOrName}%`)
  if (accessPoint && accessPoint !== 'All Checkpoints') query = query.eq('access_point', accessPoint)

  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

// GET /api/admin/members?search=
router.get('/members', async (req, res) => {
  const { search } = req.query
  let query = req.supabase.from('profiles').select('*').eq('role', 'member')
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

// PATCH /api/admin/members/:id/status   Body: { status: 'active' | 'disabled' }
router.patch('/members/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({ error: "status must be 'active' or 'disabled'" })
  }

  const { data, error } = await req.supabase
    .from('profiles')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

// GET /api/admin/attendance-report?start=&end=&search=&status=
router.get('/attendance-report', async (req, res) => {
  const { start, end, search, status } = req.query
  if (!start || !end) return res.status(400).json({ error: 'start and end dates are required' })

  let query = req.supabase
    .from('attendance')
    .select('*, profiles(name, member_id)')
    .gte('date', start)
    .lte('date', end)

  if (status && status !== 'All Statuses') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })

  const filtered = search
    ? data?.filter((r) => r.profiles?.name?.toLowerCase().includes(search.toLowerCase()))
    : data

  res.json({ data: filtered })
})

module.exports = router
