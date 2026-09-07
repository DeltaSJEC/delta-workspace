import { DEPARTMENTS } from '../../constants/departments'

export function DepartmentSelector({ selected, onChange, allowAll = true }) {
  const toggleDept = (dept) => {
    if (dept === 'all') {
      if (selected.includes('all')) {
        onChange([])
      } else {
        onChange(['all'])
      }
      return
    }
    // If 'all' is selected, clear it first
    let next = selected.filter(d => d !== 'all')
    if (next.includes(dept)) {
      next = next.filter(d => d !== dept)
    } else {
      next = [...next, dept]
    }
    onChange(next)
  }

  const isSelected = (dept) => selected.includes(dept) || selected.includes('all')

  return (
    <div className="flex flex-col gap-3">
      {allowAll && (
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => toggleDept('all')}
            className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors cursor-pointer ${
              selected.includes('all')
                ? 'bg-[#0f62fe] border-[#0f62fe]'
                : 'border-[#424754] bg-transparent group-hover:border-[#aec6ff]'
            }`}
          >
            {selected.includes('all') && (
              <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>check</span>
            )}
          </div>
          <span className="text-sm text-[#e2e2e2] font-medium">All Members</span>
          <span className="text-xs text-[#525252]">(visible to everyone)</span>
        </label>
      )}
      {DEPARTMENTS.map(dept => (
        <label key={dept} className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => toggleDept(dept)}
            className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors cursor-pointer ${
              isSelected(dept)
                ? 'bg-[#0f62fe] border-[#0f62fe]'
                : 'border-[#424754] bg-transparent group-hover:border-[#aec6ff]'
            }`}
          >
            {isSelected(dept) && (
              <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>check</span>
            )}
          </div>
          <span className="text-sm text-[#e2e2e2]">{dept}</span>
        </label>
      ))}
    </div>
  )
}
