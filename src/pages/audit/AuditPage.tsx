import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useData } from '@/hooks/useApi'
import { Icons } from '@/components/design-system'

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

// ── Confidence Bar ──────────────────────────────────────────────────────────
function ConfidenceBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.min(100, Math.max(0, value * 100))
  const color = pct >= 70 ? 'var(--secondary)' : pct >= 45 ? 'var(--warning)' : 'var(--tertiary)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {label && <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', minWidth: 80 }}>{label}</span>}
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--surface-container-high)' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: color, transition: 'width 0.4s var(--ease-out)' }} />
      </div>
      <span style={{ fontSize: 'var(--text-mono-sm)', color, fontWeight: 600, fontFamily: 'var(--font-mono)', minWidth: 36, textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

// ── Payload Inspector ───────────────────────────────────────────────────────
function PayloadInspector({ data, label }: { data: Record<string, unknown>; label: string }) {
  const [expanded, setExpanded] = useState(false)
  const entries = Object.entries(data)

  return (
    <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-2) var(--space-3)', background: 'var(--surface-container-high)',
          border: 'none', cursor: 'pointer', gap: 8,
        }}
      >
        <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>{entries.length} fields</span>
          <Icons.ChevronDown size={14} style={{ color: 'var(--on-surface-muted)', transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' } as React.CSSProperties} />
        </div>
      </button>

      {/* Collapsed preview: numeric values as bars */}
      {!expanded && (
        <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {entries.slice(0, 4).map(([k, v]) => {
            const num = typeof v === 'number' ? v : null
            return num !== null && num >= 0 && num <= 1 ? (
              <ConfidenceBar key={k} value={num} label={k.replace(/_/g, ' ')} />
            ) : (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>{k.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--on-surface)' }}>
                  {typeof v === 'number' ? v.toFixed(4) : String(v)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Expanded: full key-value grid */}
      {expanded && (
        <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {entries.map(([k, v]) => {
            const num = typeof v === 'number' ? v : null
            return num !== null && num >= 0 && num <= 1 ? (
              <ConfidenceBar key={k} value={num} label={k.replace(/_/g, ' ')} />
            ) : (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>{k.replace(/_/g, ' ')}</span>
                <span style={{
                  fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: typeof v === 'string' && ['BUY', 'SELL', 'HOLD'].includes(v)
                    ? v === 'BUY' ? 'var(--secondary)' : v === 'SELL' ? 'var(--tertiary)' : 'var(--warning)'
                    : 'var(--on-surface)',
                  background: typeof v === 'string' && ['BUY', 'SELL', 'HOLD'].includes(v) ? 'var(--surface-container-high)' : 'transparent',
                  padding: typeof v === 'string' && ['BUY', 'SELL', 'HOLD'].includes(v) ? '1px 8px' : undefined,
                  borderRadius: 'var(--radius-sm)',
                }}>
                  {typeof v === 'number' ? v.toFixed(4) : String(v ?? '—')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Row ─────────────────────────────────────────────────────────────────────
function AuditRow({ d }: { d: DecisionItem }) {
  const [open, setOpen] = useState(false)
  const signal = (d.engine_output?.signal ?? d.scoring_detail?.signal ?? '') as string
  const conf = typeof d.engine_output?.confidence === 'number' ? d.engine_output.confidence : null
  const method = (d.scoring_detail?.method ?? d.engine_output?.method ?? '') as string
  const signalColor = signal === 'BUY' ? 'var(--secondary)' : signal === 'SELL' ? 'var(--tertiary)' : 'var(--warning)'

  return (
    <div style={{
      background: 'var(--surface-container)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: `1px solid ${open ? 'var(--outline-variant)' : 'transparent'}`,
      transition: 'border-color 0.15s',
    }}>
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Ticker */}
        <span style={{
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-mono-sm)',
          color: 'var(--on-surface)', padding: '2px 8px', background: 'var(--surface-container-high)',
          borderRadius: 'var(--radius-sm)', flexShrink: 0, minWidth: 50, textAlign: 'center',
        }}>
          {d.ticker_symbol}
        </span>

        {/* Signal badge */}
        {signal && (
          <span style={{
            fontSize: 'var(--text-label-sm)', fontWeight: 700, padding: '2px 10px',
            borderRadius: 'var(--radius-full)', background: `color-mix(in srgb, ${signalColor} 15%, transparent)`,
            color: signalColor, flexShrink: 0, letterSpacing: '0.05em',
          }}>
            {signal}
          </span>
        )}

        {/* Method badge */}
        {method && (
          <span style={{
            fontSize: 'var(--text-label-sm)', fontWeight: 500, padding: '2px 8px',
            borderRadius: 'var(--radius-sm)', background: 'var(--surface-container-high)',
            color: 'var(--on-surface-muted)', flexShrink: 0,
          }}>
            {method}
          </span>
        )}

        {/* Confidence inline bar */}
        {conf !== null && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 80, maxWidth: 200 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--surface-container-high)' }}>
              <div style={{ height: '100%', width: `${conf * 100}%`, borderRadius: 999, background: signalColor, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-muted)', flexShrink: 0 }}>
              {(conf * 100).toFixed(0)}%
            </span>
          </div>
        )}

        <time style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 'auto' }}>
          {new Date(d.timestamp).toLocaleString()}
        </time>

        {d.alerts_triggered?.length > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px',
            borderRadius: 'var(--radius-full)', background: 'var(--tertiary-container)',
            color: 'var(--tertiary)', fontSize: 'var(--text-label-sm)', fontWeight: 600, flexShrink: 0,
          }}>
            <Icons.AlertTriangle size={11} />
            {d.alerts_triggered.length}
          </span>
        )}

        <Icons.ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' } as React.CSSProperties} />
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: '1px solid var(--outline-variant)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {d.alerts_triggered?.length > 0 && (
            <div>
              <p style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                Alerts Triggered
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {d.alerts_triggered.map((a, i) => (
                  <span key={i} style={{
                    padding: '2px 10px', borderRadius: 'var(--radius-full)',
                    background: 'var(--tertiary-container)', color: 'var(--tertiary)',
                    fontSize: 'var(--text-label-sm)', fontWeight: 500,
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            {Object.keys(d.input_summary).length > 0 && (
              <PayloadInspector data={d.input_summary as Record<string, unknown>} label="Input Summary" />
            )}
            {Object.keys(d.scoring_detail).length > 0 && (
              <PayloadInspector data={d.scoring_detail as Record<string, unknown>} label="Scoring Detail" />
            )}
            {Object.keys(d.engine_output).length > 0 && (
              <PayloadInspector data={d.engine_output as Record<string, unknown>} label="Engine Output" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
const SIGNAL_FILTERS = ['all', 'BUY', 'SELL', 'HOLD'] as const
const METHOD_FILTERS = ['all', 'rule_based', 'xgboost', 'ensemble'] as const
const PAGE_SIZE = 25

export function AuditPage() {
  const { state, refetch } = useData<DecisionItem[]>('/api/audit/decisions/')

  const today   = isoDay(new Date())
  const weekAgo = isoDay(new Date(Date.now() - 7 * 86_400_000))
  const [from,     setFrom]     = useState(weekAgo)
  const [to,       setTo]       = useState(today)
  const [search,   setSearch]   = useState('')
  const [signal,   setSignal]   = useState<'all' | 'BUY' | 'SELL' | 'HOLD'>('all')
  const [method,   setMethod]   = useState<'all' | 'rule_based' | 'xgboost' | 'ensemble'>('all')
  const [page,     setPage]     = useState(1)

  const filtered = useMemo(() => {
    if (state.status !== 'success') return [] as DecisionItem[]
    const q     = search.trim().toUpperCase()
    const fromT = new Date(from + 'T00:00:00').getTime()
    const toT   = new Date(to   + 'T23:59:59').getTime()
    return state.data.filter(d => {
      const t = new Date(d.timestamp).getTime()
      if (Number.isFinite(fromT) && t < fromT) return false
      if (Number.isFinite(toT)   && t > toT)   return false
      if (q && !d.ticker_symbol.toUpperCase().includes(q)) return false
      const sig = (d.engine_output?.signal ?? d.scoring_detail?.signal ?? '') as string
      if (signal !== 'all' && sig !== signal) return false
      const meth = (d.scoring_detail?.method ?? d.engine_output?.method ?? '') as string
      if (method !== 'all' && meth !== method) return false
      return true
    })
  }, [state, from, to, search, signal, method])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // counts for badge display
  const counts = useMemo(() => {
    if (state.status !== 'success') return { BUY: 0, SELL: 0, HOLD: 0 }
    return state.data.reduce((acc, d) => {
      const s = (d.engine_output?.signal ?? '') as string
      if (s === 'BUY' || s === 'SELL' || s === 'HOLD') acc[s]++
      return acc
    }, { BUY: 0, SELL: 0, HOLD: 0 } as Record<string, number>)
  }, [state])

  const signalColor = (s: string) => s === 'BUY' ? 'var(--secondary)' : s === 'SELL' ? 'var(--tertiary)' : 'var(--warning)'

  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Audit" subtitle="Decision engine logs — inspect ML inputs, scores, and outputs." />

      {/* Signal summary strip */}
      {state.status === 'success' && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {(['BUY', 'SELL', 'HOLD'] as const).map(s => (
            <div key={s} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
              background: `color-mix(in srgb, ${signalColor(s)} 12%, var(--surface-container))`,
              border: `1px solid color-mix(in srgb, ${signalColor(s)} 30%, transparent)`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: signalColor(s), flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 700, color: signalColor(s) }}>{s}</span>
              <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface)' }}>{counts[s]}</span>
            </div>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)', alignSelf: 'center' }}>
            {filtered.length} of {state.data.length} decisions
          </span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Date + search row */}
        <div className="cluster cluster-3" style={{ alignItems: 'end', flexWrap: 'wrap' }}>
          <div className="stack stack-1">
            <Label htmlFor="audit-from">From</Label>
            <Input id="audit-from" type="date" value={from} max={to} onChange={e => { setFrom(e.target.value); setPage(1) }} />
          </div>
          <div className="stack stack-1">
            <Label htmlFor="audit-to">To</Label>
            <Input id="audit-to" type="date" value={to} min={from} max={today} onChange={e => { setTo(e.target.value); setPage(1) }} />
          </div>
          <div className="stack stack-1" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
            <Label htmlFor="audit-search">Ticker</Label>
            <Input id="audit-search" placeholder="Search ticker…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>

        {/* Signal + method filter chips */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', marginRight: 4 }}>Signal:</span>
          {SIGNAL_FILTERS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => { setSignal(f); setPage(1) }}
              className={`btn btn-sm ${signal === f ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', fontWeight: signal === f ? 700 : 400 }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}

          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', marginLeft: 'var(--space-3)', marginRight: 4 }}>Method:</span>
          {METHOD_FILTERS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => { setMethod(f); setPage(1) }}
              className={`btn btn-sm ${method === f ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'loading' || state.status === 'idle') && (
        <div className="stack stack-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      )}
      {state.status === 'success' && paginated.length === 0 && (
        <EmptyState
          title={state.data.length === 0 ? 'No decision logs' : 'No matches'}
          description={state.data.length === 0 ? 'No decisions have been logged yet.' : 'Try widening the date range or clearing filters.'}
        />
      )}
      {state.status === 'success' && paginated.length > 0 && (
        <div className="stack stack-2">
          {paginated.map(d => <AuditRow key={d.id} d={d} />)}
        </div>
      )}

      {/* Pagination */}
      {state.status === 'success' && totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
          <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const p = i + 1
            return (
              <button
                key={p}
                className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`}
                style={{ minWidth: 36, borderRadius: 'var(--radius-sm)' }}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          })}
          {totalPages > 7 && <span style={{ color: 'var(--on-surface-muted)' }}>… {totalPages}</span>}
          <button className="btn btn-sm btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}

export function AuditPagePreview() {
  const d: DecisionItem = {
    id: 1,
    ticker_symbol: 'AAPL',
    timestamp: new Date().toISOString(),
    input_summary: { bullish_ratio: 0.72, normalized_index: 0.65, post_count: 1240 },
    scoring_detail: { rule_score: 0.60, ml_confidence: 0.84, method: 'xgboost' },
    engine_output: { signal: 'BUY', confidence: 0.84, method: 'xgboost' },
    alerts_triggered: [],
  }
  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Audit" subtitle="Decision engine logs — inspect ML inputs, scores, and outputs." />
      <AuditRow d={d} />
    </div>
  )
}
