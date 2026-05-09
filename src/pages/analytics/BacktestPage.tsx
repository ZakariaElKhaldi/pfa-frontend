import { useState, useCallback, type FormEvent, useMemo } from 'react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { MetricCard } from '@/components/cards/MetricCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { PageMeta } from '@/components/common/PageMeta'

type StrategyType = 'signal' | 'sentiment_threshold'
type RunStatus = 'ok' | 'error'

interface BacktestRun {
  id: number
  ticker_symbol: string
  strategy: StrategyType
  params: Record<string, unknown>
  window_start: string
  window_end: string
  win_rate: number | null
  sharpe: number | null
  max_drawdown: number | null
  total_return: number | null
  trades: Array<{ ts: string; side: 'buy' | 'sell'; price: number }>
  equity_curve: Array<{ ts: string; equity: number }>
  status: RunStatus
  error_message: string
  created_at: string
}

interface TickerItem { symbol: string; name: string }

interface FormState {
  symbol: string
  strategy: StrategyType
  start: string
  end: string
  threshold: string
}

const today = new Date().toISOString().slice(0, 10)
const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
const threeMonthAgo = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10)
const yearAgo = new Date(Date.now() - 365 * 86_400_000).toISOString().slice(0, 10)

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 600,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

const QUICK_PRESETS = [
  { label: '1M', start: monthAgo,     end: today },
  { label: '3M', start: threeMonthAgo, end: today },
  { label: '1Y', start: yearAgo,       end: today },
]

const STRATEGY_DESCRIPTIONS: Record<StrategyType, string> = {
  signal: 'Follows the ML signal engine — BUY in on BUY signals, exit on SELL/HOLD.',
  sentiment_threshold: 'Enters when bullish ratio ≥ threshold, exits when bearish ratio ≥ threshold.',
}

function formatEquityTooltip(value: ValueType | undefined, _name: NameType | undefined): [string, string] {
  const n = typeof value === 'number' ? value : Number(value ?? 0)
  return [`$${n.toFixed(2)}`, 'Equity']
}

function SignalDot({ trade, cx, cy }: { trade: { side: string }; cx?: number; cy?: number }) {
  const color = trade.side === 'buy' ? 'var(--secondary)' : 'var(--tertiary)'
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
}

export function BacktestPage() {
  const { state: history, refetch } = useData<BacktestRun[]>('/api/analytics/backtest/')
  const { state: tickers } = useData<TickerItem[]>('/api/tickers/')

  const [form, setForm] = useState<FormState>({
    symbol: '', strategy: 'signal', start: monthAgo, end: today, threshold: '0.6',
  })
  const [running, setRunning] = useState(false)
  const [selected, setSelected] = useState<BacktestRun | null>(null)

  const tickerOptions = tickers.status === 'success' ? tickers.data : []

  const handleRun = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!form.symbol.trim()) { toast.error('Select a ticker symbol'); return }
    setRunning(true)
    try {
      const params = form.strategy === 'sentiment_threshold'
        ? { threshold: parseFloat(form.threshold) || 0.6 }
        : {}
      const run = await api.post<BacktestRun>('/api/analytics/backtest/', {
        symbol: form.symbol.toUpperCase().trim(),
        strategy: form.strategy,
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
        params,
      })
      toast.success(`Backtest done — ${(run.total_return ?? 0) >= 0 ? '+' : ''}${((run.total_return ?? 0) * 100).toFixed(2)}%`)
      setSelected(run)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Backtest failed')
    } finally {
      setRunning(false)
    }
  }, [form, refetch])

  const equityPoints = useMemo(() => (selected?.equity_curve ?? []).map(p => ({
    label: new Date(p.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    equity: p.equity,
    ts: p.ts,
  })), [selected])

  // Find trade timestamps for annotation
  const buyTimes  = new Set((selected?.trades ?? []).filter(t => t.side === 'buy').map(t => t.ts))
  const sellTimes = new Set((selected?.trades ?? []).filter(t => t.side === 'sell').map(t => t.ts))

  return (
    <div className="p-6 stack stack-6">
      <PageMeta title="Backtest" description="Run trading strategies against historical data." />
      <PageHeader title="Backtest" subtitle="Simulate strategies on historical signals and price data." />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 2fr)', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* ── Form ──────────────────────────────────────────────────── */}
        <form onSubmit={handleRun} className="card stack stack-5">
          <span style={SECTION_LABEL}>Configure Run</span>

          {/* Ticker dropdown */}
          <div className="stack stack-1">
            <Label htmlFor="bt-symbol">Ticker Symbol</Label>
            {tickers.status === 'loading' ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={form.symbol}
                onValueChange={v => setForm(f => ({ ...f, symbol: v }))}
                disabled={running}
              >
                <SelectTrigger id="bt-symbol" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  <SelectValue placeholder="— Select ticker —" />
                </SelectTrigger>
                <SelectContent>
                  {tickerOptions.map(t => (
                    <SelectItem key={t.symbol} value={t.symbol}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginRight: 8 }}>{t.symbol}</span>
                      <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)' }}>{t.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Strategy */}
          <div className="stack stack-2">
            <Label htmlFor="bt-strategy">Strategy</Label>
            <Select
              value={form.strategy}
              onValueChange={v => setForm(f => ({ ...f, strategy: v as StrategyType }))}
              disabled={running}
            >
              <SelectTrigger id="bt-strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signal">Follow ML Signal</SelectItem>
                <SelectItem value="sentiment_threshold">Sentiment Threshold</SelectItem>
              </SelectContent>
            </Select>
            {/* Strategy description */}
            <p style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', margin: 0 }}>
              {STRATEGY_DESCRIPTIONS[form.strategy]}
            </p>
          </div>

          {/* Threshold (only for sentiment_threshold) */}
          {form.strategy === 'sentiment_threshold' && (
            <div className="stack stack-2">
              <Label htmlFor="bt-threshold">Bullish Threshold</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <input
                  id="bt-threshold"
                  type="range"
                  min="0.5" max="0.9" step="0.05"
                  value={form.threshold}
                  onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
                  disabled={running}
                  style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-headline-sm)',
                  color: 'var(--primary)', minWidth: 44, textAlign: 'right',
                }}>
                  {(parseFloat(form.threshold) * 100).toFixed(0)}%
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', margin: 0 }}>
                Buy when bullish ≥ {(parseFloat(form.threshold) * 100).toFixed(0)}% · Sell when ≤ {((1 - parseFloat(form.threshold)) * 100).toFixed(0)}%
              </p>
            </div>
          )}

          {/* Date range */}
          <div className="stack stack-2">
            <Label>Date Range</Label>

            {/* Quick presets */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {QUICK_PRESETS.map(p => {
                const active = form.start === p.start && form.end === p.end
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, start: p.start, end: p.end }))}
                    disabled={running}
                    style={{
                      padding: '3px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`,
                      background: active ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent',
                      color: active ? 'var(--primary)' : 'var(--on-surface-muted)',
                      fontSize: 'var(--text-label-sm)',
                      fontWeight: active ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>

            <div className="cluster cluster-3">
              <div className="stack stack-1" style={{ flex: 1 }}>
                <Label htmlFor="bt-start" style={{ fontSize: 'var(--text-label-sm)' }}>From</Label>
                <Input id="bt-start" type="date" value={form.start} max={form.end}
                  onChange={e => setForm(f => ({ ...f, start: e.target.value }))} disabled={running} />
              </div>
              <div className="stack stack-1" style={{ flex: 1 }}>
                <Label htmlFor="bt-end" style={{ fontSize: 'var(--text-label-sm)' }}>To</Label>
                <Input id="bt-end" type="date" value={form.end} min={form.start} max={today}
                  onChange={e => setForm(f => ({ ...f, end: e.target.value }))} disabled={running} />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={running || !form.symbol} style={{ width: '100%' }}>
            {running
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Running…
                </span>
              : '▶ Run Backtest'}
          </Button>
        </form>

        {/* ── Results + History ───────────────────────────────────────── */}
        <div className="stack stack-5">
          {selected
            ? <BacktestResult run={selected} equityPoints={equityPoints} buyTimes={buyTimes} sellTimes={sellTimes} onClose={() => setSelected(null)} />
            : (
              <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--on-surface-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 32, opacity: 0.4 }}>📈</span>
                <span style={{ fontSize: 'var(--text-body-sm)' }}>Configure and run a backtest to see metrics, equity curve, and trades.</span>
              </div>
            )
          }

          {/* Recent Runs */}
          <div className="stack stack-3">
            <span style={SECTION_LABEL}>Recent Runs</span>
            {history.status === 'error' && <ErrorState message={history.message} onRetry={refetch} />}
            {(history.status === 'idle' || history.status === 'loading') && <Skeleton className="h-32 w-full" />}
            {history.status === 'success' && history.data.length === 0 && (
              <EmptyState title="No backtests yet" description="Run your first backtest using the form on the left." />
            )}
            {history.status === 'success' && history.data.length > 0 && (
              <div className="stack stack-2">
                {history.data.slice(0, 10).map(r => {
                  const ret = r.total_return ?? 0
                  const isPos = ret >= 0
                  const active = selected?.id === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelected(r)}
                      className="card"
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--space-3) var(--space-4)', cursor: 'pointer', gap: 'var(--space-3)',
                        borderLeft: `3px solid ${active ? 'var(--primary)' : isPos ? 'var(--secondary)' : 'var(--tertiary)'}`,
                        border: active ? '1px solid var(--primary)' : '1px solid var(--outline-variant)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div className="cluster cluster-3" style={{ alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-body-sm)' }}>{r.ticker_symbol}</span>
                        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'capitalize' }}>
                          {r.strategy.replace('_', ' ')}
                        </span>
                        {r.status === 'error' && (
                          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--tertiary)', background: 'color-mix(in srgb, var(--tertiary) 12%, transparent)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>error</span>
                        )}
                      </div>
                      <div className="cluster cluster-2" style={{ alignItems: 'center' }}>
                        <span style={{
                          fontSize: 'var(--text-body-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: isPos ? 'var(--secondary)' : 'var(--tertiary)',
                          background: `color-mix(in srgb, ${isPos ? 'var(--secondary)' : 'var(--tertiary)'} 10%, transparent)`,
                          padding: '1px 8px', borderRadius: 'var(--radius-full)',
                        }}>
                          {isPos ? '+' : ''}{(ret * 100).toFixed(2)}%
                        </span>
                        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function BacktestResult({
  run, equityPoints, buyTimes, sellTimes, onClose,
}: {
  run: BacktestRun
  equityPoints: Array<{ label: string; equity: number; ts: string }>
  buyTimes: Set<string>
  sellTimes: Set<string>
  onClose: () => void
}) {
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
  const isPos = totalRet >= 0
  const sharpe = run.sharpe ?? 0

  return (
    <div className="card stack stack-5">
      {/* Header */}
      <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stack stack-1">
          <span style={SECTION_LABEL}>Result · {run.ticker_symbol}</span>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'capitalize' }}>
            {run.strategy.replace('_', ' ')} · {new Date(run.window_start).toLocaleDateString()} → {new Date(run.window_end).toLocaleDateString()}
          </span>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        <MetricCard
          label="Total Return"
          value={`${isPos ? '+' : ''}${(totalRet * 100).toFixed(2)}%`}
          delta={`${run.trades.length} trades`}
          positive={isPos}
        />
        <MetricCard
          label="Win Rate"
          value={run.win_rate === null ? '—' : `${(run.win_rate * 100).toFixed(1)}%`}
          delta={(run.win_rate ?? 0) >= 0.5 ? 'Profitable' : 'Below 50%'}
          positive={(run.win_rate ?? 0) >= 0.5}
        />
        <MetricCard
          label="Sharpe Ratio"
          value={run.sharpe === null ? '—' : sharpe.toFixed(2)}
          delta={sharpe >= 1 ? 'Good' : sharpe >= 0 ? 'Low' : 'Negative'}
          positive={sharpe >= 1}
        />
        <MetricCard
          label="Max Drawdown"
          value={run.max_drawdown === null ? '—' : `${((run.max_drawdown) * 100).toFixed(2)}%`}
          delta="Peak-to-trough"
          positive={false}
        />
      </div>

      {/* Equity Curve */}
      {equityPoints.length > 1 && (
        <div className="stack stack-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={SECTION_LABEL}>Equity Curve</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-label-sm)', color: 'var(--secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)' }} /> Buy
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-label-sm)', color: 'var(--tertiary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--tertiary)' }} /> Sell
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={equityPoints} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,15%,45%,0.18)" vertical={false} />
              <ReferenceLine y={10000} stroke="hsla(220,15%,45%,0.4)" strokeDasharray="4 4" label={{ value: 'Start', position: 'left', fontSize: 10, fill: 'var(--on-surface-muted)' }} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `$${Math.round(v).toLocaleString()}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-body-sm)' }}
                formatter={formatEquityTooltip}
              />
              <Line
                type="monotone" dataKey="equity"
                stroke={isPos ? 'hsl(158, 60%, 45%)' : 'hsl(4, 68%, 50%)'}
                strokeWidth={2} dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trades table */}
      {run.trades.length > 0 && (
        <div className="stack stack-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={SECTION_LABEL}>Trades ({run.trades.length})</span>
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
              {run.trades.filter(t => t.side === 'buy').length} buys · {run.trades.filter(t => t.side === 'sell').length} sells
            </span>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-body-sm)' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-container-high)', zIndex: 1 }}>
                <tr style={{ textAlign: 'left', color: 'var(--on-surface-muted)' }}>
                  <th style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 500 }}>When</th>
                  <th style={{ padding: 'var(--space-2)', fontWeight: 500 }}>Side</th>
                  <th style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 500, textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {run.trades.map((t, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--outline-variant)', background: i % 2 === 0 ? 'transparent' : 'var(--surface-container)' }}>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--on-surface-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-label-sm)' }}>
                      {new Date(t.ts).toLocaleString()}
                    </td>
                    <td style={{ padding: 'var(--space-2)' }}>
                      <span style={{
                        fontSize: 'var(--text-label-sm)', fontWeight: 700, padding: '1px 8px',
                        borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
                        color: t.side === 'buy' ? 'var(--secondary)' : 'var(--tertiary)',
                        background: t.side === 'buy' ? 'color-mix(in srgb, var(--secondary) 12%, transparent)' : 'color-mix(in srgb, var(--tertiary) 12%, transparent)',
                      }}>
                        {t.side}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
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
