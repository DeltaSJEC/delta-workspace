/**
 * YearlyHeatmap — GitHub-style contribution graph
 * Shows the last 52 weeks (364 days) as a grid of coloured cells.
 *
 * Props:
 *   dailyMap  — Record<string, number>  e.g. { '2026-09-01': 3, ... }
 *   yearTotal — number  total sessions in the past year
 */
export function YearlyHeatmap({ dailyMap = {}, yearTotal = 0 }) {
  // ── Build the 53-week × 7-day grid ──────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from the most recent Sunday, going back 52 full weeks
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - today.getDay() - 52 * 7)

  // Build flat list of { dateStr, count } for every day from startDate → today
  const days = []
  const cur = new Date(startDate)
  while (cur <= today) {
    const key = cur.toISOString().slice(0, 10)
    days.push({ date: new Date(cur), dateStr: key, count: dailyMap[key] || 0 })
    cur.setDate(cur.getDate() + 1)
  }

  // Group into weeks (columns), each week = 7 days (Sun → Sat)
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // Max count for scaling colours
  const maxCount = Math.max(...Object.values(dailyMap), 1)

  // ── Colour helper (4 levels like GitHub) ────────────────────────
  function cellColor(count) {
    if (!count) return '#161b22'        // empty
    const ratio = count / maxCount
    if (ratio < 0.25) return '#0e4429' // level 1
    if (ratio < 0.5)  return '#006d32' // level 2
    if (ratio < 0.75) return '#26a641' // level 3
    return '#39d353'                    // level 4 (brightest)
  }

  // ── Month labels (show label at the first column of a new month) ─
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthLabels = weeks.map(() => null)
  let lastM = -1
  
  weeks.forEach((week, wi) => {
    const firstDay = week[0]
    if (!firstDay) return
    const m = firstDay.date.getMonth()
    if (m !== lastM) {
      // Only record if it's a new month compared to previous column
      if (lastM !== -1 || wi === 0) {
        monthLabels[wi] = MONTHS[m]
      }
      lastM = m
    }
  })

  // Prevent overlapping text (like "SepOct"):
  // If two month labels are less than 3 columns (weeks) apart, clear the earlier one.
  // This typically happens at the very start of the graph with a partial month.
  let prevIdx = -1
  for (let i = 0; i < monthLabels.length; i++) {
    if (monthLabels[i]) {
      if (prevIdx !== -1 && i - prevIdx < 3) {
        monthLabels[prevIdx] = null
      }
      prevIdx = i
    }
  }

  const CELL = 11   // cell size px
  const GAP  = 2    // gap px
  const STEP = CELL + GAP

  const gridW = weeks.length * STEP
  const gridH = 7 * STEP

  // ── Tooltip state ────────────────────────────────────────────────
  // (we use title attr for simplicity — works fine)

  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div>
      {/* Summary line */}
      <p style={{ fontSize: '13px', color: '#8c909f', marginBottom: '12px' }}>
        <span style={{ color: '#e2e2e2', fontWeight: 700 }}>{yearTotal}</span> session{yearTotal !== 1 ? 's' : ''} in the last year
      </p>

      {/* Heatmap container — scrolls horizontally on small screens */}
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content' }}>

          {/* Day-of-week labels */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: `${GAP}px`,
            paddingTop: '18px', // offset for month labels row
            marginRight: '2px',
          }}>
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{
                height: `${CELL}px`,
                fontSize: '9px',
                color: '#525252',
                display: 'flex', alignItems: 'center',
                // only show Mon, Wed, Fri (indices 1,3,5) like GitHub
                visibility: [1, 3, 5].includes(i) ? 'visible' : 'hidden',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid columns */}
          <div>
            {/* Month labels row */}
            <div style={{ display: 'flex', marginBottom: '4px', height: '14px' }}>
              {weeks.map((_, wi) => (
                <div key={wi} style={{
                  width: `${STEP}px`,
                  fontSize: '9px',
                  color: '#525252',
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  userSelect: 'none',
                }}>
                  {monthLabels[wi] || ''}
                </div>
              ))}
            </div>

            {/* Cells grid */}
            <div style={{ display: 'flex', gap: `${GAP}px` }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                  {week.map((day, di) => {
                    const isFuture = day.date > today
                    const label = isFuture
                      ? ''
                      : day.count === 0
                        ? `No sessions on ${day.dateStr}`
                        : `${day.count} session${day.count !== 1 ? 's' : ''} on ${day.dateStr}`
                    return (
                      <div
                        key={di}
                        title={label}
                        style={{
                          width: `${CELL}px`,
                          height: `${CELL}px`,
                          borderRadius: '2px',
                          backgroundColor: isFuture ? 'transparent' : cellColor(day.count),
                          cursor: day.count > 0 ? 'default' : undefined,
                          transition: 'background-color 0.15s',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: '4px', marginTop: '8px',
      }}>
        <span style={{ fontSize: '10px', color: '#525252', marginRight: '4px' }}>Less</span>
        {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => (
          <div key={c} style={{
            width: `${CELL}px`, height: `${CELL}px`,
            borderRadius: '2px', backgroundColor: c,
            border: '1px solid rgba(255,255,255,0.04)',
          }} />
        ))}
        <span style={{ fontSize: '10px', color: '#525252', marginLeft: '4px' }}>More</span>
      </div>
    </div>
  )
}
