import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface Bucket { ts: string; signal: number; price_change: number }
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

const PALETTE = [
  'hsl(158, 60%, 45%)', 'hsl(220, 65%, 55%)', 'hsl(38, 88%, 50%)',
  'hsl(280, 60%, 55%)', 'hsl(4, 68%, 50%)',  'hsl(190, 60%, 50%)',
  'hsl(330, 65%, 55%)', 'hsl(100, 50%, 45%)',
]

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
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

  const series = state.status === 'success'
    ? state.data.rows.map((r, i) => ({
        name:  r.ticker,
        color: PALETTE[i % PALETTE.length],
        data:  r.buckets.map(b => ({
          signal: b.signal,
          priceChange: b.price_change * 100,
          ts: b.ts,
        })),
      }))
    : []

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
              background: 'var(--surface-container-lowest)',
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
      {state.status === 'success' && series.every(s => s.data.length === 0) && (
        <EmptyState title="No data" description="Try different symbols or a longer window." />
      )}
      {state.status === 'success' && series.some(s => s.data.length > 0) && (
        <div className="card stack stack-3">
          <span style={SECTION_LABEL}>Signal Index vs Price Change ({window})</span>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 16, right: 16, bottom: 32, left: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,15%,45%,0.22)" />
              <XAxis
                dataKey="signal"
                type="number"
                domain={[-1, 1]}
                name="Signal"
                tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }}
                tickFormatter={v => v.toFixed(1)}
                label={{ value: 'Signal Index (−1 bear → +1 bull)', position: 'insideBottom', offset: -16, fill: 'hsl(220,10%,58%)', fontSize: 11 }}
              />
              <YAxis
                dataKey="priceChange"
                type="number"
                name="Price Δ"
                tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }}
                tickFormatter={v => `${v.toFixed(0)}%`}
                label={{ value: 'Cumulative price change (%)', angle: -90, position: 'insideLeft', fill: 'hsl(220,10%,58%)', fontSize: 11 }}
              />
              <ZAxis range={[40, 40]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-body-sm)' }}
                formatter={(v: number, n: string) => [n === 'Signal' ? v.toFixed(3) : `${v.toFixed(2)}%`, n]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {series.map(s => (
                <Scatter key={s.name} name={s.name} data={s.data} fill={s.color} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textAlign: 'center', margin: 0 }}>
            Top-right quadrant = bullish signal preceded a price rise (model agreed with market).
            Bottom-left = bearish signal preceded a fall.
            Off-diagonals = the model disagreed.
          </p>
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
