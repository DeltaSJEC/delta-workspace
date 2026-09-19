import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── 3-D parallax star canvas (same as LoginPage) ── */
function StarCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    let w, h, stars = [], animId
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    const onMouseMove = e => {
      mouse.tx = (e.clientX - w / 2) * 0.04
      mouse.ty = (e.clientY - h / 2) * 0.04
    }
    window.addEventListener('mousemove', onMouseMove)

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
      w = c.width  = window.innerWidth
      h = c.height = window.innerHeight
      initStars()
    }

    function draw() {
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2 + mouse.x, cy = h / 2 + mouse.y
      for (const s of stars) {
        s.z -= 0.55
        s.pulse += s.speed
        if (s.z <= 0) {
          s.z = 1100
          s.x = (Math.random() - 0.5) * w * 2.5
          s.y = (Math.random() - 0.5) * h * 2.5
        }
        const k  = 270 / s.z
        const px = s.x * k + cx, py = s.y * k + cy
        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          const rad     = Math.max(0.5, s.sz * k * 1.2)
          const twinkle = 0.5 + 0.5 * Math.sin(s.pulse)
          const alpha   = Math.min(1, (1.05 - s.z / 1100)) * twinkle
          ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2)
          ctx.fillStyle = s.color; ctx.globalAlpha = alpha; ctx.fill()
          if (rad > 1.3) {
            ctx.beginPath(); ctx.arc(px, py, rad * 2.5, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(174,198,255,0.2)'
            ctx.globalAlpha = alpha * 0.3; ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize(); draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

/* ── Distribute N points along three sides of an upward triangle ── */
function trianglePoints(n, cx, cy, r) {
  const apex  = { x: cx,             y: cy - r }
  const baseR = { x: cx + r * 0.866, y: cy + r * 0.5 }
  const baseL = { x: cx - r * 0.866, y: cy + r * 0.5 }
  const pSide = Math.ceil(n / 3)
  const lerp  = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
  const pts   = []
  for (let i = 0; i < pSide; i++)      pts.push(lerp(apex,  baseR, i / (pSide - 1)))
  for (let i = 1; i < pSide; i++)      pts.push(lerp(baseR, baseL, i / (pSide - 1)))
  for (let i = 1; i < pSide - 1; i++) pts.push(lerp(baseL, apex,  i / (pSide - 1)))
  return pts.slice(0, n)
}

export default function LandingPage() {
  const navigate  = useNavigate()
  const heroRef   = useRef(null)

  // stages: 'particles' → 'converge' → 'mark' → 'tagline' → 'done'
  const [stage, setStage] = useState('particles')

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ── Particle formation + convergence ── */
  useEffect(() => {
    if (prefersReduced) { setStage('done'); return }
    const hero = heroRef.current
    if (!hero) return
    const rect  = hero.getBoundingClientRect()
    const cx    = rect.width  / 2
    const cy    = rect.height / 2 - 20
    const pts   = trianglePoints(23, cx, cy, 80)
    const nodes = []

    /* --- Phase 1: dots appear staggered --- */
    pts.forEach((pt, i) => {
      const el = document.createElement('div')
      Object.assign(el.style, {
        position:     'absolute',
        left:         `${pt.x}px`,
        top:          `${pt.y}px`,
        width:        '9px',
        height:       '9px',
        borderRadius: '50%',
        background:   '#eaf2ff',
        transform:    'translate(-50%,-50%) scale(0)',
        opacity:      '0',
        pointerEvents:'none',
        boxShadow:    '0 0 8px 3px rgba(234,242,255,0.9), 0 0 18px 6px rgba(174,198,255,0.5)',
        transition:   'transform 0.38s cubic-bezier(.2,.8,.2,1), opacity 0.38s cubic-bezier(.2,.8,.2,1), left 0.55s cubic-bezier(.4,0,.2,1), top 0.55s cubic-bezier(.4,0,.2,1)',
        willChange:   'transform, opacity, left, top',
        zIndex:       '5',
      })
      hero.appendChild(el)
      nodes.push({ el, origX: pt.x, origY: pt.y })

      setTimeout(() => {
        el.style.transform = 'translate(-50%,-50%) scale(1)'
        el.style.opacity   = '1'
      }, 80 + i * 52)
    })

    /* --- Phase 2: converge to logo center, then the logo emerges --- */
    const t_converge = setTimeout(() => {
      setStage('converge')
      nodes.forEach(({ el }) => {
        // Move every dot to the exact center of the hero (logo center)
        el.style.left      = `${cx}px`
        el.style.top       = `${cy}px`
        el.style.transform = 'translate(-50%,-50%) scale(0)'
        el.style.opacity   = '0'
        el.style.boxShadow = '0 0 24px 10px rgba(100,160,255,0.9)'
      })
    }, 1350)

    /* --- Phase 3: logo fades in while dots are still converging --- */
    const t_mark    = setTimeout(() => setStage('mark'),    1550)
    const t_tagline = setTimeout(() => setStage('tagline'), 2500)
    const t_done    = setTimeout(() => setStage('done'),    3300)

    /* Cleanup dots after convergence finishes */
    const t_clean   = setTimeout(() => nodes.forEach(({ el }) => el.parentNode?.removeChild(el)), 2000)

    return () => {
      [t_converge, t_mark, t_tagline, t_done, t_clean].forEach(clearTimeout)
      nodes.forEach(({ el }) => el.parentNode?.removeChild(el))
    }
  }, [prefersReduced])

  const markVis    = prefersReduced || ['mark', 'converge', 'tagline', 'done'].includes(stage)
  const taglineVis = prefersReduced || ['tagline', 'done'].includes(stage)
  const isDone     = prefersReduced || stage === 'done'

  // Logo starts cross-fading in during convergence
  const logoOpacity   = markVis ? 1 : 0
  const logoScale     = stage === 'converge' ? 0.82 : markVis ? 1 : 0.52

  return (
    <div style={{
      fontFamily: "'IBM Plex Sans', sans-serif",
      background: '#040814',
      minHeight: '100vh',
    }}>

      {/* ── 3-D Starfield ── */}
      <StarCanvas />

      {/* ═══ HERO — full viewport ════════════════ */}
      <section
        ref={heroRef}
        style={{
          position:        'relative',
          width:           '100%',
          minHeight:       '100vh',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          overflow:        'hidden',
          background:      'radial-gradient(ellipse 85% 60% at 50% 40%, #132048 0%, #0d1835 40%, #080e20 75%, #040814 100%)',
          zIndex:          1,
        }}
      >
        {/* Gradient overlays (same as login page for consistency) */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse at top, rgba(79,142,255,0.08), transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse at bottom left, rgba(0,45,156,0.10), transparent 55%)',
        }} />

        {/* Centred reveal stack */}
        <div style={{
          position:       'relative',
          zIndex:          2,
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          userSelect:      'none',
        }}>

          {/* ── Logo image — cross-fades in as dots converge ── */}
          <div
            onClick={() => isDone && navigate('/login')}
            title={isDone ? 'Click to log in' : ''}
            style={{
              opacity:    logoOpacity,
              transform:  `scale(${logoScale})`,
              transition: stage === 'converge'
                ? 'opacity 0.45s cubic-bezier(.2,.8,.2,1), transform 0.45s cubic-bezier(.2,.8,.2,1)'
                : 'opacity 0.65s cubic-bezier(.2,.8,.2,1), transform 0.65s cubic-bezier(.2,.8,.2,1)',
              cursor:      isDone ? 'pointer' : 'default',
              borderRadius:'12px',
              outline:     'none',
            }}
            onMouseEnter={e => {
              if (isDone) {
                e.currentTarget.style.filter    = 'drop-shadow(0 0 40px rgba(100,160,255,0.55)) drop-shadow(0 0 80px rgba(60,110,220,0.3)) brightness(1.12)'
                e.currentTarget.style.transform = 'scale(1.03)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter    = ''
              e.currentTarget.style.transform = `scale(${logoScale})`
            }}
          >
            <img
              src="/delta-logo.png"
              alt="Delta — click to log in"
              style={{
                width:        'clamp(300px, 36vw, 460px)',
                height:       'auto',
                objectFit:    'contain',
                display:      'block',
                borderRadius: '0',
                mixBlendMode: 'plus-lighter',
                filter:       'brightness(1.15) contrast(1.1)',
                WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 40%, transparent 100%)',
                maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 40%, transparent 100%)',
                transition:   'filter 0.3s ease, transform 0.3s ease',
              }}
              draggable={false}
            />
          </div>

          {/* ── Tagline ── */}
          <div style={{
            opacity:    taglineVis ? 1 : 0,
            transform:  taglineVis ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.55s cubic-bezier(.2,.8,.2,1) 0.04s, transform 0.55s cubic-bezier(.2,.8,.2,1) 0.04s',
            color:      '#5b6b8c',
            fontSize:   'clamp(9px, 1.2vw, 12px)',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            marginTop:  '24px',
            fontWeight: 400,
          }}>ENGINEERING THE FUTURE</div>

          {/* ── Click-to-login hint ── */}
          <div style={{
            opacity:    isDone ? 0.55 : 0,
            transform:  isDone ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
            color:      '#3a4d70',
            fontSize:   '11px',
            letterSpacing: '2px',
            marginTop:  '32px',
            display:    'flex',
            alignItems: 'center',
            gap:        '6px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="#3a4d70" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="10 17 15 12 10 7" stroke="#3a4d70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="15" y1="12" x2="3" y2="12" stroke="#3a4d70" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Click the logo to log in
          </div>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
        }
      `}</style>
    </div>
  )
}
