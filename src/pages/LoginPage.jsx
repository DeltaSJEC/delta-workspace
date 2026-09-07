import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'
import toast from 'react-hot-toast'

function StarCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    let w, h, stars = [], animId
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    window.addEventListener('mousemove', e => {
      mouse.tx = (e.clientX - w / 2) * 0.04
      mouse.ty = (e.clientY - h / 2) * 0.04
    })

    function initStars() {
      stars = []
      const num = Math.max(220, Math.floor((w * h) / 2800))
      for (let i = 0; i < num; i++) {
        stars.push({
          x: (Math.random() - 0.5) * w * 2.5,
          y: (Math.random() - 0.5) * h * 2.5,
          z: Math.random() * 1100 + 1,
          sz: Math.random() * 1.5 + 0.4,
          color: Math.random() > 0.8 ? '#aec6ff' : Math.random() > 0.92 ? '#7da6ff' : '#ffffff',
          pulse: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.04 + 0.02,
        })
      }
    }

    function resize() {
      w = c.width = window.innerWidth
      h = c.height = window.innerHeight
      initStars()
    }

    function draw() {
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2 + mouse.x, cy = h / 2 + mouse.y
      for (const s of stars) {
        s.z -= 0.65
        s.pulse += s.speed
        if (s.z <= 0) { s.z = 1100; s.x = (Math.random() - 0.5) * w * 2.5; s.y = (Math.random() - 0.5) * h * 2.5 }
        const k = 270 / s.z
        const px = s.x * k + cx, py = s.y * k + cy
        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          const rad = Math.max(0.5, s.sz * k * 1.2)
          const twinkle = 0.5 + 0.5 * Math.sin(s.pulse)
          const alpha = Math.min(1, (1.05 - s.z / 1100)) * twinkle
          ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2)
          ctx.fillStyle = s.color; ctx.globalAlpha = alpha; ctx.fill()
          if (rad > 1.3) {
            ctx.beginPath(); ctx.arc(px, py, rad * 2.5, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(174,198,255,0.2)'; ctx.globalAlpha = alpha * 0.3; ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize(); draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} id="star-canvas" />
}

export default function LoginPage() {
  const { login, session, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (!loading && session) navigate(from, { replace: true })
  }, [session, loading, navigate, from])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden space-bg">
      {/* Animated starfield */}
      <StarCanvas />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,142,255,0.10),transparent_65%)] pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,45,156,0.12),transparent_55%)] pointer-events-none z-[1]" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-card p-8 fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#0f62fe] flex items-center justify-center mb-4 shadow-[0_0_32px_rgba(15,98,254,0.4)]">
              <span className="material-symbols-outlined filled text-white" style={{ fontSize: 28 }}>bolt</span>
            </div>
            <h1 className="text-2xl font-bold text-[#e2e2e2] tracking-tight">Delta SJEC</h1>
            <p className="text-sm text-[#525252] mt-1">Virtual Workspace Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="carbon-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="carbon-input"
                placeholder="you@delta.sjec.ac.in"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="carbon-label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="carbon-input pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#aec6ff] transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="btn-primary w-full mt-2"
            >
              {submitting ? <Spinner size="sm" /> : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#424754] mt-6">
            No account? Contact a club head to get access.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-[#333535] mt-4">
          Delta Club SJEC &nbsp;·&nbsp; Private Portal
        </p>
      </div>
    </div>
  )
}
