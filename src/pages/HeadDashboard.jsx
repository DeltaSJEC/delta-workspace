import { AppShell } from '../components/layout/AppShell'
import { ProjectFeed } from '../components/projects/ProjectFeed'
import { AnnouncementCard } from '../components/announcements/AnnouncementCard'
import { useProjects } from '../hooks/useProjects'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'

export default function HeadDashboard() {
  const { profile } = useAuth()
  const { projects, loading: pLoading, error: pError, refetch: refetchProjects } = useProjects()
  const { announcements, loading: aLoading, refetch: refetchAnnouncements } = useAnnouncements()

  const recent = announcements.slice(0, 5)

  return (
    <AppShell pageTitle="Head Dashboard">
      {/* Welcome + Quick actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#e2e2e2]">
            {profile?.role_title || 'Head Panel'} &nbsp;—&nbsp; <span className="text-[#aec6ff]">{profile?.name}</span>
          </h2>
          <p className="text-sm text-[#525252] mt-1">
            {profile?.department}{profile?.branch ? ` (${profile?.branch})` : ''} &nbsp;·&nbsp; {profile?.role_title || 'Head'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/create-announcement" className="btn-secondary h-10 px-4 text-sm">
            <span className="material-symbols-outlined text-[16px]">edit_square</span>
            Announcement
          </Link>
          <Link to="/create-project" className="btn-primary h-10 px-4 text-sm">
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Project
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Projects', value: projects.length, icon: 'folder' },
          { label: 'Announcements', value: announcements.length, icon: 'campaign' },
          { label: 'Pinned', value: announcements.filter(a => a.pinned).length, icon: 'push_pin' },
          { label: 'My Posts', value: projects.filter(p => p.posted_by === profile?.id).length, icon: 'person' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#525252] uppercase tracking-wider font-medium">{stat.label}</span>
              <span className="material-symbols-outlined text-[#333535] text-[18px]">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-[#aec6ff]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider">All Projects</h3>
          </div>
          <ProjectFeed projects={projects} loading={pLoading} error={pError} onDeleted={refetchProjects} />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider">Announcements</h3>
            <Link to="/announcements" className="text-xs text-[#aec6ff] hover:underline">View all</Link>
          </div>
          {aLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : recent.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-[#525252]">No announcements</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map(a => (
                <AnnouncementCard key={a.id} announcement={a} onDeleted={refetchAnnouncements} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
