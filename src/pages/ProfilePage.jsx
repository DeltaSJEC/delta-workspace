import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatDuration, timeAgo } from '../utils/dateFormat'
import { usePerformance } from '../hooks/usePerformance'
import { useUserProjects } from '../hooks/useUserProjects'
import { YearlyHeatmap } from '../components/ui/YearlyHeatmap'
import { DEPARTMENT_COLORS } from '../constants/departments'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, user, changePassword } = useAuth()
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [showPwForm, setShowPwForm] = useState(false)

  const { stats, loading: statsLoading, fetchPerformance } = usePerformance()
  const { projects, loading: projectsLoading, fetchUserProjects } = useUserProjects()

  useEffect(() => {
    if (user?.id) {
      fetchPerformance(user.id)
      fetchUserProjects(user.id)
    }
  }, [user?.id, fetchPerformance, fetchUserProjects])

  async function handleChangePassword(e) {
    e.preventDefault()
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    setChangingPw(true)
    try {
      await changePassword(newPw)
      toast.success('Password updated successfully')
      setNewPw(''); setConfirmPw('')
      setShowPwForm(false)
    } catch (err) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setChangingPw(false)
    }
  }

  if (!profile) return (
    <AppShell pageTitle="Profile">
      <div className="flex justify-center py-12"><Spinner size="lg" /></div>
    </AppShell>
  )

  return (
    <AppShell pageTitle="Profile">
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-[#e2e2e2] mb-6">My Profile</h2>

        {/* ── Profile card ── */}
        <div className="glass-card p-6 mb-5">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[rgba(174,198,255,0.08)]">
            <div className="w-14 h-14 rounded-full bg-[rgba(174,198,255,0.15)] flex items-center justify-center shrink-0">
              <span className="text-[#aec6ff] text-2xl font-bold uppercase">{profile.name?.[0] || '?'}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#e2e2e2]">{profile.name}</h3>
              <p className="text-sm text-[#525252]">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile.role === 'head' ? 'head' : 'member'}>
                  {profile.role === 'head' ? 'Head' : 'Member'}
                </Badge>
                {profile.is_club_wide && (
                  <Badge variant="default">Club-wide</Badge>
                )}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            {[
              { label: 'Department', value: profile.department },
              { label: 'Role', value: profile.role === 'head' ? 'Head' : 'Member' },
              { label: 'Member since', value: formatDate(profile.created_at) },
              { label: 'Access level', value: profile.is_club_wide ? 'Club-wide' : 'Department' },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-[#424754] mb-1">{label}</dt>
                <dd className="text-sm text-[#c2c6d6] font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Performance ── */}
        <div className="glass-card p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#8c909f]" style={{ fontSize: '17px' }}>bar_chart</span>
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider">Performance</h3>
          </div>

          {/* ── Workspace Time stats ── */}
          {statsLoading ? (
            <div className="flex justify-center py-6"><Spinner size="md" /></div>
          ) : stats ? (
            <div className="flex flex-col gap-4 mb-6">
              {/* Hero stat */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(15,98,254,0.18) 0%, rgba(174,198,255,0.07) 100%)',
                border: '1px solid rgba(174,198,255,0.18)',
                borderRadius: '4px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'rgba(15,98,254,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span className="material-symbols-outlined text-[#aec6ff]" style={{ fontSize: '22px' }}>schedule</span>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#8c909f', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Total Workspace Time
                  </p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#aec6ff', lineHeight: 1 }}>
                    {formatDuration(stats.totalSeconds)}
                  </p>
                  {stats.lastSeen && (
                    <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px' }}>
                      Last active {timeAgo(stats.lastSeen)}
                    </p>
                  )}
                </div>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: 'login', label: 'Total Sessions', value: stats.totalSessions, color: '#c2c6d6' },
                  { icon: 'avg_pace', label: 'Avg. Session', value: formatDuration(stats.avgSeconds), color: '#c2c6d6' },
                  { icon: 'upload_file', label: 'Submissions', value: projectsLoading ? '…' : projects.length, color: projects.length > 0 ? '#aec6ff' : '#c2c6d6' },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} style={{
                    background: 'rgba(174,198,255,0.04)',
                    border: '1px solid rgba(174,198,255,0.09)',
                    borderRadius: '4px',
                    padding: '14px 12px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}>
                    <span className="material-symbols-outlined text-[#424754]" style={{ fontSize: '16px' }}>{icon}</span>
                    <p style={{ fontSize: '10px', color: '#525252', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* ── Working Streak card ── */}
              <div style={{
                background: stats.currentStreak > 0
                  ? 'linear-gradient(135deg, rgba(255,120,30,0.14) 0%, rgba(255,180,30,0.07) 100%)'
                  : 'rgba(174,198,255,0.03)',
                border: stats.currentStreak > 0
                  ? '1px solid rgba(255,140,30,0.30)'
                  : '1px solid rgba(174,198,255,0.09)',
                borderRadius: '4px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}>
                {/* Left: current streak */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    background: stats.currentStreak > 0
                      ? 'rgba(255,140,30,0.18)'
                      : 'rgba(174,198,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                  }}>
                    {stats.currentStreak > 0 ? '🔥' : '💤'}
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8c909f', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Current Streak
                    </p>
                    <p style={{
                      fontSize: '28px', fontWeight: 800, lineHeight: 1,
                      color: stats.currentStreak > 0 ? '#ff8c1a' : '#424754',
                    }}>
                      {stats.currentStreak}
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#8c909f', marginLeft: '5px' }}>
                        day{stats.currentStreak !== 1 ? 's' : ''}
                      </span>
                    </p>
                    <p style={{ fontSize: '11px', color: '#525252', marginTop: '3px' }}>
                      {stats.currentStreak === 0
                        ? 'Log in today to start a streak!'
                        : stats.currentStreak === 1
                          ? 'Keep it up — come back tomorrow!'
                          : `${stats.currentStreak} consecutive days active`}
                    </p>
                  </div>
                </div>

                {/* Right: longest streak */}
                <div style={{
                  textAlign: 'right', flexShrink: 0,
                  paddingLeft: '16px',
                  borderLeft: '1px solid rgba(174,198,255,0.08)',
                }}>
                  <p style={{ fontSize: '10px', color: '#525252', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>
                    Best
                  </p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#c2c6d6', lineHeight: 1 }}>
                    {stats.longestStreak}
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#525252', marginLeft: '4px' }}>
                      day{stats.longestStreak !== 1 ? 's' : ''}
                    </span>
                  </p>
                  <p style={{ fontSize: '10px', color: '#424754', marginTop: '3px' }}>all-time</p>
                </div>
              </div>

              {/* Yearly contribution heatmap */}
              <div style={{
                background: 'rgba(174,198,255,0.02)',
                border: '1px solid rgba(174,198,255,0.09)',
                borderRadius: '4px',
                padding: '16px',
              }}>
                <YearlyHeatmap
                  dailyMap={stats.dailyMap || {}}
                  yearTotal={stats.yearSessions || 0}
                  submissionMap={Object.fromEntries(
                    projects.map(p => [
                      p.submittedAt ? new Date(p.submittedAt).toISOString().slice(0, 10) : '',
                      1,
                    ]).filter(([k]) => k)
                  )}
                />
              </div>

            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#525252', textAlign: 'center', padding: '16px 0 24px' }}>
              No session data available yet.
            </p>
          )}

          {/* ── Divider ── */}
          <div style={{ height: '1px', background: 'rgba(174,198,255,0.08)', margin: '0 0 20px' }} />

          {/* ── Previous Work Submitted ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8c909f]" style={{ fontSize: '16px' }}>folder_open</span>
                <h4 className="text-xs font-semibold text-[#8c909f] uppercase tracking-wider">Previous Work Submitted</h4>
              </div>
              {projects.length > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: '#aec6ff',
                  background: 'rgba(174,198,255,0.1)', borderRadius: '10px',
                  padding: '2px 8px',
                }}>
                  {projects.length}
                </span>
              )}
            </div>

            {projectsLoading ? (
              <div className="flex justify-center py-5"><Spinner size="sm" /></div>
            ) : projects.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '24px 16px', background: 'rgba(174,198,255,0.03)',
                border: '1px dashed rgba(174,198,255,0.1)', borderRadius: '4px',
              }}>
                <span className="material-symbols-outlined text-[#333535]" style={{ fontSize: '32px' }}>inventory_2</span>
                <p style={{ fontSize: '13px', color: '#424754', textAlign: 'center' }}>
                  No projects submitted yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map(proj => {
                  const targets = proj.target_departments || []
                  const likeCount = proj.reactions?.filter(r => r.type === 'like').length || 0
                  const commentCount = proj.comments?.length || 0

                  return (
                    <Link
                      key={proj.submissionId}
                      to={`/project/${proj.id}`}
                      style={{
                        display: 'block',
                        background: 'rgba(174,198,255,0.03)',
                        border: '1px solid rgba(174,198,255,0.09)',
                        borderRadius: '4px',
                        padding: '14px',
                        textDecoration: 'none',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(174,198,255,0.07)'
                        e.currentTarget.style.borderColor = 'rgba(174,198,255,0.2)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(174,198,255,0.03)'
                        e.currentTarget.style.borderColor = 'rgba(174,198,255,0.09)'
                      }}
                    >
                      {/* Department chips */}
                      {targets.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                          {targets.includes('all') ? (
                            <span className="badge" style={{
                              background: 'rgba(174,198,255,0.1)', border: '1px solid rgba(174,198,255,0.2)', color: '#aec6ff',
                              fontSize: '10px', padding: '1px 6px',
                            }}>All Members</span>
                          ) : targets.map(dept => {
                            const c = DEPARTMENT_COLORS[dept] || DEPARTMENT_COLORS.Mechanical
                            return (
                              <span key={dept} className="badge" style={{
                                background: c.bg, border: `1px solid ${c.border}`, color: c.text,
                                fontSize: '10px', padding: '1px 6px',
                              }}>{dept}</span>
                            )
                          })}
                        </div>
                      )}

                      {/* Project Title */}
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e2e2', marginBottom: '3px', lineHeight: 1.3 }}>
                        {proj.title}
                      </p>

                      {/* Submitted file info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                        <span className="material-symbols-outlined text-[#525252]" style={{ fontSize: '12px' }}>attach_file</span>
                        <span style={{ fontSize: '11px', color: '#525252', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {proj.filename}
                        </span>
                        {proj.note && (
                          <span style={{ fontSize: '11px', color: '#424754', fontStyle: 'italic', marginLeft: '4px' }}>— "{proj.note}"</span>
                        )}
                      </div>

                      {/* Footer meta */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: '#424754' }}>
                          Submitted {timeAgo(proj.submittedAt)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#525252' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>chat_bubble</span>
                            {commentCount}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: likeCount > 0 ? '#aec6ff' : '#525252' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>thumb_up</span>
                            {likeCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Security ── */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider">Security</h3>
          </div>

          {!showPwForm ? (
            <button onClick={() => setShowPwForm(true)} className="btn-secondary w-full">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="carbon-label" htmlFor="new-pw">New Password</label>
                <input id="new-pw" type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  className="carbon-input" placeholder="Min. 8 characters" minLength={8} required />
              </div>
              <div>
                <label className="carbon-label" htmlFor="confirm-pw">Confirm Password</label>
                <input id="confirm-pw" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  className="carbon-input" placeholder="Repeat new password" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPwForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={changingPw} className="btn-primary flex-1">
                  {changingPw ? <Spinner size="sm" /> : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  )
}
