import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '../ui/Badge'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/announcements', icon: 'campaign', label: 'Announcements' },
  { to: '/profile', icon: 'account_circle', label: 'Profile' },
]

const headNavItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/announcements', icon: 'campaign', label: 'Announcements' },
  { to: '/create-project', icon: 'add_box', label: 'New Project' },
  { to: '/create-announcement', icon: 'edit_square', label: 'New Announcement' },
  { to: '/login-activity', icon: 'manage_accounts', label: 'Login Activity' },
  { to: '/profile', icon: 'account_circle', label: 'Profile' },
]

export function Sidebar() {
  const { profile, logout, isHead } = useAuth()
  const navigate = useNavigate()
  const items = isHead ? headNavItems : navItems

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="glass-sidebar hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40">
      {/* Logo / Club Name */}
      <div className="px-5 pt-6 pb-4 border-b border-[rgba(174,198,255,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src="/delta-logo.png"
              alt="Delta"
              className="w-full h-full object-contain"
              style={{
                mixBlendMode: 'plus-lighter',
                filter: 'brightness(1.15) contrast(1.1)',
                WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 40%, transparent 100%)',
                maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 40%, transparent 100%)'
              }}
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#e2e2e2] leading-tight">Delta SJEC</h1>
            <p className="text-xs text-[#525252]">Virtual Workspace</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {profile && (
        <div className="px-4 py-4 border-b border-[rgba(174,198,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(174,198,255,0.15)] flex items-center justify-center shrink-0">
              <span className="text-[#aec6ff] text-sm font-bold uppercase">
                {profile.name?.[0] || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e2e2e2] truncate">{profile.name}</p>
              <p className="text-xs text-[#525252] truncate">{profile.department}</p>
            </div>
            <Badge variant={isHead ? 'head' : 'member'}>
              {isHead ? 'Head' : 'Member'}
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="flex flex-col gap-0.5 px-2">
          {items.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `nav-item rounded-sm ${isActive ? 'active' : ''}`
                }
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[rgba(174,198,255,0.08)]">
        <button
          onClick={handleLogout}
          className="nav-item w-full rounded-sm text-[#fa4d56] hover:bg-[rgba(218,30,40,0.08)]"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
