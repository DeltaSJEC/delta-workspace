const express = require('express')
const multer = require('multer')
const router = express.Router()
const { requireAuth, requireHead } = require('../middleware/auth')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

// GET /api/files?search=budget
router.get('/', requireAuth, async (req, res) => {
  const { search } = req.query
  let query = req.supabase
    .from('files')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })
  res.json({ data })
})

// GET /api/files/url?path=members/169999_report.pdf
router.get('/url', requireAuth, async (req, res) => {
  const { path } = req.query
  if (!path) return res.status(400).json({ error: 'path query param is required' })

  const { data, error } = await req.supabase.storage
    .from('delta-files')
    .createSignedUrl(path, 60 * 60) // 1 hour

  if (error) return res.status(400).json({ error: error.message })
  res.json({ url: data.signedUrl })
})

// POST /api/files/upload  (multipart/form-data)
// Fields: title, description, visibility, file
router.post('/upload', requireAuth, requireHead, upload.single('file'), async (req, res) => {
  const { title, description, visibility } = req.body
  const file = req.file

  if (!file || !title || !visibility) {
    return res.status(400).json({ error: 'file, title, and visibility are required' })
  }

  const path = `${visibility}/${Date.now()}_${file.originalname}`

  const { error: storageError } = await req.supabase.storage
    .from('delta-files')
    .upload(path, file.buffer, { contentType: file.mimetype })

  if (storageError) return res.status(400).json({ error: storageError.message })

  const { data, error } = await req.supabase
    .from('files')
    .insert({
      title,
      description,
      storage_path: path,
      file_type: file.mimetype,
      file_size: file.size,
      uploaded_by: req.user.id,
      visibility,
    })
    .select()

  if (error) return res.status(400).json({ error: error.message })

  await req.supabase.from('activity_log').insert({
    user_id: req.user.id,
    action: 'uploaded',
    target: title,
  })

  res.json({ data })
})

module.exports = router
