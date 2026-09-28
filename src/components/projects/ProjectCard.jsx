import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { ReactionButton } from '../reactions/ReactionButton'
import { DEPARTMENT_COLORS } from '../../constants/departments'
import { timeAgo } from '../../utils/dateFormat'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'

export function ProjectCard({ project, onDeleted }) {
  const { isHead, profile } = useAuth()
  const [deleting, setDeleting] = useState(false)

  const poster = project.posted_by_user
  const fileCount = project.project_files?.length || 0
  const commentCount = project.comments?.length || 0
  const targets = project.target_departments || []
  const isOwner = profile?.id === project.posted_by

  async function handleDelete() {
    if (!confirm('Delete this project? This cannot be undone.')) return
    setDeleting(true)
    const storagePaths = project.project_files?.map(file => file.storage_path) || []
    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from('project-files').remove(storagePaths)
      if (storageError) {
        toast.error('Failed to delete project attachments')
        setDeleting(false)
        return
      }
    }
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (error) {
      toast.error('Failed to delete project')
    } else {
      toast.success('Project deleted')
      onDeleted?.()
    }
    setDeleting(false)
  }

  return (
    <article className="glass-card p-5 flex flex-col gap-4 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Department chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {targets.includes('all') ? (
              <span className="badge bg-[rgba(174,198,255,0.1)] text-[#aec6ff] border border-[rgba(174,198,255,0.2)]">
                All Members
              </span>
            ) : targets.map(dept => {
              const colors = DEPARTMENT_COLORS[dept] || DEPARTMENT_COLORS.Mechanical
              return (
                <span
                  key={dept}
                  className="badge"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  {dept}
                </span>
              )
            })}
          </div>
          <Link
            to={`/project/${project.id}`}
            className="text-base font-semibold text-[#e2e2e2] hover:text-[#aec6ff] transition-colors leading-tight block"
          >
            {project.title}
          </Link>
        </div>
        {isHead && isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <Link to={`/project/${project.id}`} className="btn-ghost w-8 h-8 p-0">
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-ghost w-8 h-8 p-0 text-[#fa4d56] hover:bg-[rgba(218,30,40,0.1)]"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[#8c909f] line-clamp-3 leading-relaxed">
        {project.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[rgba(174,198,255,0.06)]">
        {/* Author + time */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[rgba(174,198,255,0.12)] flex items-center justify-center shrink-0">
            <span className="text-[#aec6ff] text-[10px] font-bold uppercase">
              {poster?.name?.[0] || '?'}
            </span>
          </div>
          <div>
            <span className="text-xs text-[#c2c6d6]">{poster?.name || 'Unknown'}</span>
            <span className="text-xs text-[#424754] mx-1">·</span>
            <span className="text-xs text-[#525252]">{timeAgo(project.created_at)}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-[#525252]">
          {fileCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">attach_file</span>
              {fileCount}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
            {commentCount}
          </span>
          <ReactionButton
            projectId={project.id}
            initialReactions={project.reactions || []}
            compact
          />
        </div>
      </div>
    </article>
  )
}
