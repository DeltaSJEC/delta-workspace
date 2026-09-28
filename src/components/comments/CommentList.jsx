import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { timeAgo } from '../../utils/dateFormat'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import toast from 'react-hot-toast'

export function CommentList({ projectId }) {
  const { user, profile } = useAuth()
  const { comments, loading, submitting, addComment, deleteComment } = useComments(projectId)
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await addComment(text.trim(), user.id)
      setText('')
      textareaRef.current?.focus()
    } catch {
      toast.error('Failed to post comment')
    }
  }

  async function handleDelete(commentId) {
    try {
      await deleteComment(commentId)
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-[#8c909f] uppercase tracking-wider">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[rgba(174,198,255,0.12)] flex items-center justify-center shrink-0 mt-1">
            <span className="text-[#aec6ff] text-[11px] font-bold uppercase">
              {profile?.name?.[0] || '?'}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="carbon-textarea flex-1"
            rows={3}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e)
            }}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="btn-primary h-9 px-5 text-sm"
          >
            {submitting ? <Spinner size="sm" /> : 'Post'}
          </button>
        </div>
      </form>

      <div className="divider" />

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          icon="chat_bubble_outline"
          title="No comments yet"
          description="Be the first to comment on this project."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-3 fade-in group">
              <div className="w-7 h-7 rounded-full bg-[rgba(174,198,255,0.12)] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[#aec6ff] text-[11px] font-bold uppercase">
                  {comment.user?.name?.[0] || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#c2c6d6]">
                    {comment.user?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-[#424754]">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-[#8c909f] leading-relaxed whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
              {comment.user_id === user?.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="btn-ghost w-7 h-7 p-0 text-[#525252] hover:text-[#fa4d56] opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
