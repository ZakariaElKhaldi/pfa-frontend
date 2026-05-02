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

interface CorrelationResult {
  symbols: string[]
  matrix:  number[][]
}

type ApiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: CorrelationResult }
  | { status: 'error'; message: string }

const WINDOWS = [
  { value: '7d',  label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]
const METRICS = [
  { value: 'price',     label: 'Price' },
  { value: 'sentiment', label: 'Sentiment' },
] as const

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

function corrColor(v: number): string {
  if (Number.isNaN(v)) return 'var(--surface-container)'
  const clamped = Math.max(-1, Math.min(1, v))
  if (clamped >= 0) {
    const alpha = clamped * 0.85
    return `color-mix(in srgb, var(--secondary) ${alpha * 100}%, transparent)`
  }
  const alpha = -clamped * 0.85
  return `color-mix(in srgb, var(--tertiary) ${alpha * 100}%, transparent)`
}

export function CorrelationPage() {
  const [symbolsInput, setSymbolsInput] = useState('AAPL,TSLA,NVDA,MSFT')
  const [window, setWindow]             = useState('30d')
  const [metric, setMetric]             = useState<typeof METRICS[number]['value']>('price')
  const [state, setState]               = useState<ApiState>({ status: 'idle' })

  const fetchMatrix = useCallback(async () => {
    const symbols = symbolsInput
      .split(/[,\s]+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean)
    if (symbols.length < 2) {
      toast.error('Need at least 2 symbols')
      return
    }
    if (symbols.length > 10) {
      toast.error('Maximum 10 symbols allowed')
      return
    }
    setState({ status: 'loading' })
    try {
      const data = await api.get<CorrelationResult>(
        `/api/analytics/correlation/?symbols=${symbols.join(',')}&window=${window}&metric=${metric}`,
      )
      setState({ status: 'success', data })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to compute correlation'
      setState({ status: 'error', message: msg })
      toast.error(msg)
    }
  }, [symbolsInput, window, metric])

  useEffect(() => { fetchMatrix() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Correlation Matrix" subtitle="Pairwise correlation between tickers across price or sentiment series." />

      {/* Controls */}
      <div className="card cluster cluster-3" style={{ alignItems: 'end', flexWrap: 'wrap' }}>
        <div className="stack stack-1" style={{ flex: 2, minWidth: 240 }}>
          <Label htmlFor="corr-symbols">Symbols (comma or space separated, 2–10)</Label>
          <Input
            id="corr-symbols"
            placeholder="AAPL, TSLA, NVDA"
            value={symbolsInput}
            onChange={e => setSymbolsInput(e.target.value)}
            disabled={state.status === 'loading'}
          />
        </div>
        <div className="stack stack-1">
          <Label htmlFor="corr-window">Window</Label>
          <select
            id="corr-window"
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
        <div className="stack stack-1">
          <Label>Metric</Label>
          <div className="cluster cluster-2">
            {METRICS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMetric(m.value)}
                className={`btn btn-sm ${metric === m.value ? 'btn-primary' : 'btn-ghost'}`}
                disabled={state.status === 'loading'}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={fetchMatrix} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Computing…' : 'Compute'}
        </Button>
      </div>

      {/* Matrix */}
      {state.status === 'error'                                && <ErrorState message={state.message} onRetry={fetchMatrix} />}
      {(state.status === 'idle' || state.status === 'loading') && <Skeleton className="h-80 w-full" />}
      {state.status === 'success' && state.data.symbols.length === 0 && (
        <EmptyState title="No data" description="Try different symbols or a longer window." />
      )}
      {state.status === 'success' && state.data.symbols.length > 0 && (
        <div className="card stack stack-3">
          <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={SECTION_LABEL}>Pearson Correlation · {metric} · {window}</span>
            <Legend />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 4, fontSize: 'var(--text-body-sm)' }}>
              <thead>
                <tr>
                  <th />
                  {state.data.symbols.map(s => (
                    <th key={s} style={{ padding: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--on-surface-muted)', textAlign: 'center' }}>
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.data.matrix.map((row, i) => (
                  <tr key={state.data.symbols[i]}>
                    <th style={{ padding: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--on-surface-muted)', textAlign: 'right' }}>
                      {state.data.symbols[i]}
                    </th>
                    {row.map((v, j) => (
                      <td
                        key={j}
                        title={`${state.data.symbols[i]} ↔ ${state.data.symbols[j]}: ${v.toFixed(3)}`}
                        style={{
                          width: 56, height: 44,
                          background: corrColor(v),
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontVariantNumeric: 'tabular-nums',
                          color: Math.abs(v) > 0.5 ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                          fontWeight: i === j ? 600 : 400,
                        }}
                      >
                        {Number.isNaN(v) ? '—' : v.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function Legend() {
  return (
    <div className="cluster cluster-2" style={{ alignItems: 'center', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
      <span>−1</span>
      <div style={{ width: 80, height: 10, borderRadius: 'var(--radius-full)', background: 'linear-gradient(to right, var(--tertiary), var(--surface-container), var(--secondary))' }} />
      <span>+1</span>
    </div>
  )
}

export function CorrelationPagePreview() {
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Correlation Matrix" subtitle="Pairwise correlation between tickers across price or sentiment series." />
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--on-surface-muted)' }}>
        Compute correlation matrix for 2–10 tickers.
      </div>
    </div>
  )
}
