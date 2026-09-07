import { useEffect, useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { useLoginSessions } from '../hooks/useLoginSessions'
import { DEPARTMENTS } from '../constants/departments'
import { formatDateTime, formatDuration } from '../utils/dateFormat'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

const PAGE_SIZE = 20

export default function LoginActivityPage() {
  const { sessions, loading, error, total, fetchSessions } = useLoginSessions()
  const [dept, setDept] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState('login_time')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    fetchSessions({ department: dept || null, dateFrom: dateFrom || null, dateTo: dateTo || null, page, pageSize: PAGE_SIZE, sortField, sortDir })
  }, [dept, dateFrom, dateTo, page, sortField, sortDir])

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
    setPage(0)
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <span className="material-symbols-outlined text-[12px] text-[#424754]">unfold_more</span>
    return <span className="material-symbols-outlined text-[12px] text-[#aec6ff]">{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <AppShell pageTitle="Login Activity">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#e2e2e2]">Login Activity</h2>
          <p className="text-sm text-[#525252] mt-1">{total} session{total !== 1 ? 's' : ''} recorded</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-5 flex flex-wrap gap-3">
          <select
            value={dept}
            onChange={e => { setDept(e.target.value); setPage(0) }}
            className="carbon-input w-48 cursor-pointer"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <label className="carbon-label mb-0 whitespace-nowrap">From</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }} className="carbon-input w-44" />
          </div>
          <div className="flex items-center gap-2">
            <label className="carbon-label mb-0 whitespace-nowrap">To</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }} className="carbon-input w-44" />
          </div>
          {(dept || dateFrom || dateTo) && (
            <button
              onClick={() => { setDept(''); setDateFrom(''); setDateTo(''); setPage(0) }}
              className="btn-ghost h-10 px-3 text-sm"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : error ? (
              <div className="p-8 text-center text-[#fa4d56]">{error}</div>
            ) : sessions.length === 0 ? (
              <EmptyState icon="manage_accounts" title="No sessions found" description="No login records match the current filters." />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Department</th>
                    <th>
                      <button onClick={() => toggleSort('login_time')} className="flex items-center gap-1 hover:text-[#aec6ff]">
                        Login Time <SortIcon field="login_time" />
                      </button>
                    </th>
                    <th>
                      <button onClick={() => toggleSort('logout_time')} className="flex items-center gap-1 hover:text-[#aec6ff]">
                        Logout Time <SortIcon field="logout_time" />
                      </button>
                    </th>
                    <th>
                      <button onClick={() => toggleSort('duration_seconds')} className="flex items-center gap-1 hover:text-[#aec6ff]">
                        Duration <SortIcon field="duration_seconds" />
                      </button>
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[rgba(174,198,255,0.12)] flex items-center justify-center text-[10px] font-bold text-[#aec6ff] uppercase shrink-0">
                            {s.user?.name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-[#e2e2e2] font-medium">{s.user?.name || '—'}</p>
                            <p className="text-[#525252] text-xs">{s.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{s.user?.department || '—'}</td>
                      <td className="whitespace-nowrap">{formatDateTime(s.login_time)}</td>
                      <td className="whitespace-nowrap">{s.logout_time ? formatDateTime(s.logout_time) : <span className="text-[#424754]">—</span>}</td>
                      <td>{formatDuration(s.duration_seconds)}</td>
                      <td>
                        {s.logout_time ? (
                          <Badge variant="default">Ended</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(174,198,255,0.08)]">
              <span className="text-xs text-[#525252]">
                Page {page + 1} of {totalPages} &nbsp;·&nbsp; {total} total
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost h-8 px-3 text-sm disabled:opacity-30">
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost h-8 px-3 text-sm disabled:opacity-30">
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
