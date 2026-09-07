import { ProjectCard } from './ProjectCard'
import { EmptyState } from '../ui/EmptyState'
import { Spinner } from '../ui/Spinner'

export function ProjectFeed({ projects, loading, error, onDeleted }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="skeleton h-4 w-1/4 mb-3" />
            <div className="skeleton h-5 w-3/4 mb-4" />
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 w-5/6 mb-2" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <span className="material-symbols-outlined text-[#fa4d56] mb-3 block" style={{ fontSize: 36 }}>
          error
        </span>
        <p className="text-sm text-[#fa4d56]">{error}</p>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon="folder_open"
        title="No projects yet"
        description="Projects shared with your department will appear here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} onDeleted={onDeleted} />
      ))}
    </div>
  )
}
