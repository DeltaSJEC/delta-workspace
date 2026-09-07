import { useParams, Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProjectFileList } from '../components/projects/ProjectFileList'
import { CommentList } from '../components/comments/CommentList'
import { ReactionButton } from '../components/reactions/ReactionButton'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { useProject } from '../hooks/useProjects'
import { useAuth } from '../context/AuthContext'
import { DEPARTMENT_COLORS } from '../constants/departments'
import { formatDateTime } from '../utils/dateFormat'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { profile, isHead } = useAuth()
  const { project, loading, error, refetch } = useProject(id)

  if (loading) {
    return (
      <AppShell pageTitle="Project">
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </AppShell>
    )
  }

  if (error || !project) {
    return (
      <AppShell pageTitle="Project">
        <div className="glass-card p-10 text-center max-w-lg mx-auto mt-10">
          <span className="material-symbols-outlined text-[#fa4d56] block mb-3" style={{ fontSize: 40 }}>error</span>
          <p className="text-[#fa4d56] mb-4">{error || 'Project not found'}</p>
          <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </AppShell>
    )
  }

  const poster = project.posted_by_user
  const targets = project.target_departments || []
  const isOwner = profile?.id === project.posted_by

  return (
    <AppShell pageTitle={project.title}>
      {/* Back */}
      <div className="mb-5">
        <Link to="/dashboard" className="btn-ghost px-0 text-[#525252] hover:text-[#aec6ff]">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Project header */}
          <div className="glass-card p-6">
            {/* Department chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {targets.includes('all') ? (
                <span className="badge bg-[rgba(174,198,255,0.1)] text-[#aec6ff] border border-[rgba(174,198,255,0.2)]">
                  All Members
                </span>
              ) : targets.map(dept => {
                const c = DEPARTMENT_COLORS[dept] || DEPARTMENT_COLORS.Mechanical
                return (
                  <span key={dept} className="badge"
                    style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                    {dept}
                  </span>
                )
              })}
            </div>

            <h1 className="text-xl font-bold text-[#e2e2e2] mb-4">{project.title}</h1>

            {/* Author meta */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[rgba(174,198,255,0.08)]">
              <div className="w-8 h-8 rounded-full bg-[rgba(174,198,255,0.12)] flex items-center justify-center shrink-0">
                <span className="text-[#aec6ff] text-sm font-bold uppercase">{poster?.name?.[0] || '?'}</span>
              </div>
              <div>
                <p className="text-sm text-[#c2c6d6] font-medium">{poster?.name || 'Unknown'}</p>
                <p className="text-xs text-[#525252]">{formatDateTime(project.created_at)}</p>
              </div>
              <Badge variant={poster?.role === 'head' ? 'head' : 'member'} className="ml-auto">
                {poster?.role === 'head' ? 'Head' : 'Member'}
              </Badge>
            </div>

            {/* Description */}
            <div className="text-sm text-[#8c909f] leading-relaxed whitespace-pre-wrap">
              {project.description}
            </div>

            {/* Reaction */}
            <div className="mt-5 pt-4 border-t border-[rgba(174,198,255,0.06)] flex items-center gap-3">
              <ReactionButton
                projectId={project.id}
                initialReactions={project.reactions || []}
              />
              <span className="text-xs text-[#424754]">
                {project.reactions?.filter(r => r.type === 'like').length || 0} like{project.reactions?.filter(r => r.type === 'like').length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="glass-card p-6">
            <CommentList projectId={project.id} />
          </div>
        </div>

        {/* Sidebar: Files */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider mb-4">
              Files ({project.project_files?.length || 0})
            </h3>
            {project.project_files?.length > 0 ? (
              <ProjectFileList
                files={project.project_files}
                projectId={project.id}
                canDelete={isHead && isOwner}
                onDeleted={refetch}
              />
            ) : (
              <p className="text-sm text-[#424754] text-center py-4">No files attached</p>
            )}
          </div>

          {/* Project info card */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider mb-4">Details</h3>
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-xs text-[#424754] mb-1">Posted by</dt>
                <dd className="text-sm text-[#c2c6d6]">{poster?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#424754] mb-1">Department</dt>
                <dd className="text-sm text-[#c2c6d6]">{poster?.department}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#424754] mb-1">Posted on</dt>
                <dd className="text-sm text-[#c2c6d6]">{formatDateTime(project.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#424754] mb-1">Visible to</dt>
                <dd className="text-sm text-[#c2c6d6]">
                  {targets.includes('all') ? 'All members' : targets.join(', ') || '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
