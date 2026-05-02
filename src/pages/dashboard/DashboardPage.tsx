import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { TrendingTickerRow } from '@/components/cards/TrendingTickerRow'
import { PortfolioSummaryCard } from '@/components/cards/PortfolioSummaryCard'
import { AlertCard } from '@/components/cards/AlertCard'
import { TickerCard } from '@/components/cards/TickerCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { SignalHistoryTable, type SignalHistoryRow } from '@/components/cards/SignalHistoryTable'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/hooks/useApi'
import { useQuotes } from '@/hooks/useQuotes'
import { useAuth } from '@/context/AuthContext'
import type { Signal } from '@/design-system/tokens'
import type { AlertType } from '@/components/design-system/AlertTypeBadge'

interface TrendingItem { symbol: string; mention_count: number }
interface WatchlistEntry { symbol: string; name: string; added_at: string }
interface PortfolioSummary {
  cash: string
  total_value: string
  total_pnl: string
  total_pnl_pct: number
  position_count: number
}
interface AlertFlagItem {
  id: number
  ticker_symbol: string
  type: AlertType
  sentiment: number
  momentum: number
  consistency: number
  resolved: boolean
}
interface SignalItem {
  id: number
  ticker_symbol: string
  signal: SignalHistoryRow['signal']
  sentiment: SignalHistoryRow['sentiment']
  post_count: number
  bullish_ratio: number
  normalized_index: number
  prediction_method: SignalHistoryRow['predictionMethod']
  prediction_confidence: number
  created_at: string
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { state: trending, refetch: refetchTrending } = useData<TrendingItem[]>('/api/social/trending/')
  const { state: portfolio, refetch: refetchPortfolio }  = useData<PortfolioSummary>('/api/portfolio/summary/')
  const { state: alerts, refetch: refetchAlerts }        = useData<AlertFlagItem[]>('/api/alerts/')
  const { state: signals, refetch: refetchSignals }      = useData<SignalItem[]>('/api/signals/recent/?limit=10')
  const { state: watchlist }                             = useData<WatchlistEntry[]>('/api/watchlist/')

  const watchlistSymbols = watchlist.status === 'success' ? watchlist.data.slice(0, 8).map(w => w.symbol) : []
  const { quotes } = useQuotes(watchlistSymbols)

  // Map ticker_symbol → latest signal (from recent signals feed)
  const signalBySymbol = new Map<string, Signal>(
    signals.status === 'success' ? signals.data.map(s => [s.ticker_symbol, s.signal]) : []
  )

  const activeAlertCount = alerts.status === 'success' ? alerts.data.filter(a => !a.resolved).length : null
  const todayCount       = signals.status === 'success'
    ? signals.data.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length
    : null
  const buyCount         = signals.status === 'success' ? signals.data.filter(s => s.signal === 'BUY').length  : null
  const sellCount        = signals.status === 'success' ? signals.data.filter(s => s.signal === 'SELL').length : null

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="p-6 stack stack-6">
      <PageHeader
        title={user ? `${greeting}, ${user.username}` : 'Dashboard'}
        subtitle="Your market overview and latest signals."
      />

      {/* Hero stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
        {portfolio.status === 'success' ? (
          <MetricCard
            label="Portfolio P&L"
            value={`${portfolio.data.total_pnl_pct >= 0 ? '+' : ''}${portfolio.data.total_pnl_pct.toFixed(2)}%`}
            delta={`$${parseFloat(portfolio.data.total_pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            positive={portfolio.data.total_pnl_pct >= 0}
          />
        ) : <Skeleton className="h-24 w-full" />}
        <MetricCard
          label="Active Alerts"
          value={activeAlertCount === null ? '—' : String(activeAlertCount)}
          delta={alerts.status === 'success' ? `${alerts.data.length} total` : ''}
          positive={activeAlertCount === 0}
        />
        <MetricCard
          label="Signals Today"
          value={todayCount === null ? '—' : String(todayCount)}
          delta={signals.status === 'success' ? `${signals.data.length} recent` : ''}
          positive
        />
        <MetricCard
          label="Buy / Sell"
          value={buyCount === null || sellCount === null ? '—' : `${buyCount} / ${sellCount}`}
          delta="last 10 signals"
          positive={(buyCount ?? 0) >= (sellCount ?? 0)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
        {/* Portfolio Summary */}
        {portfolio.status === 'error' && (
          <ErrorState message={portfolio.message} onRetry={refetchPortfolio} />
        )}
        {portfolio.status === 'success' && (
          <PortfolioSummaryCard
            cash={parseFloat(portfolio.data.cash)}
            totalValue={parseFloat(portfolio.data.total_value)}
            pnl={parseFloat(portfolio.data.total_pnl)}
            pnlPct={portfolio.data.total_pnl_pct}
            positionCount={portfolio.data.position_count}
          />
        )}

        {/* Trending Tickers */}
        <div className="card stack stack-2">
          <span
            style={{
              fontSize: 'var(--text-label-md)', fontWeight: 500,
              letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
              color: 'var(--on-surface-muted)',
            }}
          >
            Trending
          </span>
          {trending.status === 'error' && (
            <ErrorState message={trending.message} onRetry={refetchTrending} />
          )}
          {trending.status === 'success' && trending.data.length === 0 && (
            <EmptyState title="No trending tickers" />
          )}
          {trending.status === 'success' && trending.data.map((item, i) => (
            <TrendingTickerRow
              key={item.symbol}
              rank={i + 1}
              symbol={item.symbol}
              name={item.symbol}
              postCount={item.mention_count}
              bullishRatio={0.5}
              onClick={() => navigate(`/tickers/${item.symbol}`)}
            />
          ))}
        </div>
      </div>

      {/* Watchlist */}
      {watchlist.status === 'success' && watchlist.data.length > 0 && (
        <div className="stack stack-3">
          <span
            style={{
              fontSize: 'var(--text-label-md)', fontWeight: 500,
              letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
              color: 'var(--on-surface-muted)',
            }}
          >
            Watchlist
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
            {watchlist.data.slice(0, 8).map(w => {
              const q       = quotes[w.symbol]
              const last    = q ? parseFloat(q.price)      : null
              const open    = q ? parseFloat(q.open_price) : null
              const change  = last !== null && open !== null ? last - open : null
              const pct     = last !== null && open && open !== 0 ? (change! / open) * 100 : null
              const sig     = signalBySymbol.get(w.symbol) ?? 'HOLD'
              return (
                <TickerCard
                  key={w.symbol}
                  symbol={w.symbol}
                  name={w.name}
                  price={last === null ? '—' : last.toFixed(2)}
                  change={change === null ? '+0.00' : `${change >= 0 ? '+' : ''}${change.toFixed(2)}`}
                  pct={pct === null ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`}
                  signal={sig}
                  onClick={() => navigate(`/tickers/${w.symbol}`)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="stack stack-3">
        <span
          style={{
            fontSize: 'var(--text-label-md)', fontWeight: 500,
            letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
            color: 'var(--on-surface-muted)',
          }}
        >
          Active Alerts
        </span>
        {alerts.status === 'error' && (
          <ErrorState message={alerts.message} onRetry={refetchAlerts} />
        )}
        {alerts.status === 'success' && alerts.data.filter(a => !a.resolved).length === 0 && (
          <EmptyState title="No active alerts" description="All clear — no signals to review." />
        )}
        {alerts.status === 'success' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {alerts.data.filter(a => !a.resolved).slice(0, 6).map(a => (
              <AlertCard
                key={a.id}
                type={a.type}
                symbol={a.ticker_symbol}
                sentiment={a.sentiment}
                momentum={a.momentum}
                consistency={a.consistency}
                resolved={a.resolved}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Signals */}
      <div className="stack stack-3">
        <span
          style={{
            fontSize: 'var(--text-label-md)', fontWeight: 500,
            letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
            color: 'var(--on-surface-muted)',
          }}
        >
          Recent Signals
        </span>
        {signals.status === 'error' && (
          <ErrorState message={signals.message} onRetry={refetchSignals} />
        )}
        {signals.status === 'success' && (
          <SignalHistoryTable
            rows={signals.data.map(s => ({
              id:                   s.id,
              createdAt:            new Date(s.created_at).toLocaleString(),
              signal:               s.signal,
              sentiment:            s.sentiment,
              postCount:            s.post_count,
              bullishRatio:         s.bullish_ratio,
              normalizedIndex:      s.normalized_index,
              predictionMethod:     s.prediction_method,
              predictionConfidence: s.prediction_confidence,
            }))}
          />
        )}
      </div>
    </div>
  )
}

export interface DashboardPagePreviewProps {
  trending?: TrendingItem[]
  portfolio?: PortfolioSummary
  alerts?: AlertFlagItem[]
  signals?: SignalItem[]
}

export function DashboardPagePreview({
  trending = [
    { symbol: 'NVDA', mention_count: 12840 },
    { symbol: 'TSLA', mention_count: 9431 },
    { symbol: 'AAPL', mention_count: 7220 },
  ],
  portfolio = {
    cash: '50000.00', total_value: '125000.00',
    total_pnl: '25000.00', total_pnl_pct: 25, position_count: 5,
  },
  alerts = [
    { id: 1, ticker_symbol: 'TSLA', type: 'divergence', sentiment: -0.71, momentum: 0.12, consistency: 0.18, resolved: false },
    { id: 2, ticker_symbol: 'NVDA', type: 'extreme_sentiment', sentiment: 0.88, momentum: 0.74, consistency: 0.22, resolved: false },
  ],
  signals = [],
}: DashboardPagePreviewProps) {
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Dashboard" subtitle="Your market overview and latest signals." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
        <PortfolioSummaryCard
          cash={parseFloat(portfolio.cash)}
          totalValue={parseFloat(portfolio.total_value)}
          pnl={parseFloat(portfolio.total_pnl)}
          pnlPct={portfolio.total_pnl_pct}
          positionCount={portfolio.position_count}
        />
        <div className="card stack stack-2">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
            Trending
          </span>
          {trending.map((item, i) => (
            <TrendingTickerRow key={item.symbol} rank={i + 1} symbol={item.symbol} name={item.symbol} postCount={item.mention_count} bullishRatio={0.5} />
          ))}
        </div>
      </div>

      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
          Active Alerts
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
          {alerts.map(a => (
            <AlertCard key={a.id} type={a.type} symbol={a.ticker_symbol} sentiment={a.sentiment} momentum={a.momentum} consistency={a.consistency} resolved={a.resolved} />
          ))}
        </div>
      </div>

      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
          Recent Signals
        </span>
        <SignalHistoryTable rows={signals.map(s => ({ id: s.id, createdAt: new Date(s.created_at).toLocaleString(), signal: s.signal, sentiment: s.sentiment, postCount: s.post_count, bullishRatio: s.bullish_ratio, normalizedIndex: s.normalized_index, predictionMethod: s.prediction_method, predictionConfidence: s.prediction_confidence }))} />
      </div>
    </div>
  )
}
