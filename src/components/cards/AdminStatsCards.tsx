/** Maps exactly to GET /api/auth/admin/stats/ response */
export interface AdminStatsCardsProps {
  totalUsers:    number
  totalTickers:  number
  signalsToday:  number
  totalPosts:    number
}

interface StatItem {
  label:  string
  value:  number
  accent: string
}

export function AdminStatsCards({ totalUsers, totalTickers, signalsToday, totalPosts }: AdminStatsCardsProps) {
  const stats: StatItem[] = [
    { label: 'Total Users',    value: totalUsers,   accent: 'var(--primary)'   },
    { label: 'Total Tickers',  value: totalTickers, accent: 'var(--secondary)' },
    { label: 'Signals Today',  value: signalsToday, accent: 'var(--tertiary)'  },
    { label: 'Total Posts',    value: totalPosts,   accent: 'var(--warning)'   },
  ]

  return (
    <div
      style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap:                 'var(--space-4)',
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="metric-card"
          style={{ borderTop: `3px solid ${s.accent}` }}
        >
          <span className="metric-card-label" style={{ color: s.accent }}>
            {s.label}
          </span>
          <span className="metric-card-value">{s.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
