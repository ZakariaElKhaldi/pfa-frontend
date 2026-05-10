import { useMemo, useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useData } from '@/hooks/useApi'
import { Icons } from '@/components/design-system'
import { PageMeta } from '@/components/common/PageMeta'

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
const today = isoDay(new Date())

const DATE_PRESETS = [
  { label: 'Today',  start: today,                                        end: today },
  { label: '7D',     start: isoDay(new Date(Date.now() - 7 * 86_400_000)),  end: today },
  { label: '30D',    start: isoDay(new Date(Date.now() - 30 * 86_400_000)), end: today },
  { label: 'All',    start: '2020-01-01',                                   end: today },
]

const METHOD_FILTERS = ['all', 'rule_based', 'xgboost', 'ensemble'] as const
const PAGE_SIZE = 20

const METHOD_COLOR: Record<string, string> = {
  rule_based: 'hsl(38, 88%, 50%)',
  xgboost:    'hsl(280, 60%, 55%)',
  ensemble:   'hsl(190, 60%, 50%)',
}

const signalColor = (s: string) =>
  s === 'BUY' ? 'var(--secondary)' : s === 'SELL' ? 'var(--tertiary)' : 'var(--warning)'

// ── Confidence Bar ──────────────────────────────────────────────────────
function ConfBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.min(100, Math.max(0, value * 100))
  const color = pct >= 70 ? 'var(--secondary)' : pct >= 45 ? 'var(--warning)' : 'var(--tertiary)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {label && <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', minWidth: 80, textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</span>}
      <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--surface-container-high)' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: color, transition: 'width 0.4s var(--ease-out)' }} />
      </div>
      <span style={{ fontSize: 'var(--text-mono-sm)', color, fontWeight: 600, fontFamily: 'var(--font-mono)', minWidth: 36, textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

// ── Stat Card ───────────────────────────────────────────────────────────
function StatCard({ label, value, color, active, onClick }: {
  label: string; value: number; color: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, minWidth: 120, padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
        background: active ? `color-mix(in srgb, ${color} 15%, var(--surface-container))` : 'var(--surface-container)',
        border: `2px solid ${active ? color : 'transparent'}`,
        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
        display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 'var(--text-display-sm)', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: active ? color : 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </button>
  )
}

// ── Audit Row ───────────────────────────────────────────────────────────
function AuditRow({ d }: { d: DecisionItem }) {
  const [open, setOpen] = useState(false)
  const signal = (d.engine_output?.signal ?? d.scoring_detail?.signal ?? '') as string
  const conf = typeof d.engine_output?.confidence === 'number' ? d.engine_output.confidence : null
  const method = (d.scoring_detail?.method ?? d.engine_output?.method ?? '') as string
  const sc = signalColor(signal)
  const mc = METHOD_COLOR[method] ?? 'var(--on-surface-muted)'

  const timeStr = new Date(d.timestamp).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{
      background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
      overflow: 'hidden', borderLeft: `3px solid ${sc}`,
      transition: 'box-shadow 0.15s',
      boxShadow: open ? 'var(--shadow-sm)' : 'none',
    }}>
      <button
        type="button" onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-body-sm)', color: 'var(--on-surface)', minWidth: 48, textAlign: 'center' }}>
          {d.ticker_symbol}
        </span>

        {signal && (
          <span style={{
            fontSize: 'var(--text-label-sm)', fontWeight: 700, padding: '2px 10px',
            borderRadius: 'var(--radius-full)', background: `color-mix(in srgb, ${sc} 15%, transparent)`,
            color: sc, letterSpacing: '0.05em',
          }}>
            {signal}
          </span>
        )}

        {method && (
          <span style={{
            fontSize: 'var(--text-label-sm)', fontWeight: 500, padding: '2px 8px',
            borderRadius: 'var(--radius-sm)', background: `color-mix(in srgb, ${mc} 12%, transparent)`,
            color: mc,
          }}>
            {method.replace(/_/g, ' ')}
          </span>
        )}

        {conf !== null && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 60, maxWidth: 160 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--surface-container-high)' }}>
              <div style={{ height: '100%', width: `${conf * 100}%`, borderRadius: 999, background: sc, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-muted)', flexShrink: 0 }}>
              {(conf * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {d.alerts_triggered?.length > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px',
            borderRadius: 'var(--radius-full)', background: 'color-mix(in srgb, var(--tertiary) 12%, transparent)',
            color: 'var(--tertiary)', fontSize: 'var(--text-label-sm)', fontWeight: 600,
          }}>
            <Icons.AlertTriangle size={11} /> {d.alerts_triggered.length}
          </span>
        )}

        <time style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 'auto' }}>
          {timeStr}
        </time>

        <Icons.ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' } as React.CSSProperties} />
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--outline-variant)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {d.alerts_triggered?.length > 0 && (
            <div className="stack stack-2">
              <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Alerts Triggered</span>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {d.alerts_triggered.map((a, i) => (
                  <span key={i} style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'color-mix(in srgb, var(--tertiary) 12%, transparent)', color: 'var(--tertiary)', fontSize: 'var(--text-label-sm)', fontWeight: 500 }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            <PayloadPanel data={d.input_summary} label="Input Summary" />
            <PayloadPanel data={d.scoring_detail} label="Scoring Detail" />
            <PayloadPanel data={d.engine_output} label="Engine Output" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Payload Panel ───────────────────────────────────────────────────────
function PayloadPanel({ data, label }: { data: Record<string, unknown>; label: string }) {
  const entries = Object.entries(data)
  if (entries.length === 0) return null
  return (
    <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
      <div style={{
        padding: 'var(--space-2) var(--space-3)', background: 'var(--surface-container-high)',
        fontSize: 'var(--text-label-sm)', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: 'var(--on-surface-muted)',
      }}>
        {label}
      </div>
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {entries.map(([k, v]) => {
          const num = typeof v === 'number' ? v : null
          if (num !== null && num >= 0 && num <= 1) return <ConfBar key={k} value={num} label={k} />
          const isSignal = typeof v === 'string' && ['BUY', 'SELL', 'HOLD'].includes(v)
          return (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
              <span style={{
                fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', fontWeight: 600,
                color: isSignal ? signalColor(v as string) : 'var(--on-surface)',
                background: isSignal ? `color-mix(in srgb, ${signalColor(v as string)} 12%, transparent)` : 'transparent',
                padding: isSignal ? '1px 8px' : undefined, borderRadius: 'var(--radius-sm)',
              }}>
                {typeof v === 'number' ? v.toFixed(4) : String(v ?? '—')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────
export function AuditPage() {
  const { state, refetch } = useData<DecisionItem[]>('/api/audit/decisions/')
  useData<Array<{ symbol: string }>>('/api/tickers/')

  const [datePreset, setDatePreset] = useState(1) // default 7D
  const [from, setFrom] = useState(DATE_PRESETS[1].start)
  const [to, setTo]     = useState(today)
  const [ticker, setTicker] = useState('all')
  const [signal, setSignal] = useState<'all' | 'BUY' | 'SELL' | 'HOLD'>('all')
  const [method, setMethod] = useState<'all' | 'rule_based' | 'xgboost' | 'ensemble'>('all')
  const [page, setPage]     = useState(1)

  // Sync date preset
  useEffect(() => {
    const p = DATE_PRESETS[datePreset]
    if (p) { setFrom(p.start); setTo(p.end); setPage(1) }
  }, [datePreset])

  const tickerSymbols = useMemo(() => {
    if (state.status !== 'success') return []
    return [...new Set(state.data.map(d => d.ticker_symbol))].sort()
  }, [state])

  const filtered = useMemo(() => {
    if (state.status !== 'success') return [] as DecisionItem[]
    const fromT = new Date(from + 'T00:00:00').getTime()
    const toT = new Date(to + 'T23:59:59').getTime()
    return state.data.filter(d => {
      const t = new Date(d.timestamp).getTime()
      if (Number.isFinite(fromT) && t < fromT) return false
      if (Number.isFinite(toT) && t > toT) return false
      if (ticker !== 'all' && d.ticker_symbol !== ticker) return false
      const sig = (d.engine_output?.signal ?? d.scoring_detail?.signal ?? '') as string
      if (signal !== 'all' && sig !== signal) return false
      const meth = (d.scoring_detail?.method ?? d.engine_output?.method ?? '') as string
      if (method !== 'all' && meth !== method) return false
      return true
    })
  }, [state, from, to, ticker, signal, method])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const counts = useMemo(() => {
    if (state.status !== 'success') return { BUY: 0, SELL: 0, HOLD: 0, total: 0 }
    const c = { BUY: 0, SELL: 0, HOLD: 0, total: state.data.length }
    state.data.forEach(d => {
      const s = (d.engine_output?.signal ?? '') as string
      if (s === 'BUY' || s === 'SELL' || s === 'HOLD') c[s]++
    })
    return c
  }, [state])

  const avgConfidence = useMemo(() => {
    if (filtered.length === 0) return null
    const vals = filtered.map(d => typeof d.engine_output?.confidence === 'number' ? d.engine_output.confidence : null).filter(Boolean) as number[]
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }, [filtered])

  const rangeStart = (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length)

  return (
    <div className="p-6 stack stack-5">
      <PageMeta title="Audit" description="Decision engine logs." />
      <PageHeader title="Audit Trail" subtitle="Inspect every ML decision — inputs, scoring, and outputs." />

      {/* Signal stat cards — clickable to filter */}
      {state.status === 'success' && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <StatCard label="All" value={counts.total} color="var(--primary)" active={signal === 'all'} onClick={() => { setSignal('all'); setPage(1) }} />
          <StatCard label="Buy" value={counts.BUY} color="var(--secondary)" active={signal === 'BUY'} onClick={() => { setSignal('BUY'); setPage(1) }} />
          <StatCard label="Sell" value={counts.SELL} color="var(--tertiary)" active={signal === 'SELL'} onClick={() => { setSignal('SELL'); setPage(1) }} />
          <StatCard label="Hold" value={counts.HOLD} color="var(--warning)" active={signal === 'HOLD'} onClick={() => { setSignal('HOLD'); setPage(1) }} />
          {avgConfidence !== null && (
            <div style={{
              flex: 1, minWidth: 140, padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-container)', textAlign: 'center',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', alignItems: 'center',
            }}>
              <span style={{ fontSize: 'var(--text-display-sm)', fontWeight: 800, color: avgConfidence >= 0.7 ? 'var(--secondary)' : 'var(--warning)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {(avgConfidence * 100).toFixed(0)}%
              </span>
              <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Avg Confidence
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Row 1: date presets + custom dates + ticker */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'end', flexWrap: 'wrap' }}>
          {/* Date presets */}
          <div className="stack stack-1">
            <Label>Period</Label>
            <div style={{ display: 'flex', gap: 2, background: 'var(--surface-container-high)', padding: 2, borderRadius: 'var(--radius-md)' }}>
              {DATE_PRESETS.map((p, i) => (
                <button
                  key={p.label} type="button"
                  onClick={() => setDatePreset(i)}
                  style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                    fontSize: 'var(--text-label-sm)', fontWeight: datePreset === i ? 700 : 400,
                    background: datePreset === i ? 'var(--primary)' : 'transparent',
                    color: datePreset === i ? 'var(--on-primary)' : 'var(--on-surface-muted)',
                    transition: 'all 0.12s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="stack stack-1" style={{ minWidth: 130 }}>
            <Label htmlFor="a-from" style={{ fontSize: 'var(--text-label-sm)' }}>From</Label>
            <Input id="a-from" type="date" value={from} max={to} onChange={e => { setFrom(e.target.value); setPage(1) }} />
          </div>
          <div className="stack stack-1" style={{ minWidth: 130 }}>
            <Label htmlFor="a-to" style={{ fontSize: 'var(--text-label-sm)' }}>To</Label>
            <Input id="a-to" type="date" value={to} min={from} max={today} onChange={e => { setTo(e.target.value); setPage(1) }} />
          </div>

          {/* Ticker dropdown */}
          <div className="stack stack-1" style={{ minWidth: 140 }}>
            <Label>Ticker</Label>
            <Select value={ticker} onValueChange={v => { if (v) { setTicker(v); setPage(1) } }}>
              <SelectTrigger style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                <SelectValue placeholder="All tickers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tickers</SelectItem>
                {tickerSymbols.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Method dropdown */}
          <div className="stack stack-1" style={{ minWidth: 140 }}>
            <Label>Method</Label>
            <Select value={method} onValueChange={v => { setMethod(v as typeof method); setPage(1) }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHOD_FILTERS.map(f => (
                  <SelectItem key={f} value={f}>{f === 'all' ? 'All methods' : f.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
            Showing {filtered.length === 0 ? 0 : rangeStart}–{rangeEnd} of {filtered.length} decisions
            {state.status === 'success' && filtered.length !== state.data.length && ` (filtered from ${state.data.length})`}
          </span>
          {(ticker !== 'all' || signal !== 'all' || method !== 'all') && (
            <button
              type="button"
              onClick={() => { setTicker('all'); setSignal('all'); setMethod('all'); setPage(1) }}
              className="btn btn-sm btn-ghost"
              style={{ borderRadius: 'var(--radius-full)', fontSize: 'var(--text-label-sm)' }}
            >
              Clear filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'loading' || state.status === 'idle') && (
        <div className="stack stack-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      )}
      {state.status === 'success' && paginated.length === 0 && (
        <EmptyState
          title={state.data.length === 0 ? 'No decision logs' : 'No matches'}
          description={state.data.length === 0 ? 'Decisions will appear after the next pipeline run.' : 'Try widening the date range or clearing filters.'}
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
              <button key={p} className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`}
                style={{ minWidth: 36, borderRadius: 'var(--radius-sm)' }} onClick={() => setPage(p)}>
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
    id: 1, ticker_symbol: 'AAPL', timestamp: new Date().toISOString(),
    input_summary: { bullish_ratio: 0.72, normalized_index: 0.65, post_count: 1240 },
    scoring_detail: { rule_score: 0.60, ml_confidence: 0.84, method: 'xgboost' },
    engine_output: { signal: 'BUY', confidence: 0.84, method: 'xgboost' },
    alerts_triggered: [],
  }
  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Audit" subtitle="Decision engine logs." />
      <AuditRow d={d} />
    </div>
  )
}
