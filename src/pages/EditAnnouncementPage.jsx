import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { DepartmentSelector } from '../components/projects/DepartmentSelector'
import { Spinner } from '../components/ui/Spinner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function EditAnnouncementPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [targetDepts, setTargetDepts] = useState(['all'])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch and pre-fill the announcement
  useEffect(() => {
    if (!profile) return

    async function fetchAnnouncement() {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        toast.error('Announcement not found')
        navigate('/announcements', { replace: true })
        return
      }

      // Only the posting head may edit it
      if (data.posted_by !== profile.id) {
        toast.error('You can only edit your own announcements')
        navigate('/announcements', { replace: true })
        return
      }

      setTitle(data.title)
      setBody(data.body)
      setPinned(data.pinned)
      setTargetDepts(data.target_departments?.length ? data.target_departments : ['all'])
      setLoading(false)
    }

    fetchAnnouncement()
  }, [id, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required')
      return
    }
    if (targetDepts.length === 0) {
      toast.error('Select at least one department target')
      return
    }
    setSubmitting(true)

    const { error } = await supabase
      .from('announcements')
      .update({
        title: title.trim(),
        body: body.trim(),
        pinned,
        target_departments: targetDepts,
      })
      .eq('id', id)

    setSubmitting(false)

    if (error) {
      toast.error(error.message || 'Failed to update announcement')
    } else {
      toast.success('Announcement updated!')
      navigate('/announcements')
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppShell pageTitle="Edit Announcement">
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </AppShell>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AppShell pageTitle="Edit Announcement">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#e2e2e2]">Edit Announcement</h2>
          <p className="text-sm text-[#525252] mt-1">Update your announcement</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Content ── */}
          <div className="glass-card p-6 flex flex-col gap-5">
            <div>
              <label className="carbon-label" htmlFor="ann-title">Title *</label>
              <input
                id="ann-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="carbon-input"
                placeholder="e.g. Meeting rescheduled to Friday"
                maxLength={160}
                required
              />
            </div>

            <div>
              <label className="carbon-label" htmlFor="ann-body">Body *</label>
              <textarea
                id="ann-body"
                value={body}
                onChange={e => setBody(e.target.value)}
                className="carbon-textarea"
                placeholder="Write your announcement here..."
                rows={6}
                maxLength={5000}
                required
              />
              <p className="text-xs text-[#424754] mt-1 text-right">
                {body.length} / 5000
              </p>
            </div>

            {/* Pin toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setPinned(v => !v)}
                className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${
                  pinned ? 'bg-[#ffc850]' : 'bg-[#333535]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  pinned ? 'left-5' : 'left-1'
                }`} />
              </div>
              <div>
                <span className="text-sm text-[#c2c6d6] font-medium">Pin this announcement</span>
                <p className="text-xs text-[#525252]">Pinned announcements appear at the top</p>
              </div>
              {pinned && (
                <span className="pinned-badge ml-auto">
                  <span className="material-symbols-outlined filled text-[12px]">push_pin</span>
                  Pinned
                </span>
              )}
            </label>
          </div>

          {/* ── Department targeting ── */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider mb-4">
              Target Audience
            </h3>
            <DepartmentSelector selected={targetDepts} onChange={setTargetDepts} />
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate('/announcements')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Spinner size="sm" /> : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
