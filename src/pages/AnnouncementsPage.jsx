import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { AnnouncementCard } from '../components/announcements/AnnouncementCard'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { useAuth } from '../context/AuthContext'
import { DEPARTMENTS } from '../constants/departments'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { Link } from 'react-router-dom'

export default function AnnouncementsPage() {
  const { isHead } = useAuth()
  const { announcements, loading, error, refetch } = useAnnouncements()
  const [deptFilter, setDeptFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = announcements.filter(a => {
    const matchesDept =
      deptFilter === 'all' ||
      a.target_departments?.includes(deptFilter) ||
      a.target_departments?.includes('all')
    const matchesSearch =
      !search.trim() ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
    return matchesDept && matchesSearch
  })

  const pinned = filtered.filter(a => a.pinned)
  const regular = filtered.filter(a => !a.pinned)

  return (
    <AppShell pageTitle="Announcements">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#e2e2e2]">Announcements</h2>
            <p className="text-sm text-[#525252] mt-1">{announcements.length} total</p>
          </div>
          {isHead && (
            <Link to="/create-announcement" className="btn-primary h-10 px-4 text-sm">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#525252] text-[16px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="carbon-input pl-9"
            />
          </div>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="carbon-input w-full sm:w-48 cursor-pointer"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-[#fa4d56]">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="campaign"
            title="No announcements"
            description={search ? 'No results match your search.' : 'No announcements for your department yet.'}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Pinned section */}
            {pinned.length > 0 && (
              <>
                <p className="text-xs text-[#ffc850] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined filled text-[14px]">push_pin</span>
                  Pinned
                </p>
                {pinned.map(a => (
                  <AnnouncementCard key={a.id} announcement={a} onDeleted={refetch} />
                ))}
                {regular.length > 0 && <div className="divider my-2" />}
              </>
            )}

            {/* Regular section */}
            {regular.length > 0 && (
              <>
                {pinned.length > 0 && (
                  <p className="text-xs text-[#525252] font-semibold uppercase tracking-wider">Recent</p>
                )}
                {regular.map(a => (
                  <AnnouncementCard key={a.id} announcement={a} onDeleted={refetch} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
