import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { AdminStatsCards } from '@/components/cards/AdminStatsCards'
import { RoleBadge } from '@/components/design-system/RoleBadge'
import { SignalBadge } from '@/components/design-system/SignalBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/hooks/useApi'
import type { Signal } from '@/design-system/tokens'

interface AdminStats { total_users: number; total_tickers: number; signals_today: number; total_posts: number }
interface BackendUser {
  id: number; username: string; email: string; role: 'user' | 'analyst' | 'admin'
  is_active: boolean; date_joined: string
}
interface SignalItem {
  id: number; ticker_symbol: string; signal: Signal; created_at: string
  bullish_ratio: number; prediction_confidence: number
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { state: stats, refetch: refetchStats } = useData<AdminStats>('/api/auth/admin/stats/')
  const { state: users }                        = useData<BackendUser[]>('/api/auth/admin/users/')
  const { state: signals }                      = useData<SignalItem[]>('/api/signals/recent/?limit=8')

  const recentUsers = users.status === 'success'
    ? [...users.data].sort((a, b) => +new Date(b.date_joined) - +new Date(a.date_joined)).slice(0, 5)
    : []

  return (
    <div className="p-6 stack stack-6">
      <PageHeader
        title="Admin"
        subtitle="Platform stats, users, and recent signal activity."
        actions={
          <div className="cluster cluster-2">
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/admin/users')}>Manage Users</button>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/intelligence')}>Intelligence</button>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/audit')}>Audit Log</button>
          </div>
        }
      />

      {/* Stats */}
      {stats.status === 'error' && <ErrorState message={stats.message} onRetry={refetchStats} />}
      {(stats.status === 'loading' || stats.status === 'idle') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}
      {stats.status === 'success' && (
        <AdminStatsCards
          totalUsers={stats.data.total_users}
          totalTickers={stats.data.total_tickers}
          signalsToday={stats.data.signals_today}
          totalPosts={stats.data.total_posts}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Recent Users */}
        <div className="stack stack-3">
          <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={SECTION_LABEL}>Recent Sign-ups</span>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/admin/users')}>View all →</button>
          </div>
          {users.status === 'error' && <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-body-sm)' }}>Failed to load users.</span>}
          {(users.status === 'idle' || users.status === 'loading') && <Skeleton className="h-48 w-full" />}
          {users.status === 'success' && recentUsers.length === 0 && <EmptyState title="No users yet" />}
          {users.status === 'success' && recentUsers.length > 0 && (
            <div className="card stack stack-3">
              {recentUsers.map(u => (
                <div key={u.id} className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="stack stack-1">
                    <span style={{ fontSize: 'var(--text-body-md)', fontWeight: 500 }}>{u.username}</span>
                    <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>{u.email}</span>
                  </div>
                  <div className="cluster cluster-2" style={{ alignItems: 'center' }}>
                    <RoleBadge role={u.role} />
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(u.date_joined).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Signals */}
        <div className="stack stack-3">
          <span style={SECTION_LABEL}>Recent Signals</span>
          {signals.status === 'error' && <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-body-sm)' }}>Failed to load signals.</span>}
          {(signals.status === 'idle' || signals.status === 'loading') && <Skeleton className="h-48 w-full" />}
          {signals.status === 'success' && signals.data.length === 0 && <EmptyState title="No recent signals" />}
          {signals.status === 'success' && signals.data.length > 0 && (
            <div className="card stack stack-3">
              {signals.data.slice(0, 5).map(s => (
                <button
                  key={s.id}
                  className="cluster cluster-3"
                  onClick={() => navigate(`/tickers/${s.ticker_symbol}`)}
                  style={{ justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 0, padding: 0, cursor: 'pointer', width: '100%' }}
                >
                  <div className="cluster cluster-3" style={{ alignItems: 'center' }}>
                    <SignalBadge signal={s.signal} />
                    <span style={{ fontSize: 'var(--text-body-md)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{s.ticker_symbol}</span>
                  </div>
                  <div className="stack stack-1" style={{ alignItems: 'flex-end' }}>
                    <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
                      {(s.bullish_ratio * 100).toFixed(0)}% bull · {(s.prediction_confidence * 100).toFixed(0)}% conf
                    </span>
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardPagePreview({
  stats = { total_users: 2418, total_tickers: 312, signals_today: 1836, total_posts: 94721 },
}: {
  stats?: AdminStats
}) {
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Admin" subtitle="Platform stats, users, and recent signal activity." />
      <AdminStatsCards
        totalUsers={stats.total_users}
        totalTickers={stats.total_tickers}
        signalsToday={stats.signals_today}
        totalPosts={stats.total_posts}
      />
    </div>
  )
}
