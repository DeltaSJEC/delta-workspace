import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format a date string to a human-readable date
 * @param {string|Date} date
 * @returns {string} e.g. "Sep 7, 2026"
 */
export function formatDate(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

/**
 * Format a date string to date + time
 * @param {string|Date} date
 * @returns {string} e.g. "Sep 7, 2026, 2:30 PM"
 */
export function formatDateTime(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy, h:mm a')
}

/**
 * Relative time from now
 * @param {string|Date} date
 * @returns {string} e.g. "2 hours ago"
 */
export function timeAgo(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Format duration in seconds to human readable
 * @param {number} seconds
 * @returns {string} e.g. "2h 15m 30s"
 */
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return 'Active'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const parts = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0 || parts.length === 0) parts.push(`${s}s`)
  return parts.join(' ')
}
