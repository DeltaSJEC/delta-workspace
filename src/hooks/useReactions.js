import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useReactions(projectId, initialReactions = []) {
  const { user } = useAuth()
  const [reactions, setReactions] = useState(initialReactions)
  const [loading, setLoading] = useState(false)

  const userReaction = reactions.find(r => r.user_id === user?.id && r.type === 'like')
  const likeCount = reactions.filter(r => r.type === 'like').length

  const toggleLike = useCallback(async () => {
    if (!user) return
    setLoading(true)
    if (userReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', userReaction.id)
      if (!error) {
        setReactions(prev => prev.filter(r => r.id !== userReaction.id))
      }
    } else {
      // Add reaction
      const { data, error } = await supabase
        .from('reactions')
        .insert({ project_id: projectId, user_id: user.id, type: 'like' })
        .select()
        .single()
      if (!error && data) {
        setReactions(prev => [...prev, data])
      }
    }
    setLoading(false)
  }, [user, userReaction, projectId])

  return { reactions, likeCount, hasLiked: !!userReaction, toggleLike, loading }
}
