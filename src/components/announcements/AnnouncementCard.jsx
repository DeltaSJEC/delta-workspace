import { DEPARTMENT_COLORS } from '../../constants/departments'
import { timeAgo } from '../../utils/dateFormat'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function AnnouncementCard({ announcement, onDeleted }) {
  const { isHead, profile } = useAuth()
  const isOwner = profile?.id === announcement.posted_by
  const targets = announcement.target_departments || []

  async function handleDelete() {
    if (!confirm('Delete this announcement?')) return
    const { error } = await supabase.from('announcements').delete().eq('id', announcement.id)
    if (error) toast.error('Failed to delete')
    else { toast.success('Announcement deleted'); onDeleted?.() }
  }

  return (
    <article className={`glass-card p-5 flex flex-col gap-3 fade-in ${announcement.pinned ? 'border-[rgba(255,200,80,0.2)]' : ''}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {announcement.pinned && (
              <span className="pinned-badge">
                <span className="material-symbols-outlined filled text-[12px]">push_pin</span>
                Pinned
              </span>
            )}
            {targets.includes('all') ? (
              <span className="badge bg-[rgba(174,198,255,0.08)] text-[#8c909f] border border-[rgba(174,198,255,0.12)]">
                All Members
              </span>
            ) : targets.map(dept => {
              const c = DEPARTMENT_COLORS[dept] || DEPARTMENT_COLORS.Mechanical
              return (
                <span key={dept} className="badge" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                  {dept}
                </span>
              )
            })}
          </div>
          <h3 className="text-base font-semibold text-[#e2e2e2]">{announcement.title}</h3>
        </div>
        {isHead && isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={`/announcement/${announcement.id}/edit`}
              className="btn-ghost w-8 h-8 p-0"
              title="Edit announcement"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="btn-ghost w-8 h-8 p-0 text-[#fa4d56] hover:bg-[rgba(218,30,40,0.1)]"
              title="Delete announcement"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-[#8c909f] leading-relaxed whitespace-pre-wrap">{announcement.body}</p>

      <div className="flex items-center gap-2 text-xs text-[#525252] pt-1 border-t border-[rgba(174,198,255,0.06)]">
        <span className="material-symbols-outlined text-[12px]">person</span>
        <span>{announcement.posted_by_user?.name || 'Head'}</span>
        <span className="text-[#333535]">·</span>
        <span>{timeAgo(announcement.created_at)}</span>
      </div>
    </article>
  )
}
