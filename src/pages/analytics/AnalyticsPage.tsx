import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { GlobalAccuracyCard } from '@/components/cards/GlobalAccuracyCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { AccuracyTrendChart, type AccuracyPoint } from '@/components/charts/AccuracyTrendChart'
import { SignalDistributionChart, type SignalDistPoint } from '@/components/charts/SignalDistributionChart'
import { useData } from '@/hooks/useApi'

interface GlobalAccuracy { overall_pct: number | null; by_signal: Partial<Record<'BUY'|'SELL'|'HOLD', number>>; total_evaluated: number }
interface TopMover { ticker: string; signal: string; prev_signal: string; delta: number; normalized_index: number }
interface LeaderboardItem { ticker: string; bullish_ratio: number; post_count: number; sentiment_score: string }
interface SectorItem { sector: string; avg_bullish_ratio: number; ticker_count: number; avg_normalized_index: number }
interface RecentSignal { id: number; signal: 'BUY' | 'SELL' | 'HOLD'; created_at: string }

export function AnalyticsPage() {
  const { state: accuracy, refetch: refetchAccuracy } = useData<GlobalAccuracy>('/api/signals/accuracy/global/')
  const { state: movers, refetch: refetchMovers }     = useData<TopMover[]>('/api/analytics/top-movers/')
  const { state: leaderboard }                        = useData<LeaderboardItem[]>('/api/analytics/sentiment-leaderboard/?limit=10')
  const { state: sectorRollup }                       = useData<SectorItem[]>('/api/analytics/sector-rollup/')
  const { state: recentSignals }                      = useData<RecentSignal[]>('/api/signals/recent/?limit=100')

  const accuracyTrend: AccuracyPoint[] = accuracy.status === 'success' && accuracy.data.by_signal
    ? (['BUY', 'SELL', 'HOLD'] as const)
        .filter(k => accuracy.data.by_signal[k] !== undefined)
        .map(k => ({ label: k, accuracy: (accuracy.data.by_signal[k] ?? 0) / 100 }))
    : []

  // Build signal distribution from recent signals — bucket by day
  const signalDist: SignalDistPoint[] = (() => {
    if (recentSignals.status !== 'success' || recentSignals.data.length === 0) return []
    const buckets: Record<string, { buy: number; hold: number; sell: number }> = {}
    for (const s of recentSignals.data) {
      const label = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!buckets[label]) buckets[label] = { buy: 0, hold: 0, sell: 0 }
      if (s.signal === 'BUY')  buckets[label].buy++
      if (s.signal === 'SELL') buckets[label].sell++
      if (s.signal === 'HOLD') buckets[label].hold++
    }
    return Object.entries(buckets).map(([label, v]) => ({ label, ...v })).slice(-14)
  })()

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Analytics" subtitle="Cross-ticker intelligence, model accuracy, and signals." />

      {/* Global accuracy */}
      {accuracy.status === 'error' && <ErrorState message={accuracy.message} onRetry={refetchAccuracy} />}
      {accuracy.status === 'success' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          <GlobalAccuracyCard
            overallPct={accuracy.data.overall_pct}
            bySignal={accuracy.data.by_signal}
            totalEvaluated={accuracy.data.total_evaluated}
          />
          {accuracyTrend.length > 0 && (
            <div className="card">
              <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label-pro)', color: 'var(--on-surface-muted)' }}>
                Accuracy by Signal
              </span>
              <AccuracyTrendChart data={accuracyTrend} height={180} />
            </div>
          )}
        </div>
      )}

      {/* Top Movers */}
      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
          Top Movers (24h)
        </span>
        {movers.status === 'error' && <ErrorState message={movers.message} onRetry={refetchMovers} />}
        {movers.status === 'success' && movers.data.length === 0 && (
          <EmptyState title="No movers" description="Not enough signal data in the last 24h." />
        )}
        {movers.status === 'success' && movers.data.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {movers.data.slice(0, 8).map(m => (
              <MetricCard
                key={m.ticker}
                label={m.ticker}
                value={m.signal}
                delta={`${m.delta >= 0 ? '+' : ''}${(m.delta * 100).toFixed(1)}%`}
                positive={m.delta >= 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sentiment Leaderboard */}
      {leaderboard.status === 'success' && leaderboard.data.length > 0 && (
        <div className="stack stack-3">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
            Sentiment Leaderboard
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {leaderboard.data.slice(0, 8).map((item, i) => (
              <MetricCard
                key={item.ticker}
                label={`${i + 1}. ${item.ticker}`}
                value={`${(item.bullish_ratio * 100).toFixed(1)}% bullish`}
                delta={`${item.post_count} posts`}
                positive={item.bullish_ratio >= 0.5}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sector Rollup */}
      {sectorRollup.status === 'success' && sectorRollup.data.length > 0 && (
        <div className="stack stack-3">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
            Sector Rollup
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {sectorRollup.data.map(s => (
              <MetricCard
                key={s.sector}
                label={s.sector || 'Unclassified'}
                value={`${(s.avg_bullish_ratio * 100).toFixed(1)}% bullish`}
                delta={`${s.ticker_count} tickers`}
                positive={s.avg_bullish_ratio >= 0.5}
              />
            ))}
          </div>
        </div>
      )}

      {/* Signal Distribution */}
      {signalDist.length > 1 && (
        <div className="stack stack-3">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
            Signal Distribution
          </span>
          <div className="card">
            <SignalDistributionChart data={signalDist} height={220} />
          </div>
        </div>
      )}
    </div>
  )
}

export function AnalyticsPagePreview() {
  const accuracyTrend: AccuracyPoint[] = [
    { label: 'BUY',  accuracy: 0.74 },
    { label: 'SELL', accuracy: 0.68 },
    { label: 'HOLD', accuracy: 0.71 },
  ]
  const dist: SignalDistPoint[] = [
    { label: 'Jan 8',  buy: 42, hold: 28, sell: 30 },
    { label: 'Jan 9',  buy: 55, hold: 20, sell: 25 },
    { label: 'Jan 10', buy: 38, hold: 35, sell: 27 },
    { label: 'Jan 11', buy: 61, hold: 18, sell: 21 },
  ]
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Analytics" subtitle="Cross-ticker intelligence, model accuracy, and signals." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
        <GlobalAccuracyCard overallPct={72.4} bySignal={{ BUY: 74, SELL: 68, HOLD: 71 }} totalEvaluated={1836} />
        <div className="card">
          <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label-pro)', color: 'var(--on-surface-muted)' }}>Accuracy by Signal</span>
          <AccuracyTrendChart data={accuracyTrend} height={180} />
        </div>
      </div>
      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>Signal Distribution</span>
        <div className="card">
          <SignalDistributionChart data={dist} height={220} />
        </div>
      </div>
    </div>
  )
}
