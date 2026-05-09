import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { GlobalAccuracyCard } from '@/components/cards/GlobalAccuracyCard'
import { AccuracyTrendChart, type AccuracyPoint } from '@/components/charts/AccuracyTrendChart'
import { SignalDistributionChart, type SignalDistPoint } from '@/components/charts/SignalDistributionChart'
import { D3SignalDonut } from '@/components/charts/D3SignalDonut'
import { D3SectorTreemap } from '@/components/charts/D3SectorTreemap'
import { D3SentimentBeeswarm } from '@/components/charts/D3SentimentBeeswarm'
import { D3SignalHeatmap } from '@/components/charts/D3SignalHeatmap'
import { D3MarketBreadth } from '@/components/charts/D3MarketBreadth'
import { D3VolumeForecast, type HistoricalVolume } from '@/components/charts/D3VolumeForecast'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useData } from '@/hooks/useApi'
import { useOHLCData } from '@/hooks/useOHLCData'
import { PageMeta } from '@/components/common/PageMeta'
import { Search } from 'lucide-react'

interface GlobalAccuracy { overall_pct: number | null; by_signal: Partial<Record<'BUY' | 'SELL' | 'HOLD', number>>; total_evaluated: number }
interface TopMover { ticker: string; signal: string; prev_signal: string; delta: number; normalized_index: number }
interface LeaderboardItem { ticker: string; bullish_ratio: number; post_count: number; sentiment_score: string }
interface SectorItem { sector: string; ticker_count: number; avg_signal: number; avg_sentiment: number }
interface RecentSignal { id: number; signal: 'BUY' | 'SELL' | 'HOLD'; created_at: string; ticker_symbol: string }

const RANGES = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
] as const

const SIGNAL_COLOR = {
  BUY: 'var(--secondary)',
  SELL: 'var(--tertiary)',
  HOLD: 'var(--warning)',
} as const

// ── Section label ────────────────────────────────────────────────────────
function SectionLabel({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
      <span style={{
        fontSize: 'var(--text-label-md)', fontWeight: 600,
        letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
        color: 'var(--on-surface-muted)',
      }}>
        {children}
      </span>
      {subtitle && (
        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  )
}

// ── Top Mover card ───────────────────────────────────────────────────────
function MoverCard({ ticker, signal, delta }: { ticker: string; signal: string; delta: number }) {
  const color = signal === 'BUY' ? 'var(--secondary)' : signal === 'SELL' ? 'var(--tertiary)' : 'var(--warning)'
  const d = Number.isFinite(delta) ? delta : null
  return (
    <div style={{
      background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)', display: 'flex', flexDirection: 'column',
      gap: 'var(--space-2)', borderTop: `3px solid ${color}`,
    }}>
      <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--on-surface)' }}>{ticker}</span>
      <span style={{
        fontSize: 'var(--text-label-sm)', fontWeight: 700, padding: '2px 10px',
        borderRadius: 'var(--radius-full)', color, alignSelf: 'flex-start',
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}>
        {signal}
      </span>
      {d !== null && (
        <span style={{ fontSize: 'var(--text-headline-sm)', fontWeight: 800, color: d >= 0 ? 'var(--secondary)' : 'var(--tertiary)', fontVariantNumeric: 'tabular-nums' }}>
          {d >= 0 ? '+' : ''}{(d * 100).toFixed(1)}%
        </span>
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const [rangeIdx, setRangeIdx] = useState(1) // default 1W

  const { state: accuracy, refetch: refetchAccuracy } = useData<GlobalAccuracy>('/api/signals/accuracy/global/')
  const { state: movers, refetch: refetchMovers }     = useData<TopMover[]>('/api/analytics/top-movers/')
  const { state: leaderboard }                        = useData<LeaderboardItem[]>('/api/analytics/sentiment-leaderboard/?limit=20')
  const { state: sectorRollup }                       = useData<SectorItem[]>('/api/analytics/sector-rollup/')
  const { state: recentSignals }                      = useData<RecentSignal[]>('/api/signals/recent/?limit=2000&all=true')

  const [forecastTickerInput, setForecastTickerInput] = useState('AAPL')
  const [forecastTicker, setForecastTicker] = useState('AAPL')

  const { bars: priceChartData } = useOHLCData(forecastTicker, 200)
  const { state: volumeForecast } = useData<{ forecast: number[] }>(`/api/analytics/forecast/volume/?ticker=${forecastTicker}`)
  const { state: breadthForecast } = useData<{ forecast: number[]; last_historical_value: number }>('/api/analytics/forecast/breadth/')

  const rangeDays = RANGES[rangeIdx].days

  const accuracyTrend: AccuracyPoint[] = accuracy.status === 'success' && accuracy.data.by_signal
    ? (['BUY', 'SELL', 'HOLD'] as const)
        .filter(k => accuracy.data.by_signal[k] !== undefined)
        .map(k => ({ label: k, accuracy: (accuracy.data.by_signal[k] ?? 0) / 100 }))
    : []

  // Signal distribution bucketed by day
  const signalDist: SignalDistPoint[] = useMemo(() => {
    if (recentSignals.status !== 'success' || recentSignals.data.length === 0) return []
    const cutoff = Date.now() - rangeDays * 86_400_000
    const buckets: Record<string, { buy: number; hold: number; sell: number }> = {}
    for (const s of recentSignals.data) {
      if (new Date(s.created_at).getTime() < cutoff) continue
      const label = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!buckets[label]) buckets[label] = { buy: 0, hold: 0, sell: 0 }
      if (s.signal === 'BUY') buckets[label].buy++
      if (s.signal === 'SELL') buckets[label].sell++
      if (s.signal === 'HOLD') buckets[label].hold++
    }
    return Object.entries(buckets).map(([label, v]) => ({ label, ...v }))
  }, [recentSignals, rangeDays])

  // Signal breakdown for donut
  const signalBreakdown = useMemo(() => {
    if (recentSignals.status !== 'success') return { BUY: 0, SELL: 0, HOLD: 0 }
    const cutoff = Date.now() - rangeDays * 86_400_000
    const counts = { BUY: 0, SELL: 0, HOLD: 0 }
    for (const s of recentSignals.data) {
      if (new Date(s.created_at).getTime() < cutoff) continue
      counts[s.signal]++
    }
    return counts
  }, [recentSignals, rangeDays])

  const donutTotal = signalBreakdown.BUY + signalBreakdown.SELL + signalBreakdown.HOLD

  // Leaderboard → beeswarm data
  const beeswarmData = useMemo(() => {
    if (leaderboard.status !== 'success') return []
    return leaderboard.data.map(d => ({
      ticker: d.ticker,
      bullishRatio: Number.isFinite(d.bullish_ratio) ? d.bullish_ratio : 0.5,
      postCount: d.post_count ?? 0,
    }))
  }, [leaderboard])

  const histVol: HistoricalVolume[] = useMemo(() => {
    return priceChartData.map(p => ({
      date: p.date.toISOString().split('T')[0],
      volume: p.volume,
    }))
  }, [priceChartData])

  return (
    <div className="p-6 stack stack-6">
      <PageMeta title="Analytics" description="Cross-ticker intelligence dashboard." />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <PageHeader title="Analytics" subtitle="Cross-ticker intelligence, model accuracy, and sentiment signals." />
        {/* Time range tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--surface-container)', padding: 3, borderRadius: 'var(--radius-lg)' }}>
          {RANGES.map((r, i) => (
            <button
              key={r.label} type="button" onClick={() => setRangeIdx(i)}
              style={{
                padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', fontSize: 'var(--text-label-sm)',
                fontWeight: rangeIdx === i ? 700 : 500,
                background: rangeIdx === i ? 'var(--primary)' : 'transparent',
                color: rangeIdx === i ? 'var(--on-primary)' : 'var(--on-surface-muted)',
                transition: 'all 0.15s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Row 1: Accuracy + Signal Donut ──────────────────────────── */}
      {accuracy.status === 'error' && <ErrorState message={accuracy.message} onRetry={refetchAccuracy} />}
      {(accuracy.status === 'loading' || accuracy.status === 'idle') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-52 w-full" />)}
        </div>
      )}
      {accuracy.status === 'success' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)', alignItems: 'start' }}>
          <GlobalAccuracyCard
            overallPct={accuracy.data.overall_pct}
            bySignal={accuracy.data.by_signal}
            totalEvaluated={accuracy.data.total_evaluated}
          />
          {accuracyTrend.length > 0 && (
            <div className="card stack stack-3">
              <SectionLabel subtitle="24h evaluated">Accuracy by Signal</SectionLabel>
              <AccuracyTrendChart data={accuracyTrend} height={180} />
            </div>
          )}
          {/* Signal Donut */}
          {donutTotal > 0 && (
            <div className="card stack stack-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SectionLabel subtitle={`${donutTotal} signals · ${RANGES[rangeIdx].label}`}>Signal Mix</SectionLabel>
              <D3SignalDonut data={signalBreakdown} size={200} />
              {/* Legend */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {(['BUY', 'SELL', 'HOLD'] as const).map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: SIGNAL_COLOR[s] }} />
                    {s}: {signalBreakdown[s]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Row 2: Signal Distribution (stacked bar) ────────────────── */}
      {recentSignals.status === 'loading' && <Skeleton className="h-64 w-full" />}
      {signalDist.length > 1 && (
        <div className="stack stack-3">
          <SectionLabel subtitle={`Daily breakdown · ${RANGES[rangeIdx].label}`}>Signal Distribution</SectionLabel>
          <div className="card">
            <SignalDistributionChart data={signalDist} height={220} />
          </div>
        </div>
      )}

      {/* ─── Row 2b: Market Breadth ──────────────────────────────────── */}
      {recentSignals.status === 'success' && recentSignals.data.length > 10 && (
        <div className="stack stack-3">
          <SectionLabel subtitle={`BUY (green) vs SELL (red) proportion over time · ${RANGES[rangeIdx].label}`}>Market Breadth</SectionLabel>
          <div className="card" style={{ overflow: 'hidden' }}>
            <D3MarketBreadth 
              data={recentSignals.data} 
              days={rangeDays} 
              height={340}
              forecastData={breadthForecast.status === 'success' ? breadthForecast.data.forecast : undefined}
            />
          </div>
        </div>
      )}

      {/* ─── Row 3: Sector Treemap ───────────────────────────────────── */}
      {sectorRollup.status === 'success' && sectorRollup.data.length > 0 && (
        <div className="stack stack-3">
          <SectionLabel subtitle="Area = ticker count · Color = bullish (green) / bearish (red)">Sector Map</SectionLabel>
          <div className="card" style={{ overflow: 'hidden' }}>
            <D3SectorTreemap data={sectorRollup.data} height={280} />
          </div>
        </div>
      )}

      {/* ─── Row 3b: Signal Heatmap Grid ──────────────────────────────── */}
      {recentSignals.status === 'success' && recentSignals.data.length > 10 && (
        <div className="stack stack-3">
          <SectionLabel subtitle={`Rows sorted by bullishness · Green = BUY · Red = SELL · ${RANGES[rangeIdx].label}`}>Signal History Map</SectionLabel>
          <div className="card" style={{ overflow: 'hidden' }}>
            <D3SignalHeatmap data={recentSignals.data} days={rangeDays} />
          </div>
        </div>
      )}

      {/* ─── Row 4: Sentiment Beeswarm + Top Movers ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 2fr) minmax(280px, 1fr)', gap: 'var(--space-5)', alignItems: 'start' }}>
        {/* Beeswarm */}
        {beeswarmData.length > 0 && (
          <div className="stack stack-3">
            <SectionLabel subtitle="Dot size = post volume">Sentiment Landscape</SectionLabel>
            <div className="card" style={{ overflow: 'hidden' }}>
              <D3SentimentBeeswarm data={beeswarmData} height={220} />
            </div>
          </div>
        )}

        {/* Top Movers */}
        <div className="stack stack-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <SectionLabel>Top Movers (24h)</SectionLabel>
            {movers.status === 'error' && (
              <button className="btn btn-sm btn-ghost" onClick={refetchMovers}>Retry</button>
            )}
          </div>
          {movers.status === 'loading' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
          )}
          {movers.status === 'success' && movers.data.length === 0 && (
            <EmptyState title="No movers" description="Not enough signal data in the last 24h." />
          )}
          {movers.status === 'success' && movers.data.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              {movers.data.slice(0, 6).map(m => (
                <MoverCard key={m.ticker} ticker={m.ticker} signal={m.signal ?? '—'} delta={m.delta} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Row 5: Market Volume Forecast ──────────────────────────── */}
      <div className="card stack stack-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <SectionLabel>Market Volume Forecast</SectionLabel>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
              color: 'hsl(160, 70%, 45%)', background: 'hsla(160, 70%, 45%, 0.1)',
              padding: '2px 7px', borderRadius: 'var(--radius-full)',
              border: '1px solid hsla(160, 70%, 45%, 0.2)',
            }}>
              TIMESFM AI
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
              30-day projection
            </span>
            <div style={{ position: 'relative', width: 140 }}>
              <Input
                value={forecastTickerInput}
                onChange={e => setForecastTickerInput(e.target.value.toUpperCase())}
                onKeyDown={e => {
                  if (e.key === 'Enter' && forecastTickerInput.trim()) {
                    setForecastTicker(forecastTickerInput.trim())
                  }
                }}
                onBlur={() => {
                  if (forecastTickerInput.trim()) setForecastTicker(forecastTickerInput.trim())
                }}
                placeholder="Ticker (e.g. AAPL)"
                style={{ height: 32, paddingLeft: 32, fontSize: 'var(--text-label-sm)' }}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--on-surface-muted)' }} />
            </div>
          </div>
        </div>
        
        {histVol.length > 1 ? (
          <D3VolumeForecast
            historicalData={histVol}
            forecastData={volumeForecast.status === 'success' ? volumeForecast.data.forecast : null}
            isLoading={volumeForecast.status === 'loading'}
            error={volumeForecast.status === 'error' ? volumeForecast.message : null}
            height={300}
          />
        ) : priceChartData.length === 0 ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--on-surface-muted)' }}>No volume data found for {forecastTicker}</span>
          </div>
        )}
      </div>

    </div>
  )
}
