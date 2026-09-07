import { AppShell } from '../components/layout/AppShell'
import { ProjectFeed } from '../components/projects/ProjectFeed'
import { AnnouncementCard } from '../components/announcements/AnnouncementCard'
import { useProjects } from '../hooks/useProjects'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'

export default function MemberDashboard() {
  const { profile } = useAuth()
  const { projects, loading: pLoading, error: pError, refetch: refetchProjects } = useProjects()
  const { announcements, loading: aLoading } = useAnnouncements()

  const pinned = announcements.filter(a => a.pinned).slice(0, 3)
  const recent = announcements.slice(0, 5)

  return (
    <AppShell pageTitle="Dashboard">
      {/* Welcome banner */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#e2e2e2]">
          Welcome back, <span className="text-[#aec6ff]">{profile?.name?.split(' ')[0] || 'member'}</span>
        </h2>
        <p className="text-sm text-[#525252] mt-1">
          {profile?.department} Department &nbsp;·&nbsp; Member
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider">
              Projects
            </h3>
            <span className="text-xs text-[#424754]">
              {projects.length} post{projects.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ProjectFeed
            projects={projects}
            loading={pLoading}
            error={pError}
            onDeleted={refetchProjects}
          />
        </div>

        {/* Sidebar: Announcements */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider">
              Announcements
            </h3>
            <Link to="/announcements" className="text-xs text-[#aec6ff] hover:underline">
              View all
            </Link>
          </div>

          {aLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : recent.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-[#525252]">No announcements yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map(a => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
