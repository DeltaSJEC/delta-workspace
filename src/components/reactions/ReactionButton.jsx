import { useReactions } from '../../hooks/useReactions'

export function ReactionButton({ projectId, initialReactions = [], compact = false }) {
  const { likeCount, hasLiked, toggleLike, loading } = useReactions(projectId, initialReactions)

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`reaction-btn ${hasLiked ? 'liked' : ''}`}
      title={hasLiked ? 'Unlike' : 'Like'}
    >
      <span
        className={`material-symbols-outlined ${hasLiked ? 'filled' : ''}`}
        style={{ fontSize: compact ? 14 : 16 }}
      >
        thumb_up
      </span>
      {!compact && <span>{likeCount}</span>}
      {compact && likeCount > 0 && <span>{likeCount}</span>}
    </button>
  )
}
