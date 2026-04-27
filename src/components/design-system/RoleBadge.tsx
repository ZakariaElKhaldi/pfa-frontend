export type UserRole = 'user' | 'analyst' | 'admin'

const CONFIG: Record<UserRole, { cls: string; label: string }> = {
  user:     { cls: 'badge-neutral', label: 'User'     },
  analyst:  { cls: 'badge-buy',     label: 'Analyst'  },
  admin:    { cls: 'badge-sell',    label: 'Admin'     },
}

export function RoleBadge({ role }: { role: UserRole }) {
  const { cls, label } = CONFIG[role]
  return <span className={`badge ${cls}`}>{label}</span>
}
