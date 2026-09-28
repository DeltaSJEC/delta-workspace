/**
 * Shared navigation configuration for Sidebar and TopBar.
 * Single source of truth to avoid duplication.
 */

export const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/announcements', icon: 'campaign', label: 'Announcements' },
  { to: '/profile', icon: 'account_circle', label: 'Profile' },
]

export const HEAD_NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/announcements', icon: 'campaign', label: 'Announcements' },
  { to: '/create-project', icon: 'add_box', label: 'New Project' },
  { to: '/create-announcement', icon: 'edit_square', label: 'New Announcement' },
  { to: '/login-activity', icon: 'manage_accounts', label: 'Login Activity' },
  { to: '/profile', icon: 'account_circle', label: 'Profile' },
]
