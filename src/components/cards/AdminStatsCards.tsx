export interface AdminStatsCardsProps {
  totalUsers:    number
  activeUsers:   number
  adminUsers:    number
  newThisWeek:   number
}

interface StatItem {
  label:    string
  value:    number
  accent:   string
}

export function AdminStatsCards({ totalUsers, activeUsers, adminUsers, newThisWeek }: AdminStatsCardsProps) {
  const stats: StatItem[] = [
    { label: 'Total Users',   value: totalUsers,   accent: 'var(--primary)'   },
    { label: 'Active',        value: activeUsers,   accent: 'var(--secondary)' },
    { label: 'Admins',        value: adminUsers,    accent: 'var(--tertiary)'  },
    { label: 'New This Week', value: newThisWeek,   accent: 'var(--warning)'   },
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
          style={{
            borderTop: `3px solid ${s.accent}`,
          }}
        >
          <span
            className="metric-card-label"
            style={{ color: s.accent }}
          >
            {s.label}
          </span>
          <span className="metric-card-value">{s.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
