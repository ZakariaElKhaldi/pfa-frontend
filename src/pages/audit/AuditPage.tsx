import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { DecisionLogRow } from '@/components/cards/DecisionLogRow'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useData } from '@/hooks/useApi'

interface DecisionItem {
  id: number
  ticker_symbol: string
  timestamp: string
  input_summary: Record<string, unknown>
  scoring_detail: Record<string, unknown>
  engine_output: Record<string, unknown>
  alerts_triggered: string[]
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10)

export function AuditPage() {
  const { state, refetch } = useData<DecisionItem[]>('/api/audit/decisions/')

  const today    = isoDay(new Date())
  const weekAgo  = isoDay(new Date(Date.now() - 7 * 86_400_000))
  const [from,   setFrom]   = useState(weekAgo)
  const [to,     setTo]     = useState(today)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (state.status !== 'success') return [] as DecisionItem[]
    const q     = search.trim().toUpperCase()
    const fromT = new Date(from + 'T00:00:00').getTime()
    const toT   = new Date(to + 'T23:59:59').getTime()
    return state.data.filter(d => {
      const t = new Date(d.timestamp).getTime()
      if (Number.isFinite(fromT) && t < fromT) return false
      if (Number.isFinite(toT)   && t > toT)   return false
      if (q && !d.ticker_symbol.toUpperCase().includes(q)) return false
      return true
    })
  }, [state, from, to, search])

  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Audit" subtitle="Decision logs and scoring history." />

      {/* Filters */}
      <div className="cluster cluster-3" style={{ alignItems: 'end', flexWrap: 'wrap' }}>
        <div className="stack stack-1">
          <Label htmlFor="audit-from">From</Label>
          <Input id="audit-from" type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="stack stack-1">
          <Label htmlFor="audit-to">To</Label>
          <Input id="audit-to" type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="stack stack-1" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Label htmlFor="audit-search">Ticker</Label>
          <Input id="audit-search" placeholder="Search ticker…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {state.status === 'success' && (
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
            {filtered.length} of {state.data.length}
          </span>
        )}
      </div>

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'loading' || state.status === 'idle') && (
        <div className="stack stack-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      )}
      {state.status === 'success' && filtered.length === 0 && (
        <EmptyState
          title={state.data.length === 0 ? 'No decision logs' : 'No matches'}
          description={state.data.length === 0 ? 'No decisions have been logged yet.' : 'Try widening the date range or clearing search.'}
        />
      )}
      {state.status === 'success' && filtered.length > 0 && (
        <div className="stack stack-2">
          {filtered.map(d => (
            <DecisionLogRow
              key={d.id}
              id={d.id}
              ticker={d.ticker_symbol}
              timestamp={new Date(d.timestamp).toLocaleString()}
              inputSummary={typeof d.input_summary === 'object' ? JSON.stringify(d.input_summary).slice(0, 120) : String(d.input_summary)}
              scoringDetail={d.scoring_detail}
              engineOutput={d.engine_output}
              alertsTriggered={Array.isArray(d.alerts_triggered) ? d.alerts_triggered.map(String) : []}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AuditPagePreview() {
  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Audit" subtitle="Decision logs and scoring history." />
      <div className="stack stack-2">
        <DecisionLogRow
          id={1}
          ticker="AAPL"
          timestamp="2024-01-15 09:30:01"
          inputSummary="bullish_ratio=0.72, normalized_index=0.65, post_count=1240"
          scoringDetail={{ bullish_ratio: 0.72, normalized_index: 0.65, time_decay: 0.88 }}
          engineOutput={{ signal: 'BUY', confidence: 0.84, method: 'ml' }}
          alertsTriggered={[]}
        />
        <DecisionLogRow
          id={2}
          ticker="TSLA"
          timestamp="2024-01-15 09:30:05"
          inputSummary="bullish_ratio=0.29, normalized_index=-0.44, post_count=2108"
          scoringDetail={{ bullish_ratio: 0.29, normalized_index: -0.44, time_decay: 0.71 }}
          engineOutput={{ signal: 'SELL', confidence: 0.77, method: 'ml' }}
          alertsTriggered={['divergence_alert', 'extreme_sentiment']}
        />
      </div>
    </div>
  )
}
