import { useState, useCallback, type FormEvent } from 'react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { MetricCard } from '@/components/cards/MetricCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'

type StrategyType = 'signal' | 'sentiment_threshold'
type RunStatus    = 'ok' | 'error'

interface BacktestRun {
  id: number
  ticker_symbol: string
  strategy: StrategyType
  params: Record<string, unknown>
  window_start: string
  window_end:   string
  win_rate:     number | null
  sharpe:       number | null
  max_drawdown: number | null
  total_return: number | null
  trades:       Array<{ ts: string; side: 'buy' | 'sell'; price: number }>
  equity_curve: Array<{ ts: string; equity: number }>
  status:       RunStatus
  error_message: string
  created_at:   string
}

interface FormState {
  symbol:   string
  strategy: StrategyType
  start:    string
  end:      string
  threshold: string
}

const today    = new Date().toISOString().slice(0, 10)
const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

export function BacktestPage() {
  const { state: history, refetch } = useData<BacktestRun[]>('/api/analytics/backtest/')
  const [form, setForm]             = useState<FormState>({ symbol: '', strategy: 'signal', start: monthAgo, end: today, threshold: '0.6' })
  const [running, setRunning]       = useState(false)
  const [selected, setSelected]     = useState<BacktestRun | null>(null)

  const handleRun = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!form.symbol.trim()) {
      toast.error('Symbol is required')
      return
    }
    setRunning(true)
    try {
      const params = form.strategy === 'sentiment_threshold' ? { threshold: parseFloat(form.threshold) || 0.6 } : {}
      const run = await api.post<BacktestRun>('/api/analytics/backtest/', {
        symbol:   form.symbol.toUpperCase().trim(),
        strategy: form.strategy,
        start:    new Date(form.start).toISOString(),
        end:      new Date(form.end).toISOString(),
        params,
      })
      toast.success(`Backtest complete — ${(run.total_return ?? 0) >= 0 ? '+' : ''}${((run.total_return ?? 0) * 100).toFixed(2)}%`)
      setSelected(run)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Backtest failed')
    } finally {
      setRunning(false)
    }
  }, [form, refetch])

  const equityPoints = (selected?.equity_curve ?? []).map(p => ({
    label:  new Date(p.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    equity: p.equity,
  }))

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Backtest" subtitle="Run trading strategies against historical data." />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 2fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Form */}
        <form onSubmit={handleRun} className="card stack stack-4">
          <span style={SECTION_LABEL}>New Backtest</span>

          <div className="stack stack-1">
            <Label htmlFor="bt-symbol">Symbol</Label>
            <Input
              id="bt-symbol"
              placeholder="AAPL"
              value={form.symbol}
              onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
              autoCapitalize="characters"
              required
              disabled={running}
            />
          </div>

          <div className="stack stack-1">
            <Label htmlFor="bt-strategy">Strategy</Label>
            <select
              id="bt-strategy"
              value={form.strategy}
              onChange={e => setForm(f => ({ ...f, strategy: e.target.value as StrategyType }))}
              disabled={running}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'var(--surface-container-lowest)',
                color: 'var(--on-surface)',
                fontSize: 'var(--text-body-md)',
              }}
            >
              <option value="signal">Follow Signal</option>
              <option value="sentiment_threshold">Sentiment Threshold</option>
            </select>
          </div>

          {form.strategy === 'sentiment_threshold' && (
            <div className="stack stack-1">
              <Label htmlFor="bt-threshold">Bullish Threshold (0–1)</Label>
              <Input
                id="bt-threshold" type="number" step="0.05" min="0" max="1"
                value={form.threshold}
                onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
                disabled={running}
              />
            </div>
          )}

          <div className="cluster cluster-3">
            <div className="stack stack-1" style={{ flex: 1 }}>
              <Label htmlFor="bt-start">Start</Label>
              <Input id="bt-start" type="date" value={form.start} max={form.end} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} disabled={running} />
            </div>
            <div className="stack stack-1" style={{ flex: 1 }}>
              <Label htmlFor="bt-end">End</Label>
              <Input id="bt-end" type="date" value={form.end} min={form.start} max={today} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} disabled={running} />
            </div>
          </div>

          <Button type="submit" disabled={running}>
            {running ? 'Running…' : 'Run Backtest'}
          </Button>
        </form>

        {/* Result + history */}
        <div className="stack stack-5">
          {selected ? <BacktestResult run={selected} equityPoints={equityPoints} onClose={() => setSelected(null)} /> : (
            <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--on-surface-muted)' }}>
              <span style={{ fontSize: 'var(--text-body-sm)' }}>Run a backtest to see metrics, equity curve, and trades.</span>
            </div>
          )}

          <div className="stack stack-3">
            <span style={SECTION_LABEL}>Recent Runs</span>
            {history.status === 'error'                                && <ErrorState message={history.message} onRetry={refetch} />}
            {(history.status === 'idle' || history.status === 'loading') && <Skeleton className="h-32 w-full" />}
            {history.status === 'success' && history.data.length === 0 && <EmptyState title="No backtests yet" description="Run your first backtest using the form on the left." />}
            {history.status === 'success' && history.data.length > 0 && (
              <div className="stack stack-2">
                {history.data.slice(0, 10).map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r)}
                    className="card cluster cluster-3"
                    style={{
                      justifyContent: 'space-between', alignItems: 'center',
                      padding: 'var(--space-3) var(--space-4)',
                      cursor: 'pointer',
                      border: selected?.id === r.id ? '1px solid var(--primary)' : '1px solid var(--outline-variant)',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div className="cluster cluster-3" style={{ alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.ticker_symbol}</span>
                      <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'capitalize' }}>
                        {r.strategy.replace('_', ' ')}
                      </span>
                      {r.status === 'error' && (
                        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--tertiary)' }}>error</span>
                      )}
                    </div>
                    <div className="cluster cluster-3" style={{ alignItems: 'center' }}>
                      <span style={{
                        fontSize: 'var(--text-body-sm)', fontFamily: 'var(--font-mono)', fontWeight: 500,
                        color: (r.total_return ?? 0) >= 0 ? 'var(--secondary)' : 'var(--tertiary)',
                      }}>
                        {(r.total_return ?? 0) >= 0 ? '+' : ''}{((r.total_return ?? 0) * 100).toFixed(2)}%
                      </span>
                      <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BacktestResult({ run, equityPoints, onClose }: { run: BacktestRun; equityPoints: Array<{ label: string; equity: number }>; onClose: () => void }) {
  if (run.status === 'error') {
    return (
      <div className="card stack stack-3">
        <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={SECTION_LABEL}>Result · {run.ticker_symbol}</span>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
        </div>
        <ErrorState message={run.error_message || 'Backtest failed.'} />
      </div>
    )
  }

  const totalRet = run.total_return ?? 0
  return (
    <div className="card stack stack-4">
      <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="stack stack-1">
          <span style={SECTION_LABEL}>Result · {run.ticker_symbol}</span>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'capitalize' }}>
            {run.strategy.replace('_', ' ')} · {new Date(run.window_start).toLocaleDateString()} → {new Date(run.window_end).toLocaleDateString()}
          </span>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        <MetricCard
          label="Total Return"
          value={`${totalRet >= 0 ? '+' : ''}${(totalRet * 100).toFixed(2)}%`}
          delta={`${run.trades.length} trades`}
          positive={totalRet >= 0}
        />
        <MetricCard
          label="Win Rate"
          value={run.win_rate === null ? '—' : `${(run.win_rate * 100).toFixed(1)}%`}
          delta=""
          positive={(run.win_rate ?? 0) >= 0.5}
        />
        <MetricCard
          label="Sharpe"
          value={run.sharpe === null ? '—' : run.sharpe.toFixed(2)}
          delta=""
          positive={(run.sharpe ?? 0) >= 1}
        />
        <MetricCard
          label="Max Drawdown"
          value={run.max_drawdown === null ? '—' : `${(run.max_drawdown * 100).toFixed(2)}%`}
          delta=""
          positive={false}
        />
      </div>

      {equityPoints.length > 1 && (
        <div className="stack stack-2">
          <span style={SECTION_LABEL}>Equity Curve</span>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={equityPoints} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,15%,45%,0.22)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `$${Math.round(v).toLocaleString()}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-body-sm)' }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, 'Equity']}
              />
              <Line type="monotone" dataKey="equity" stroke="hsl(158, 60%, 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {run.trades.length > 0 && (
        <div className="stack stack-2">
          <span style={SECTION_LABEL}>Trades ({run.trades.length})</span>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-body-sm)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--on-surface-muted)' }}>
                  <th style={{ padding: 'var(--space-2)', fontWeight: 500 }}>When</th>
                  <th style={{ padding: 'var(--space-2)', fontWeight: 500 }}>Side</th>
                  <th style={{ padding: 'var(--space-2)', fontWeight: 500, textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {run.trades.map((t, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--outline-variant)' }}>
                    <td style={{ padding: 'var(--space-2)', color: 'var(--on-surface-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(t.ts).toLocaleString()}
                    </td>
                    <td style={{ padding: 'var(--space-2)', color: t.side === 'buy' ? 'var(--secondary)' : 'var(--tertiary)', textTransform: 'uppercase', fontWeight: 500 }}>
                      {t.side}
                    </td>
                    <td style={{ padding: 'var(--space-2)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      ${t.price.toFixed(2)}
                    </td>
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

export function BacktestPagePreview() {
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Backtest" subtitle="Run trading strategies against historical data." />
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--on-surface-muted)' }}>
        Interactive backtest workbench (form + history + result panel).
      </div>
    </div>
  )
}
