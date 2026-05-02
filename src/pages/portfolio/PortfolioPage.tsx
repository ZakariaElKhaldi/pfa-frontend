import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { PortfolioSummaryCard } from '@/components/cards/PortfolioSummaryCard'
import { PositionsTable } from '@/components/cards/PositionsTable'
import { TradeHistoryTable } from '@/components/cards/TradeHistoryTable'
import { BuySellForm } from '@/components/forms/BuySellForm'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { useState, useCallback } from 'react'

const PIE_PALETTE = [
  'hsl(220, 65%, 55%)', 'hsl(158, 60%, 45%)', 'hsl(38, 88%, 50%)',
  'hsl(280, 60%, 55%)', 'hsl(190, 60%, 50%)', 'hsl(330, 65%, 55%)',
  'hsl(100, 50%, 45%)', 'hsl(4, 68%, 50%)',
]

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

interface PortfolioSummary {
  cash: string; total_value: string; total_pnl: string; total_pnl_pct: number; position_count: number
}
interface PositionItem { symbol: string; quantity: number; avg_price: string }
interface PortfolioData  { cash: string; positions: PositionItem[] }
interface TradeItem { symbol: string; side: 'buy' | 'sell'; quantity: number; price: string; executed_at: string }

export function PortfolioPage() {
  const navigate = useNavigate()
  const { state: summary, refetch: refetchSummary } = useData<PortfolioSummary>('/api/portfolio/summary/')
  const { state: portfolio, refetch: refetchPortfolio } = useData<PortfolioData>('/api/portfolio/')
  const { state: trades, refetch: refetchTrades }       = useData<TradeItem[]>('/api/portfolio/trades/')

  const [tradeLoading, setTradeLoading] = useState(false)
  const [tradeError, setTradeError]     = useState<string | undefined>()

  const handleTrade = useCallback(async (v: { symbol: string; side: 'buy' | 'sell'; quantity: number; price: number }) => {
    setTradeLoading(true)
    setTradeError(undefined)
    try {
      await api.post(`/api/portfolio/${v.side}/`, { symbol: v.symbol, quantity: v.quantity, price: v.price })
      toast.success(`${v.side === 'buy' ? 'Bought' : 'Sold'} ${v.quantity} ${v.symbol} @ $${v.price.toFixed(2)}`)
      refetchSummary()
      refetchPortfolio()
      refetchTrades()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Trade failed'
      setTradeError(msg)
      toast.error(`Trade failed: ${msg}`)
    } finally {
      setTradeLoading(false)
    }
  }, [refetchSummary, refetchPortfolio, refetchTrades])

  const positions = portfolio.status === 'success'
    ? portfolio.data.positions.map(p => ({
        symbol:    p.symbol,
        name:      p.symbol,
        quantity:  p.quantity,
        avgPrice:  parseFloat(p.avg_price),
        lastPrice: parseFloat(p.avg_price),
      }))
    : []

  // Allocation pie data: positions by market value + cash slice
  const allocationData = (() => {
    if (portfolio.status !== 'success' || summary.status !== 'success') return []
    const cash = parseFloat(summary.data.cash)
    const slices = portfolio.data.positions.map(p => ({
      name:  p.symbol,
      value: p.quantity * parseFloat(p.avg_price),
    }))
    if (cash > 0) slices.push({ name: 'Cash', value: cash })
    return slices.filter(s => s.value > 0)
  })()
  const totalAlloc = allocationData.reduce((sum, s) => sum + s.value, 0)

  const cashAvailable = summary.status === 'success' ? parseFloat(summary.data.cash) : null

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Portfolio" subtitle="Holdings, trades, and P&L." />

      {summary.status === 'error' && <ErrorState message={summary.message} onRetry={refetchSummary} />}
      {(summary.status === 'idle' || summary.status === 'loading') && <Skeleton className="h-32 w-full" />}
      {summary.status === 'success' && (
        <PortfolioSummaryCard
          cash={parseFloat(summary.data.cash)}
          totalValue={parseFloat(summary.data.total_value)}
          pnl={parseFloat(summary.data.total_pnl)}
          pnlPct={summary.data.total_pnl_pct}
          positionCount={summary.data.position_count}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        <div className="stack stack-4">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
            Open Positions
          </span>
          {portfolio.status === 'error' && <ErrorState message={portfolio.message} onRetry={refetchPortfolio} />}
          {(portfolio.status === 'idle' || portfolio.status === 'loading') && <Skeleton className="h-48 w-full" />}
          {portfolio.status === 'success' && (
            <PositionsTable
              positions={positions}
              onSell={sym => navigate(`/tickers/${sym}`)}
            />
          )}
        </div>

        <div className="stack stack-3">
          {cashAvailable !== null && (
            <div
              className="card cluster cluster-3"
              style={{ justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)' }}
            >
              <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label-pro)' }}>
                Cash available
              </span>
              <span style={{ fontSize: 'var(--text-headline-sm)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--on-surface)', fontVariantNumeric: 'tabular-nums' }}>
                ${cashAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="card">
            <BuySellForm onSubmit={handleTrade} loading={tradeLoading} error={tradeError} />
          </div>
        </div>
      </div>

      {/* Allocation pie */}
      {allocationData.length > 0 && (
        <div className="stack stack-3">
          <span style={SECTION_LABEL}>Allocation</span>
          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 'var(--space-5)', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {allocationData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.name === 'Cash' ? 'hsl(220, 10%, 50%)' : PIE_PALETTE[i % PIE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-body-sm)' }}
                  formatter={(v: number, n: string) => [`$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, n]}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="stack stack-2">
              {allocationData.map((slice, i) => (
                <div key={slice.name} className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="cluster cluster-2" style={{ alignItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: slice.name === 'Cash' ? 'hsl(220, 10%, 50%)' : PIE_PALETTE[i % PIE_PALETTE.length], display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{slice.name}</span>
                  </div>
                  <div className="cluster cluster-3" style={{ alignItems: 'baseline' }}>
                    <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      ${slice.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', minWidth: 40, textAlign: 'right' }}>
                      {totalAlloc > 0 ? `${((slice.value / totalAlloc) * 100).toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {portfolio.status === 'success' && portfolio.data.positions.length === 0 && (
        <EmptyState title="No positions" description="Buy your first position using the form above." />
      )}

      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
          Trade History
        </span>
        {trades.status === 'error' && <ErrorState message={trades.message} onRetry={refetchTrades} />}
        {(trades.status === 'idle' || trades.status === 'loading') && <Skeleton className="h-48 w-full" />}
        {trades.status === 'success' && (
          <TradeHistoryTable
            trades={trades.data.map((t, i) => ({
              id:         i,
              symbol:     t.symbol,
              side:       t.side,
              quantity:   t.quantity,
              price:      parseFloat(t.price),
              executedAt: new Date(t.executed_at).toLocaleString(),
            }))}
          />
        )}
      </div>
    </div>
  )
}

export function PortfolioPagePreview() {
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Portfolio" subtitle="Holdings, trades, and P&L." />
      <PortfolioSummaryCard cash={50000} totalValue={125000} pnl={25000} pnlPct={25} positionCount={3} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        <PositionsTable
          positions={[
            { symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, avgPrice: 182.10, lastPrice: 189.42 },
            { symbol: 'NVDA', name: 'Nvidia Corp.', quantity: 10, avgPrice: 820.00, lastPrice: 875.39 },
          ]}
        />
        <div className="card">
          <BuySellForm onSubmit={() => {}} />
        </div>
      </div>
      <TradeHistoryTable
        trades={[
          { id: 1, symbol: 'AAPL', side: 'buy',  quantity: 50, price: 182.10, executedAt: '2024-01-10 09:31' },
          { id: 2, symbol: 'TSLA', side: 'sell', quantity: 20, price: 245.00, executedAt: '2024-01-08 14:15' },
        ]}
      />
    </div>
  )
}
