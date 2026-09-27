import { Spinner } from '../ui/Spinner'
import { formatFileSize, getFileIcon } from '../../utils/fileHelpers'
import { timeAgo } from '../../utils/dateFormat'
import toast from 'react-hot-toast'

/**
 * Panel shown ONLY to heads — lists all member submissions for the project.
 * Grouped by member, with download + delete actions.
 */
export function MemberSubmissionsPanel({ submissions, loading, onDelete, onDownload }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Spinner size="md" />
      </div>
    )
  }

  // Group submissions by member name
  const byMember = {}
  for (const s of submissions) {
    const name = s.submitted_by_user?.name || 'Unknown'
    if (!byMember[name]) byMember[name] = { user: s.submitted_by_user, items: [] }
    byMember[name].items.push(s)
  }
  const groups = Object.entries(byMember)

  async function handleDownload(submission) {
    const result = await onDownload(submission.storage_path)
    if (result?.url) {
      window.open(result.url, '_blank')
    } else {
      toast.error('Could not generate download link')
    }
  }

  async function handleDelete(submission) {
    if (!confirm(`Delete "${submission.filename}" by ${submission.submitted_by_user?.name}?`)) return
    const result = await onDelete(submission)
    if (result?.success) {
      toast.success('Submission deleted')
    } else {
      toast.error(result?.error || 'Failed to delete submission')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span className="material-symbols-outlined text-[#8c909f]" style={{ fontSize: '17px' }}>assignment_turned_in</span>
        <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#8c909f', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Member Submissions
        </h3>
        {submissions.length > 0 && (
          <span style={{
            fontSize: '11px', fontWeight: 700, color: '#aec6ff',
            background: 'rgba(174,198,255,0.1)', borderRadius: '10px',
            padding: '2px 8px', marginLeft: '4px',
          }}>
            {submissions.length}
          </span>
        )}
      </div>

      {groups.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          padding: '28px 16px',
          background: 'rgba(174,198,255,0.02)',
          border: '1px dashed rgba(174,198,255,0.1)',
          borderRadius: '4px',
        }}>
          <span className="material-symbols-outlined text-[#333535]" style={{ fontSize: '32px' }}>inbox</span>
          <p style={{ fontSize: '13px', color: '#424754' }}>No submissions yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groups.map(([memberName, { user, items }]) => (
            <div key={memberName}>
              {/* Member header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'rgba(174,198,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#aec6ff', textTransform: 'uppercase' }}>
                    {memberName[0]}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#c2c6d6' }}>{memberName}</span>
                  {user?.department && (
                    <span style={{ fontSize: '11px', color: '#525252', marginLeft: '6px' }}>{user.department}</span>
                  )}
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 700, color: '#8c909f',
                  background: 'rgba(174,198,255,0.07)', borderRadius: '8px',
                  padding: '1px 6px', marginLeft: 'auto',
                }}>
                  {items.length} file{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Submission files */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '36px' }}>
                {items.map(s => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '10px 12px',
                      background: 'rgba(174,198,255,0.03)',
                      border: '1px solid rgba(174,198,255,0.08)',
                      borderRadius: '4px',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(174,198,255,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(174,198,255,0.08)'}
                  >
                    <span className="material-symbols-outlined text-[#aec6ff]" style={{ fontSize: '18px', marginTop: '1px', flexShrink: 0 }}>
                      {getFileIcon(s.file_type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#e2e2e2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.filename}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#525252' }}>{formatFileSize(s.size_bytes)}</span>
                        <span style={{ fontSize: '11px', color: '#424754' }}>·</span>
                        <span style={{ fontSize: '11px', color: '#424754' }}>{timeAgo(s.submitted_at)}</span>
                        {s.note && (
                          <>
                            <span style={{ fontSize: '11px', color: '#424754' }}>·</span>
                            <span style={{ fontSize: '11px', color: '#8c909f', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                              "{s.note}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleDownload(s)}
                        className="btn-ghost w-8 h-8 p-0"
                        title="Download"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="btn-ghost w-8 h-8 p-0"
                        style={{ color: '#fa4d56' }}
                        title="Delete submission"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
