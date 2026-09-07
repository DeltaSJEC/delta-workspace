import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useLoginSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  const fetchSessions = useCallback(async ({
    department = null,
    dateFrom = null,
    dateTo = null,
    page = 0,
    pageSize = 20,
    sortField = 'login_time',
    sortDir = 'desc',
  } = {}) => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('login_sessions')
      .select(`
        *,
        user:users(id, name, email, department, role)
      `, { count: 'exact' })

    if (department) {
      query = query.eq('users.department', department)
    }
    if (dateFrom) {
      query = query.gte('login_time', dateFrom)
    }
    if (dateTo) {
      query = query.lte('login_time', dateTo)
    }

    query = query
      .order(sortField, { ascending: sortDir === 'asc' })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    const { data, error: fetchError, count } = await query

    if (fetchError) setError(fetchError.message)
    else {
      setSessions(data || [])
      setTotal(count || 0)
    }
    setLoading(false)
  }, [])

  return { sessions, loading, error, total, fetchSessions }
}
