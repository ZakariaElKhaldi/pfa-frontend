import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface Bucket { ts: string; bucket_start?: string; signal: number | null; signal_avg?: number | null; price_change: number | null; count?: number }
interface HeatmapRow { ticker: string; buckets: Bucket[] }
interface HeatmapResult { rows: HeatmapRow[] }

type ApiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: HeatmapResult }
  | { status: 'error'; message: string }

const WINDOWS = [
  { value: '7d',  label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

function cellColor(bucket?: Bucket): string {
  if (!bucket || bucket.signal === null || bucket.price_change === null) return 'var(--surface-container)'
  const agreement = bucket.signal * bucket.price_change >= 0
  const strength = Math.min(85, Math.max(12, Math.abs(bucket.signal) * 55 + Math.abs(bucket.price_change) * 180))
  return agreement
    ? `color-mix(in srgb, var(--secondary) ${strength}%, var(--surface-container))`
    : `color-mix(in srgb, var(--tertiary) ${strength}%, var(--surface-container))`
}

export function HeatmapPage() {
  const [symbolsInput, setSymbolsInput] = useState('AAPL,TSLA,NVDA')
  const [window, setWindow]             = useState('30d')
  const [state, setState]               = useState<ApiState>({ status: 'idle' })

  const fetchHeatmap = useCallback(async () => {
    const symbols = symbolsInput.split(/[,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean)
    if (symbols.length === 0) {
      toast.error('Need at least 1 symbol')
      return
    }
    setState({ status: 'loading' })
    try {
      const data = await api.get<HeatmapResult>(`/api/analytics/signal-heatmap/?symbols=${symbols.join(',')}&window=${window}`)
      setState({ status: 'success', data })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to compute heatmap'
      setState({ status: 'error', message: msg })
      toast.error(msg)
    }
  }, [symbolsInput, window])

  useEffect(() => { fetchHeatmap() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const bucketKeys = state.status === 'success'
    ? Array.from(new Set(state.data.rows.flatMap(r => r.buckets.map(b => b.bucket_start ?? b.ts)))).sort()
    : []
  const bucketLabel = (ts: string) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Signal Heatmap" subtitle="Signal index vs price change — see how predictive the model is per ticker." />

      <div className="card cluster cluster-3" style={{ alignItems: 'end', flexWrap: 'wrap' }}>
        <div className="stack stack-1" style={{ flex: 2, minWidth: 240 }}>
          <Label htmlFor="hm-symbols">Symbols</Label>
          <Input id="hm-symbols" placeholder="AAPL, TSLA, NVDA" value={symbolsInput} onChange={e => setSymbolsInput(e.target.value)} disabled={state.status === 'loading'} />
        </div>
        <div className="stack stack-1">
          <Label htmlFor="hm-window">Window</Label>
          <select
            id="hm-window"
            value={window}
            onChange={e => setWindow(e.target.value)}
            disabled={state.status === 'loading'}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
              background: 'rgba(255,255,255,0.80)',
              color: 'var(--on-surface)',
              fontSize: 'var(--text-body-md)',
            }}
          >
            {WINDOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>
        <Button onClick={fetchHeatmap} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Computing…' : 'Compute'}
        </Button>
      </div>

      {state.status === 'error'                                && <ErrorState message={state.message} onRetry={fetchHeatmap} />}
      {(state.status === 'idle' || state.status === 'loading') && <Skeleton className="h-96 w-full" />}
      {state.status === 'success' && state.data.rows.every(r => r.buckets.length === 0) && (
        <EmptyState title="No data" description="Try different symbols or a longer window." />
      )}
      {state.status === 'success' && state.data.rows.some(r => r.buckets.length > 0) && (
        <div className="card stack stack-3" style={{ overflow: 'hidden' }}>
          <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={SECTION_LABEL}>Ticker × Day Signal Agreement ({window})</span>
            <div className="cluster cluster-2" style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--secondary)' }} />
              Aligned
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--tertiary)' }} />
              Diverged
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `88px repeat(${bucketKeys.length}, minmax(54px, 1fr))`, gap: 6, minWidth: Math.max(520, 88 + bucketKeys.length * 60) }}>
              <span />
              {bucketKeys.map(k => (
                <span key={k} style={{ textAlign: 'center', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>{bucketLabel(k)}</span>
              ))}
              {state.data.rows.map(row => {
                const byBucket = new Map(row.buckets.map(b => [b.bucket_start ?? b.ts, b]))
                return (
                  <div key={row.ticker} style={{ display: 'contents' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, alignSelf: 'center' }}>{row.ticker}</span>
                    {bucketKeys.map(k => {
                      const bucket = byBucket.get(k)
                      return (
                        <span
                          key={k}
                          title={bucket ? `${row.ticker} ${bucketLabel(k)} | signal ${bucket.signal?.toFixed(3) ?? '—'} | price ${bucket.price_change === null ? '—' : `${(bucket.price_change * 100).toFixed(2)}%`} | ${bucket.count ?? 0} snapshots` : 'No bucket data'}
                          style={{
                            minHeight: 42,
                            borderRadius: 'var(--radius-sm)',
                            background: cellColor(bucket),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-mono-sm)',
                            color: bucket ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                          }}
                        >
                          {bucket?.price_change == null ? '—' : `${(bucket.price_change * 100).toFixed(1)}%`}
                        </span>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function HeatmapPagePreview() {
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Signal Heatmap" subtitle="Signal index vs price change." />
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--on-surface-muted)' }}>
        Scatter plot of signal predictiveness per ticker.
      </div>
    </div>
  )
}
