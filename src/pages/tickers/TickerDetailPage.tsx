import { useParams, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { QuoteCard } from '@/components/cards/QuoteCard'
import { SentimentSummaryCard } from '@/components/cards/SentimentSummaryCard'
import { SignalHistoryTable, type SignalHistoryRow } from '@/components/cards/SignalHistoryTable'
import { SignalExplainPanel, type ScoringEntry } from '@/components/cards/SignalExplainPanel'
import { TickerAccuracyTable, type TickerAccuracyRow } from '@/components/cards/TickerAccuracyTable'
import { IndicatorChip } from '@/components/cards/IndicatorChip'
import { MoodCard } from '@/components/cards/MoodCard'
import { PostCard } from '@/components/cards/PostCard'
import { PriceChart, type OHLCBar } from '@/components/charts/PriceChart'
import { SentimentPriceChart, type SentimentPricePoint } from '@/components/charts/SentimentPriceChart'
import { SignalAccuracyChart, type AccuracyRecord } from '@/components/charts/SignalAccuracyChart'
import { FeatureImportanceChart, type FeatureImportance } from '@/components/charts/FeatureImportanceChart'
import { SentimentTrendChart, type SentimentPoint } from '@/components/charts/SentimentTrendChart'
import { BuySellForm } from '@/components/forms/BuySellForm'
import { WatchlistStarButton } from '@/components/common/WatchlistStarButton'
import { Input } from '@/components/ui/input'
import { useData } from '@/hooks/useApi'
import { useWSStatus } from '@/hooks/useWSStatus'
import { api } from '@/lib/api'
import { useState, useCallback, useMemo } from 'react'
import type { Signal, SentimentLabel } from '@/design-system/tokens'
import type { Mood } from '@/components/design-system/MoodBadge'

interface MarketEvent {
  type:   string
  price?: number
  signal?: Signal
  prediction_confidence?: number
}

interface PriceSnap  { price: string; open_price: string; high_price: string; low_price: string; volume: number; timestamp: string }
interface TickerInfo { symbol: string; name: string }
interface SignalSnap {
  id: number; signal: Signal; sentiment: SentimentLabel; post_count: number; bullish_ratio: number
  normalized_index: number; prediction_method: 'ml' | 'rule_based'; prediction_confidence: number
  positive_count: number; negative_count: number; neutral_count: number; created_at: string
}
interface ExplainData {
  signal: Signal; prediction_method: string; prediction_confidence: number
  feature_importances: Record<string, number> | null
  aggregation: { bullish_ratio: number; normalized_index: number; time_decay_score: number; source_weighted_score: number }
}
interface SentimentData { total: number; bullish: number; bearish: number; neutral: number; bullish_pct: number }
interface SocialPost { id: number; source: string; content: string; sentiment_label: SentimentLabel; sentiment_score: number; posted_at: string }
interface WatchlistItem { symbol: string }
interface AccuracyItem {
  id: number; predicted: Signal; actual_direction: 'UP' | 'DOWN' | 'FLAT'
  accuracy_1h: boolean | null; accuracy_24h: boolean | null; evaluated_at: string
}
interface IndicatorsData {
  symbol: string; close: number
  sma_20: number | null; ema_12: number | null; rsi_14: number | null
  bollinger_bands: { upper: number; middle: number; lower: number } | null
  macd: { macd: number; signal: number; histogram: number } | null
  volatility: number | null
}
interface MoodSnap {
  dominant_mood: Mood; confidence: number
  window_start: string; window_end: string; created_at: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase' as const, color: 'var(--on-surface-muted)' }}>
      {children}
    </span>
  )
}

export function TickerDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate   = useNavigate()
  if (!symbol) { navigate('/tickers'); return null }

  const sym = symbol.toUpperCase()

  const { state: ticker }    = useData<TickerInfo>(`/api/tickers/${sym}/`)
  const { state: quote }     = useData<PriceSnap>(`/api/tickers/${sym}/quote/`)
  const { state: history }   = useData<SignalSnap[]>(`/api/tickers/${sym}/signal/history/`)
  const { state: explain }   = useData<ExplainData>(`/api/tickers/${sym}/signal/explain/`)
  const { state: sentiment } = useData<SentimentData>(`/api/tickers/${sym}/social/sentiment/`)
  const { state: posts }     = useData<SocialPost[]>(`/api/tickers/${sym}/posts/`)
  const { state: prices }    = useData<PriceSnap[]>(`/api/tickers/${sym}/prices/`)
  const { state: accuracy }    = useData<AccuracyItem[]>(`/api/tickers/${sym}/signal/accuracy/`)
  const { state: indicators }  = useData<IndicatorsData>(`/api/tickers/${sym}/indicators/`)
  const { state: tickerMood }  = useData<MoodSnap[]>(`/api/tickers/${sym}/mood/`)
  const { state: watchlist, refetch: refetchWatchlist } = useData<WatchlistItem[]>('/api/watchlist/')

  const [tradeLoading, setTradeLoading] = useState(false)
  const [tradeError, setTradeError]     = useState<string | undefined>()
  const [watchToggling, setWatchToggling] = useState(false)
  const [postSource,    setPostSource]    = useState<'all' | 'reddit' | 'stocktwits'>('all')
  const [postSentiment, setPostSentiment] = useState<'all' | SentimentLabel>('all')
  const [postSearch,    setPostSearch]    = useState('')
  const [livePrice,     setLivePrice]     = useState<number | null>(null)

  // Live market updates for this ticker
  const marketWs = useWSStatus<MarketEvent>(`/ws/market/${sym}/`, useCallback((data: MarketEvent) => {
    if (typeof data?.price === 'number') setLivePrice(data.price)
  }, []))

  const isWatched = watchlist.status === 'success' && watchlist.data.some(w => w.symbol === sym)

  const handleTrade = useCallback(async (v: { symbol: string; side: 'buy' | 'sell'; quantity: number; price: number }) => {
    setTradeLoading(true); setTradeError(undefined)
    try {
      await api.post(`/api/portfolio/${v.side}/`, { symbol: v.symbol, quantity: v.quantity, price: v.price })
      toast.success(`${v.side === 'buy' ? 'Bought' : 'Sold'} ${v.quantity} ${v.symbol} @ $${v.price.toFixed(2)}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Trade failed'
      setTradeError(msg)
      toast.error(msg)
    } finally { setTradeLoading(false) }
  }, [])

  const handleWatchToggle = useCallback(async (_sym: string, add: boolean) => {
    setWatchToggling(true)
    try {
      if (add) {
        await api.post('/api/watchlist/', { symbol: sym })
        toast.success(`${sym} added to watchlist`)
      } else {
        await api.delete(`/api/watchlist/${sym}/`)
        toast.success(`${sym} removed from watchlist`)
      }
      refetchWatchlist()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Watchlist update failed')
    } finally { setWatchToggling(false) }
  }, [sym, refetchWatchlist])

  const name = ticker.status === 'success' ? ticker.data.name : sym

  // Price chart OHLC
  const priceChartData: OHLCBar[] = prices.status === 'success'
    ? prices.data.map(p => ({ date: new Date(p.timestamp), open: parseFloat(p.open_price), high: parseFloat(p.high_price), low: parseFloat(p.low_price), close: parseFloat(p.price), volume: p.volume }))
    : []

  // Sentiment + price overlay
  const sentPriceData: SentimentPricePoint[] = history.status === 'success' && prices.status === 'success'
    ? history.data.map(s => {
        const priceSnap = prices.data.find(p => Math.abs(new Date(p.timestamp).getTime() - new Date(s.created_at).getTime()) < 86400000)
        return { time: s.created_at, price: parseFloat(priceSnap?.price ?? '0'), sentimentScore: s.normalized_index, signal: s.signal }
      }).filter(p => p.price > 0)
    : []

  // Sentiment trend from signal history
  const sentTrendData: SentimentPoint[] = history.status === 'success'
    ? history.data.slice(0, 30).reverse().map(s => ({
        time:    new Date(s.created_at).toLocaleDateString(),
        bullish: s.positive_count,
        bearish: s.negative_count,
        neutral: s.neutral_count,
      }))
    : []

  // Signal accuracy chart
  const accuracyRecords: AccuracyRecord[] = accuracy.status === 'success'
    ? accuracy.data.map(a => ({
        evaluatedAt:     a.evaluated_at,
        predicted:       a.predicted,
        actualDirection: a.actual_direction,
        accuracy1h:      a.accuracy_1h,
        accuracy24h:     a.accuracy_24h,
      }))
    : []

  // Ticker accuracy table — aggregate accuracy records by signal type
  const accuracyTableRows: TickerAccuracyRow[] = accuracy.status === 'success' && accuracy.data.length > 0
    ? (() => {
        const bySignal: Record<string, { count1h: number; correct1h: number; count24h: number; correct24h: number; total: number }> = {}
        for (const a of accuracy.data) {
          if (!bySignal[a.predicted]) bySignal[a.predicted] = { count1h: 0, correct1h: 0, count24h: 0, correct24h: 0, total: 0 }
          const row = bySignal[a.predicted]
          row.total++
          if (a.accuracy_1h  !== null) { row.count1h++;  if (a.accuracy_1h)  row.correct1h++ }
          if (a.accuracy_24h !== null) { row.count24h++; if (a.accuracy_24h) row.correct24h++ }
        }
        return Object.entries(bySignal).map(([sig, v]) => ({
          symbol:      sym,
          accuracy1h:  v.count1h  > 0 ? v.correct1h  / v.count1h  : null,
          accuracy24h: v.count24h > 0 ? v.correct24h / v.count24h : null,
          signalCount: v.total,
          bestSignal:  sig as 'BUY' | 'SELL' | 'HOLD',
        }))
      })()
    : []

  // Feature importances
  const featureData: FeatureImportance[] = explain.status === 'success' && explain.data.feature_importances
    ? Object.entries(explain.data.feature_importances).map(([feature, importance]) => ({ feature, importance }))
    : []

  // Signal explain entries (for panel)
  const explainEntries: ScoringEntry[] = explain.status === 'success'
    ? explain.data.feature_importances
      ? Object.entries(explain.data.feature_importances).map(([feature, score]) => ({ feature, score }))
      : [
          { feature: 'bullish_ratio',    score: explain.data.aggregation.bullish_ratio * 2 - 1 },
          { feature: 'normalized_index', score: explain.data.aggregation.normalized_index },
          { feature: 'time_decay_score', score: explain.data.aggregation.time_decay_score },
          { feature: 'source_weighted',  score: explain.data.aggregation.source_weighted_score },
        ]
    : []

  // Latest signal indicators
  const latestSignal = history.status === 'success' ? history.data[0] : null

  // Filtered posts
  const filteredPosts: SocialPost[] = useMemo(() => {
    if (posts.status !== 'success') return []
    const q = postSearch.trim().toLowerCase()
    return posts.data.filter(p => {
      if (postSource    !== 'all' && p.source          !== postSource)    return false
      if (postSentiment !== 'all' && p.sentiment_label !== postSentiment) return false
      if (q && !p.content.toLowerCase().includes(q)) return false
      return true
    })
  }, [posts, postSource, postSentiment, postSearch])

  return (
    <div className="p-6 stack stack-6">
      <PageHeader
        title={sym}
        subtitle={name}
        actions={
          <WatchlistStarButton
            symbol={sym}
            active={isWatched}
            onToggle={handleWatchToggle}
            loading={watchToggling}
          />
        }
      />

      {/* Indicator chips */}
      {latestSignal && (
        <div className="cluster cluster-3" style={{ flexWrap: 'wrap' as const }}>
          <IndicatorChip label="Sentiment"    value={latestSignal.sentiment} />
          <IndicatorChip label="Bull%"        value={`${(latestSignal.bullish_ratio * 100).toFixed(1)}%`} />
          <IndicatorChip label="Index"        value={latestSignal.normalized_index.toFixed(3)} />
          <IndicatorChip label="Confidence"   value={`${(latestSignal.prediction_confidence * 100).toFixed(1)}%`} />
          <IndicatorChip label="Posts"        value={latestSignal.post_count} />
        </div>
      )}

      {/* Live status row */}
      <div className="cluster cluster-2" style={{ alignItems: 'center', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
        <span
          aria-hidden
          style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: marketWs === 'connected' ? 'var(--secondary)' : marketWs === 'connecting' ? 'var(--warning)' : 'var(--on-surface-muted)',
            animation: marketWs === 'connected' ? 'ws-pulse 1.8s ease-in-out infinite' : 'none',
          }}
        />
        <span>
          {marketWs === 'connected' ? 'Live market data' : marketWs === 'connecting' ? 'Connecting…' : 'Disconnected'}
          {livePrice !== null && marketWs === 'connected' && (
            <span style={{ marginLeft: 'var(--space-2)', color: 'var(--on-surface)', fontVariantNumeric: 'tabular-nums' }}>
              · last ${livePrice.toFixed(2)}
            </span>
          )}
        </span>
      </div>

      {/* Quote + Sentiment */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
        {quote.status === 'error' && <ErrorState message={quote.message} />}
        {quote.status === 'success' && (() => {
          const last      = livePrice ?? parseFloat(quote.data.price)
          const open      = parseFloat(quote.data.open_price)
          const change    = last - open
          const changePct = open ? (change / open) * 100 : 0
          return (
            <QuoteCard symbol={sym} name={name} last={last} bid={last * 0.9999} ask={last * 1.0001} change={change} changePct={changePct} volume={quote.data.volume} />
          )
        })()}
        {sentiment.status === 'success' && (
          <SentimentSummaryCard
            symbol={sym}
            score={sentiment.data.bullish_pct / 100 * 2 - 1}
            label={sentiment.data.bullish_pct > 55 ? 'bullish' : sentiment.data.bullish_pct < 45 ? 'bearish' : 'neutral'}
            postCount={sentiment.data.total}
            bullishCount={sentiment.data.bullish}
            bearishCount={sentiment.data.bearish}
            neutralCount={sentiment.data.neutral}
          />
        )}
      </div>

      {/* Price Chart */}
      {priceChartData.length > 1 && (
        <div className="card stack stack-2">
          <SectionLabel>Price Chart</SectionLabel>
          <PriceChart data={priceChartData} height={400} />
        </div>
      )}

      {/* Technical Indicators */}
      {indicators.status === 'success' && (
        <div className="stack stack-3">
          <SectionLabel>Technical Indicators</SectionLabel>
          <div className="cluster cluster-3" style={{ flexWrap: 'wrap' as const }}>
            {indicators.data.rsi_14 !== null && (
              <IndicatorChip
                label="RSI(14)"
                value={indicators.data.rsi_14.toFixed(1)}
                tone={indicators.data.rsi_14 > 70 ? 'negative' : indicators.data.rsi_14 < 30 ? 'positive' : 'neutral'}
              />
            )}
            {indicators.data.sma_20 !== null && (
              <IndicatorChip
                label="SMA(20)"
                value={`$${indicators.data.sma_20.toFixed(2)}`}
                tone={indicators.data.close > indicators.data.sma_20 ? 'positive' : 'negative'}
              />
            )}
            {indicators.data.ema_12 !== null && (
              <IndicatorChip
                label="EMA(12)"
                value={`$${indicators.data.ema_12.toFixed(2)}`}
                tone={indicators.data.close > indicators.data.ema_12 ? 'positive' : 'negative'}
              />
            )}
            {indicators.data.macd && (
              <IndicatorChip
                label="MACD"
                value={indicators.data.macd.histogram.toFixed(3)}
                tone={indicators.data.macd.histogram > 0 ? 'positive' : 'negative'}
              />
            )}
            {indicators.data.bollinger_bands && (
              <IndicatorChip
                label="Bollinger"
                value={`${indicators.data.bollinger_bands.lower.toFixed(0)}–${indicators.data.bollinger_bands.upper.toFixed(0)}`}
              />
            )}
            {indicators.data.volatility !== null && (
              <IndicatorChip
                label="Volatility"
                value={`${(indicators.data.volatility * 100).toFixed(1)}%`}
                tone={indicators.data.volatility > 0.4 ? 'negative' : 'neutral'}
              />
            )}
          </div>
        </div>
      )}

      {/* Market Mood Timeline */}
      {tickerMood.status === 'success' && tickerMood.data.length > 0 && (
        <div className="stack stack-3">
          <SectionLabel>Market Mood (last 24 snapshots)</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
            {tickerMood.data.slice(0, 6).map((m, i) => (
              <MoodCard
                key={i}
                symbol={sym}
                mood={m.dominant_mood}
                confidence={m.confidence}
                windowStart={new Date(m.window_start).toLocaleDateString()}
                windowEnd={new Date(m.window_end).toLocaleDateString()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sentiment + Price Overlay */}
      {sentPriceData.length > 1 && (
        <div className="card stack stack-2">
          <SectionLabel>Sentiment vs Price</SectionLabel>
          <SentimentPriceChart data={sentPriceData} ticker={sym} height={280} />
        </div>
      )}

      {/* Sentiment Trend */}
      {sentTrendData.length > 1 && (
        <div className="card stack stack-2">
          <SectionLabel>Sentiment Trend</SectionLabel>
          <SentimentTrendChart data={sentTrendData} height={200} />
        </div>
      )}

      {/* Signal Accuracy Chart + Accuracy Table */}
      {accuracyRecords.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
          <div className="card stack stack-2">
            <SectionLabel>Accuracy Trend</SectionLabel>
            <SignalAccuracyChart data={accuracyRecords} height={200} />
          </div>
          <div className="card stack stack-2">
            <SectionLabel>Accuracy by Signal</SectionLabel>
            <TickerAccuracyTable rows={accuracyTableRows} />
          </div>
        </div>
      )}

      {/* Signal Explain + Feature Importance + Trade */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
        {explainEntries.length > 0 && (
          <div className="card stack stack-2">
            <SectionLabel>Signal Explain</SectionLabel>
            <SignalExplainPanel
              symbol={sym}
              entries={explainEntries}
              engineScore={explain.status === 'success' ? explain.data.aggregation.normalized_index : undefined}
            />
          </div>
        )}
        {featureData.length > 0 && (
          <div className="card stack stack-2">
            <SectionLabel>Feature Importance</SectionLabel>
            <FeatureImportanceChart data={featureData} />
          </div>
        )}
        <div className="card">
          <BuySellForm symbol={sym} onSubmit={handleTrade} loading={tradeLoading} error={tradeError} />
        </div>
      </div>

      {/* Signal History */}
      <div className="stack stack-3">
        <SectionLabel>Signal History</SectionLabel>
        {history.status === 'error' && <ErrorState message={history.message} />}
        {history.status === 'success' && (
          <SignalHistoryTable
            rows={history.data.map((s): SignalHistoryRow => ({
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

      {/* Social Posts */}
      <div className="stack stack-3">
        <SectionLabel>Social Posts</SectionLabel>
        {posts.status === 'success' && posts.data.length > 0 && (
          <div className="cluster cluster-3" style={{ alignItems: 'center', flexWrap: 'wrap' as const }}>
            <div className="cluster cluster-2" style={{ flexWrap: 'wrap' as const }}>
              {(['all', 'reddit', 'stocktwits'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPostSource(s)}
                  className={`btn btn-sm ${postSource === s ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {s === 'all' ? 'All sources' : s === 'reddit' ? 'Reddit' : 'StockTwits'}
                </button>
              ))}
            </div>
            <div className="cluster cluster-2" style={{ flexWrap: 'wrap' as const }}>
              {(['all', 'bullish', 'bearish', 'neutral'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPostSentiment(s as 'all' | SentimentLabel)}
                  className={`btn btn-sm ${postSentiment === s ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 180, maxWidth: 280 }}>
              <Input placeholder="Search posts…" value={postSearch} onChange={e => setPostSearch(e.target.value)} />
            </div>
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
              {filteredPosts.length} of {posts.data.length}
            </span>
          </div>
        )}

        {posts.status === 'error' && <ErrorState message={posts.message} />}
        {posts.status === 'success' && posts.data.length === 0 && <EmptyState title="No posts found" />}
        {posts.status === 'success' && posts.data.length > 0 && filteredPosts.length === 0 && (
          <EmptyState title="No matching posts" description="Try clearing some filters." />
        )}
        {posts.status === 'success' && filteredPosts.length > 0 && (
          <div className="stack stack-3">
            {filteredPosts.slice(0, 20).map(p => (
              <PostCard key={p.id} source={p.source} sourceName={p.source === 'reddit' ? 'Reddit' : 'StockTwits'} time={timeAgo(p.posted_at)} content={p.content} label={p.sentiment_label} score={p.sentiment_score} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TickerDetailPagePreview({ symbol = 'AAPL' }: { symbol?: string }) {
  const signalRows: SignalHistoryRow[] = [
    { id: 1, createdAt: '2024-01-15 09:30', signal: 'BUY',  sentiment: 'bullish', postCount: 1240, bullishRatio: 0.72, normalizedIndex: 0.65, predictionMethod: 'ml',        predictionConfidence: 0.84 },
    { id: 2, createdAt: '2024-01-14 09:30', signal: 'HOLD', sentiment: 'neutral', postCount:  890, bullishRatio: 0.51, normalizedIndex: 0.12, predictionMethod: 'rule_based', predictionConfidence: 0.61 },
  ]
  const accuracyRows: TickerAccuracyRow[] = [
    { symbol, accuracy1h: 0.76, accuracy24h: 0.71, signalCount: 48, bestSignal: 'BUY' },
  ]
  const accuracyRecords: AccuracyRecord[] = [
    { evaluatedAt: '2024-01-10', predicted: 'BUY',  actualDirection: 'UP',   accuracy1h: true,  accuracy24h: true  },
    { evaluatedAt: '2024-01-11', predicted: 'SELL', actualDirection: 'DOWN', accuracy1h: true,  accuracy24h: false },
    { evaluatedAt: '2024-01-12', predicted: 'BUY',  actualDirection: 'UP',   accuracy1h: false, accuracy24h: true  },
    { evaluatedAt: '2024-01-13', predicted: 'HOLD', actualDirection: 'FLAT', accuracy1h: true,  accuracy24h: true  },
    { evaluatedAt: '2024-01-14', predicted: 'BUY',  actualDirection: 'UP',   accuracy1h: true,  accuracy24h: true  },
  ]
  const sentTrend: SentimentPoint[] = [
    { time: 'Jan 10', bullish: 420, bearish: 180, neutral: 100 },
    { time: 'Jan 11', bullish: 510, bearish: 150, neutral: 120 },
    { time: 'Jan 12', bullish: 380, bearish: 260, neutral: 95  },
    { time: 'Jan 13', bullish: 620, bearish: 130, neutral: 88  },
  ]
  const featureData: FeatureImportance[] = [
    { feature: 'bullish_ratio',  importance: 0.38 },
    { feature: 'post_velocity',  importance: 0.22 },
    { feature: 'time_decay',     importance: 0.18 },
    { feature: 'source_weight',  importance: 0.14 },
    { feature: 'momentum_score', importance: 0.08 },
  ]
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title={symbol} subtitle="Apple Inc." actions={<WatchlistStarButton symbol={symbol} active onToggle={() => {}} />} />
      <div className="cluster cluster-3" style={{ flexWrap: 'wrap' as const }}>
        <IndicatorChip label="Sentiment"  value="bullish" />
        <IndicatorChip label="Bull%"      value="72.0%" />
        <IndicatorChip label="Index"      value="0.650" />
        <IndicatorChip label="Confidence" value="84.0%" />
        <IndicatorChip label="Posts"      value={1240} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
        <QuoteCard symbol={symbol} name="Apple Inc." last={189.42} bid={189.40} ask={189.44} change={1.23} changePct={0.65} volume={52000000} />
        <SentimentSummaryCard symbol={symbol} score={0.44} label="bullish" postCount={1240} bullishCount={892} bearishCount={248} neutralCount={100} />
      </div>
      <div className="card stack stack-2">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase' as const, color: 'var(--on-surface-muted)' }}>Sentiment Trend</span>
        <SentimentTrendChart data={sentTrend} height={180} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
        <div className="card stack stack-2">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase' as const, color: 'var(--on-surface-muted)' }}>Accuracy Trend</span>
          <SignalAccuracyChart data={accuracyRecords} height={200} />
        </div>
        <div className="card stack stack-2">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase' as const, color: 'var(--on-surface-muted)' }}>Accuracy by Signal</span>
          <TickerAccuracyTable rows={accuracyRows} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
        <div className="card stack stack-2">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase' as const, color: 'var(--on-surface-muted)' }}>Signal Explain</span>
          <SignalExplainPanel symbol={symbol} entries={[{ feature: 'bullish_ratio', score: 0.44 }, { feature: 'time_decay', score: 0.28 }]} engineScore={0.65} />
        </div>
        <div className="card stack stack-2">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase' as const, color: 'var(--on-surface-muted)' }}>Feature Importance</span>
          <FeatureImportanceChart data={featureData} />
        </div>
        <div className="card">
          <BuySellForm symbol={symbol} onSubmit={() => {}} />
        </div>
      </div>
      <SignalHistoryTable rows={signalRows} />
    </div>
  )
}
