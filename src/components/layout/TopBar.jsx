import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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

export function TopBar({ pageTitle }) {
  const { isHead, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const items = isHead ? headNavItems : navItems

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="top-bar md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="btn-ghost w-9 h-9 p-0"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
        <span className="text-[#e2e2e2] font-semibold text-sm flex-1">{pageTitle}</span>
        <div className="w-8 h-8 rounded-full bg-[rgba(174,198,255,0.15)] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#aec6ff] text-[16px]">person</span>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="glass-sidebar absolute left-0 top-0 h-full w-72 flex flex-col py-6 px-2">
            <div className="flex items-center gap-3 px-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm p-0.5">
                <img
                  src="/delta-logo.jpeg"
                  alt="Delta"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-[#e2e2e2] text-sm">Delta SJEC Workspace</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="ml-auto btn-ghost w-8 h-8 p-0"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <nav className="flex-1">
              <ul className="flex flex-col gap-0.5">
                {items.map(({ to, icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
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
            <button
              onClick={handleLogout}
              className="nav-item w-full text-[#fa4d56] hover:bg-[rgba(218,30,40,0.08)] rounded-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              Sign Out
            </button>
          </aside>
        </div>
      )}
    </>
  )
}
