import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/dateFormat'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, changePassword } = useAuth()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [showPwForm, setShowPwForm] = useState(false)

  async function handleChangePassword(e) {
    e.preventDefault()
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    setChangingPw(true)
    try {
      await changePassword(newPw)
      toast.success('Password updated successfully')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
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

        {/* Profile card */}
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

        {/* Change Password */}
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
