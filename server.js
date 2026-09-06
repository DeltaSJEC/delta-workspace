require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const dashboardRoutes = require('./routes/dashboard')
const attendanceRoutes = require('./routes/attendance')
const filesRoutes = require('./routes/files')
const adminRoutes = require('./routes/admin')
const noticesRoutes = require('./routes/notices')

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/files', filesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notices', noticesRoutes)

app.get('/', (req, res) => res.json({ status: 'Delta API is running' }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Delta API listening on http://localhost:${PORT}`))
