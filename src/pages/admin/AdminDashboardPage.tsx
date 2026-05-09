import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { RoleBadge } from '@/components/design-system/RoleBadge'
import { SignalBadge } from '@/components/design-system/SignalBadge'
import { Icons } from '@/components/design-system/icons'
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

const ROLE_COLOR: Record<string, string> = {
  admin:   'var(--tertiary)',
  analyst: 'var(--primary)',
  user:    'var(--secondary)',
}

// ── Big stat card ────────────────────────────────────────────────────────────
function BigStatCard({ label, value, icon, accent, delta }: {
  label: string; value: number; icon: React.ReactNode; accent: string; delta?: string
}) {
  return (
    <div style={{
      background: 'var(--surface-container)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      borderTop: `3px solid ${accent}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `color-mix(in srgb, ${accent} 15%, transparent)`,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)' }}>
          {label}
        </span>
        <span style={{ fontSize: 22, opacity: 0.7 }}>{icon}</span>
      </div>
      <span style={{ fontSize: 'var(--text-display-sm)', fontWeight: 800, color: 'var(--on-surface)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value.toLocaleString()}
      </span>
      {delta && (
        <span style={{ fontSize: 'var(--text-label-sm)', color: accent, fontWeight: 500 }}>{delta}</span>
      )}
    </div>
  )
}

// ── Role distribution bar ─────────────────────────────────────────────────────
function RoleDistribution({ users }: { users: BackendUser[] }) {
  const counts = useMemo(() => {
    const c = { admin: 0, analyst: 0, user: 0 }
    users.forEach(u => { if (u.role in c) c[u.role as keyof typeof c]++ })
    return c
  }, [users])
  const total = users.length || 1

  return (
    <div className="card stack stack-4">
      <span style={SECTION_LABEL}>Role Distribution</span>
      <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
        {(['admin', 'analyst', 'user'] as const).map(r => (
          <div
            key={r}
            style={{
              flex: counts[r] / total,
              background: ROLE_COLOR[r],
              transition: 'flex 0.4s var(--ease-out)',
              minWidth: counts[r] > 0 ? 4 : 0,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        {(['admin', 'analyst', 'user'] as const).map(r => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: ROLE_COLOR[r], display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'capitalize' }}>{r}</span>
            <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--on-surface)' }}>
              {counts[r]}
            </span>
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
              ({((counts[r] / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Activity timeline item ────────────────────────────────────────────────────
function TimelineItem({ user, isLast }: { user: BackendUser; isLast: boolean }) {
  const timeAgo = () => {
    const diff = Date.now() - new Date(user.date_joined).getTime()
    const d = Math.floor(diff / 86_400_000)
    if (d < 1) return 'today'
    if (d < 7) return `${d}d ago`
    return `${Math.floor(d / 7)}w ago`
  }
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
      {/* Timeline line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, marginTop: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: ROLE_COLOR[user.role] ?? 'var(--primary)', flexShrink: 0 }} />
        {!isLast && <div style={{ width: 2, flex: 1, background: 'var(--outline-variant)', marginTop: 2, minHeight: 20 }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 'var(--space-3)', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>{user.username}</span>
          <RoleBadge role={user.role} />
          {!user.is_active && (
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-high)' }}>
              inactive
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>joined {timeAgo()}</span>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>·</span>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>{user.email}</span>
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { state: stats, refetch: refetchStats } = useData<AdminStats>('/api/auth/admin/stats/')
  const { state: users }                        = useData<BackendUser[]>('/api/auth/admin/users/')
  const { state: signals }                      = useData<SignalItem[]>('/api/signals/recent/?limit=10&all=true')

  const recentUsers = users.status === 'success'
    ? [...users.data].sort((a, b) => +new Date(b.date_joined) - +new Date(a.date_joined)).slice(0, 8)
    : []

  const statCards = stats.status === 'success' ? [
    { label: 'Total Users',   value: stats.data.total_users,   icon: <Icons.Users size={22} />, accent: 'var(--primary)',   delta: 'Registered accounts' },
    { label: 'Total Tickers', value: stats.data.total_tickers, icon: <Icons.TrendingUp size={22} />, accent: 'var(--secondary)', delta: 'Tracked instruments' },
    { label: 'Signals Today', value: stats.data.signals_today, icon: <Icons.Zap size={22} />, accent: 'var(--tertiary)',  delta: 'Generated in 24h' },
    { label: 'Total Posts',   value: stats.data.total_posts,   icon: <Icons.MessageSquare size={22} />, accent: 'var(--warning)',   delta: 'Social data ingested' },
  ] : []

  return (
    <div className="p-6 stack stack-6">
      <PageHeader
        title="Admin"
        subtitle="Platform health, user activity, and recent signal stream."
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      )}
      {stats.status === 'success' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {statCards.map(s => <BigStatCard key={s.label} {...s} />)}
        </div>
      )}

      {/* Role distribution */}
      {users.status === 'success' && users.data.length > 0 && (
        <RoleDistribution users={users.data} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Activity Timeline */}
        <div className="stack stack-3">
          <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={SECTION_LABEL}>Recent Sign-ups</span>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/admin/users')}>View all →</button>
          </div>
          {users.status === 'error' && <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-body-sm)' }}>Failed to load users.</span>}
          {(users.status === 'idle' || users.status === 'loading') && <Skeleton className="h-64 w-full" />}
          {users.status === 'success' && recentUsers.length === 0 && <EmptyState title="No users yet" />}
          {users.status === 'success' && recentUsers.length > 0 && (
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              {recentUsers.map((u, i) => (
                <TimelineItem key={u.id} user={u} isLast={i === recentUsers.length - 1} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Signals */}
        <div className="stack stack-3">
          <span style={SECTION_LABEL}>Live Signal Stream</span>
          {signals.status === 'error' && <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-body-sm)' }}>Failed to load signals.</span>}
          {(signals.status === 'idle' || signals.status === 'loading') && <Skeleton className="h-64 w-full" />}
          {signals.status === 'success' && signals.data.length === 0 && <EmptyState title="No recent signals" />}
          {signals.status === 'success' && signals.data.length > 0 && (
            <div className="card stack stack-2">
              {signals.data.map(s => {
                const color = s.signal === 'BUY' ? 'var(--secondary)' : s.signal === 'SELL' ? 'var(--tertiary)' : 'var(--warning)'
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/tickers/${s.ticker_symbol}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      background: 'transparent', border: 0, padding: 'var(--space-2) 0',
                      cursor: 'pointer', width: '100%', borderBottom: '1px solid var(--outline-variant)',
                    }}
                  >
                    <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: color, flexShrink: 0 }} />
                    <SignalBadge signal={s.signal} />
                    <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 700, fontFamily: 'var(--font-mono)', flex: 1, textAlign: 'left' }}>
                      {s.ticker_symbol}
                    </span>
                    {/* Confidence bar */}
                    <div style={{ flex: 1, maxWidth: 80, height: 4, borderRadius: 999, background: 'var(--surface-container-high)' }}>
                      <div style={{ height: '100%', width: `${(s.prediction_confidence ?? 0) * 100}%`, borderRadius: 999, background: color }} />
                    </div>
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
