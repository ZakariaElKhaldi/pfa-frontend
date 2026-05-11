import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { AlertCard } from '@/components/cards/AlertCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useData } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { useState, useCallback, useMemo } from 'react'
import type { AlertType } from '@/components/design-system/AlertTypeBadge'

const TYPE_FILTERS: { value: AlertType | 'all'; label: string }[] = [
  { value: 'all',               label: 'All' },
  { value: 'divergence',        label: 'Divergence' },
  { value: 'extreme_sentiment', label: 'Extreme Sentiment' },
  { value: 'hype_fade',         label: 'Hype Fade' },
  { value: 'pump_suspected',    label: 'Pump Suspected' },
]

interface AlertFlagItem {
  id: number
  ticker_symbol: string
  type: AlertType
  sentiment: number
  momentum: number
  consistency: number
  resolved: boolean
}

export function AlertsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resolving, setResolving] = useState<Set<number>>(new Set())
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all')
  const [search,     setSearch]     = useState('')
  const query = useMemo(() => {
    const params = new URLSearchParams({ resolved: 'all' })
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (search.trim()) params.set('ticker', search.trim().toUpperCase())
    return `/api/alerts/?${params.toString()}`
  }, [typeFilter, search])
  const { state, refetch } = useData<AlertFlagItem[]>(query, [query])

  const handleResolve = useCallback(async (id: number) => {
    setResolving(s => new Set(s).add(id))
    try {
      await api.patch(`/api/alerts/${id}/resolve/`, {})
      toast.success('Alert resolved')
      refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to resolve alert')
    } finally {
      setResolving(s => { const n = new Set(s); n.delete(id); return n })
    }
  }, [refetch])

  const filtered = state.status === 'success' ? state.data : []

  const active   = filtered.filter(a => !a.resolved)
  const resolved = filtered.filter(a => a.resolved)
  const canResolve = user?.role === 'admin'

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Alerts" subtitle="Manipulation flags and signal divergences." />

      {/* Filter bar */}
      {state.status === 'success' && (
        <div className="cluster cluster-3" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="cluster cluster-2" style={{ flexWrap: 'wrap' }}>
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTypeFilter(f.value)}
                className={`btn btn-sm ${typeFilter === f.value ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 180, maxWidth: 280 }}>
            <Input
              placeholder="Search ticker…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}

      {(state.status === 'loading' || state.status === 'idle') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      )}

      {state.status === 'success' && active.length === 0 && (
        <EmptyState title={filtered.length === 0 ? 'No matching alerts' : 'No active alerts'} description={filtered.length === 0 ? 'Clear filters or broaden the ticker search.' : 'All signals are within expected ranges.'} />
      )}

      {active.length > 0 && (
        <div className="stack stack-3">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
            Active ({active.length})
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {active.map(a => (
              <div key={a.id} role="button" tabIndex={0} onClick={() => navigate(`/tickers/${a.ticker_symbol}`)} onKeyDown={e => e.key === 'Enter' && navigate(`/tickers/${a.ticker_symbol}`)}>
                <AlertCard
                  type={a.type}
                  symbol={a.ticker_symbol}
                  sentiment={a.sentiment}
                  momentum={a.momentum}
                  consistency={a.consistency}
                  resolved={a.resolved}
                  onResolve={canResolve && !resolving.has(a.id) ? () => handleResolve(a.id) : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div className="stack stack-3">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
            Resolved ({resolved.length})
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {resolved.slice(0, 12).map(a => (
              <AlertCard key={a.id} type={a.type} symbol={a.ticker_symbol} sentiment={a.sentiment} momentum={a.momentum} consistency={a.consistency} resolved />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export interface AlertsPagePreviewProps {
  alerts?: AlertFlagItem[]
}

export function AlertsPagePreview({
  alerts = [
    { id: 1, ticker_symbol: 'TSLA', type: 'divergence',        sentiment: -0.71, momentum: 0.12, consistency: 0.18, resolved: false },
    { id: 2, ticker_symbol: 'NVDA', type: 'extreme_sentiment', sentiment: 0.88,  momentum: 0.74, consistency: 0.22, resolved: false },
    { id: 3, ticker_symbol: 'AMC',  type: 'pump_suspected',    sentiment: 0.95,  momentum: 0.91, consistency: 0.05, resolved: false },
    { id: 4, ticker_symbol: 'GME',  type: 'hype_fade',         sentiment: 0.21,  momentum: -0.3, consistency: 0.44, resolved: true  },
  ],
}: AlertsPagePreviewProps) {
  const active   = alerts.filter(a => !a.resolved)
  const resolved = alerts.filter(a => a.resolved)
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Alerts" subtitle="Manipulation flags and signal divergences." />
      {active.length > 0 && (
        <div className="stack stack-3">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>Active ({active.length})</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {active.map(a => <AlertCard key={a.id} type={a.type} symbol={a.ticker_symbol} sentiment={a.sentiment} momentum={a.momentum} consistency={a.consistency} resolved={a.resolved} onResolve={() => {}} />)}
          </div>
        </div>
      )}
      {resolved.length > 0 && (
        <div className="stack stack-3">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>Resolved ({resolved.length})</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {resolved.map(a => <AlertCard key={a.id} type={a.type} symbol={a.ticker_symbol} sentiment={a.sentiment} momentum={a.momentum} consistency={a.consistency} resolved />)}
          </div>
        </div>
      )}
    </div>
  )
}
