import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { GlobalAccuracyCard } from '@/components/cards/GlobalAccuracyCard'
import { AccuracyTrendChart, type AccuracyPoint } from '@/components/charts/AccuracyTrendChart'
import { SignalDistributionChart, type SignalDistPoint } from '@/components/charts/SignalDistributionChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/hooks/useApi'

interface GlobalAccuracy { overall_pct: number | null; by_signal: Partial<Record<'BUY' | 'SELL' | 'HOLD', number>>; total_evaluated: number }
interface TopMover { ticker: string; signal: string; prev_signal: string; delta: number; normalized_index: number }
interface LeaderboardItem { ticker: string; bullish_ratio: number; post_count: number; sentiment_score: string }
interface SectorItem { sector: string; avg_bullish_ratio: number; ticker_count: number; avg_normalized_index: number }
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

// ── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 'var(--text-label-md)', fontWeight: 500,
      letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
      color: 'var(--on-surface-muted)',
    }}>
      {children}
    </span>
  )
}

// ── Sector Heatmap tile ──────────────────────────────────────────────────────
function SectorTile({ name, bullishRatio, tickerCount, index }: {
  name: string; bullishRatio: number; tickerCount: number; index: number
}) {
  const [hovered, setHovered] = useState(false)
  const pct = bullishRatio * 100
  // Color: green → neutral → red
  const r = Math.round(pct < 50 ? 200 : 60)
  const g = Math.round(pct > 50 ? 160 : 60)
  const b = 80
  const alpha = 0.15 + Math.abs(pct - 50) / 100 * 0.6
  const bg = `rgba(${r},${g},${b},${alpha})`
  const textColor = pct >= 60 ? 'var(--secondary)' : pct <= 40 ? 'var(--tertiary)' : 'var(--on-surface-muted)'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(${r},${g},${b},${Math.min(1, alpha + 0.15)})` : bg,
        border: `1px solid rgba(${r},${g},${b},${alpha + 0.15})`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        cursor: 'default',
        transition: 'all 0.18s var(--ease-out)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        transform: hovered ? 'translateY(-2px)' : undefined,
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
      }}
    >
      <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {name || 'Other'}
      </span>
      <span style={{ fontSize: 'var(--text-headline-sm)', fontWeight: 800, color: textColor, fontVariantNumeric: 'tabular-nums' }}>
        {pct.toFixed(0)}%
      </span>
      <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.2)' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: textColor, transition: 'width 0.4s var(--ease-out)' }} />
      </div>
      <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
        {tickerCount} ticker{tickerCount !== 1 ? 's' : ''} · bullish
      </span>
    </div>
  )
}

// ── Top Mover card ───────────────────────────────────────────────────────────
function MoverCard({ ticker, signal, delta }: { ticker: string; signal: string; delta: number }) {
  const color = signal === 'BUY' ? 'var(--secondary)' : signal === 'SELL' ? 'var(--tertiary)' : 'var(--warning)'
  const d = Number.isFinite(delta) ? delta : null
  return (
    <div style={{
      background: 'var(--surface-container)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      borderTop: `3px solid ${color}`,
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

// ── Leaderboard row ──────────────────────────────────────────────────────────
function LeaderRow({ rank, ticker, bullishRatio, postCount }: {
  rank: number; ticker: string; bullishRatio: number; postCount: number
}) {
  const pct = bullishRatio * 100
  const color = pct >= 60 ? 'var(--secondary)' : pct <= 40 ? 'var(--tertiary)' : 'var(--warning)'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      padding: 'var(--space-2) var(--space-3)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-container)',
    }}>
      <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-muted)', minWidth: 20, textAlign: 'right' }}>
        {rank}
      </span>
      <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--on-surface)', flex: 1 }}>
        {ticker}
      </span>
      <div style={{ flex: 2, height: 6, borderRadius: 999, background: 'var(--surface-container-high)' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: color, transition: 'width 0.5s var(--ease-out)' }} />
      </div>
      <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color, fontWeight: 700, minWidth: 44, textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
      <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', minWidth: 60, textAlign: 'right' }}>
        {postCount} posts
      </span>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const [rangeIdx, setRangeIdx] = useState(1) // default 1W

  const { state: accuracy, refetch: refetchAccuracy } = useData<GlobalAccuracy>('/api/signals/accuracy/global/')
  const { state: movers,   refetch: refetchMovers }   = useData<TopMover[]>('/api/analytics/top-movers/')
  const { state: leaderboard }                        = useData<LeaderboardItem[]>('/api/analytics/sentiment-leaderboard/?limit=10')
  const { state: sectorRollup }                       = useData<SectorItem[]>('/api/analytics/sector-rollup/')
  const { state: recentSignals }                      = useData<RecentSignal[]>('/api/signals/recent/?limit=200&all=true')

  const rangeDays = RANGES[rangeIdx].days

  const accuracyTrend: AccuracyPoint[] = accuracy.status === 'success' && accuracy.data.by_signal
    ? (['BUY', 'SELL', 'HOLD'] as const)
        .filter(k => accuracy.data.by_signal[k] !== undefined)
        .map(k => ({ label: k, accuracy: (accuracy.data.by_signal[k] ?? 0) / 100 }))
    : []

  // Build signal distribution bucketed by day within range
  const signalDist: SignalDistPoint[] = useMemo(() => {
    if (recentSignals.status !== 'success' || recentSignals.data.length === 0) return []
    const cutoff = Date.now() - rangeDays * 86_400_000
    const buckets: Record<string, { buy: number; hold: number; sell: number }> = {}
    for (const s of recentSignals.data) {
      if (new Date(s.created_at).getTime() < cutoff) continue
      const label = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!buckets[label]) buckets[label] = { buy: 0, hold: 0, sell: 0 }
      if (s.signal === 'BUY')  buckets[label].buy++
      if (s.signal === 'SELL') buckets[label].sell++
      if (s.signal === 'HOLD') buckets[label].hold++
    }
    return Object.entries(buckets).map(([label, v]) => ({ label, ...v }))
  }, [recentSignals, rangeDays])

  // Signal type breakdown (pie-like counts)
  const signalBreakdown = useMemo(() => {
    if (recentSignals.status !== 'success') return null
    const cutoff = Date.now() - rangeDays * 86_400_000
    const counts = { BUY: 0, SELL: 0, HOLD: 0, total: 0 }
    for (const s of recentSignals.data) {
      if (new Date(s.created_at).getTime() < cutoff) continue
      counts[s.signal]++
      counts.total++
    }
    return counts
  }, [recentSignals, rangeDays])

  return (
    <div className="p-6 stack stack-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <PageHeader title="Analytics" subtitle="Cross-ticker intelligence, model accuracy, and signals." />
        {/* Time range tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--surface-container)', padding: 3, borderRadius: 'var(--radius-lg)' }}>
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRangeIdx(i)}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-label-sm)',
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

      {/* Signal breakdown strip */}
      {signalBreakdown && signalBreakdown.total > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          {(['BUY', 'SELL', 'HOLD'] as const).map(s => {
            const pct = ((signalBreakdown[s] / signalBreakdown.total) * 100)
            const color = SIGNAL_COLOR[s]
            return (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
                background: `color-mix(in srgb, ${color} 12%, var(--surface-container))`,
                border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 700, color }}>{s}</span>
                <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface)' }}>
                  {signalBreakdown[s]} <span style={{ color: 'var(--on-surface-muted)' }}>({pct.toFixed(0)}%)</span>
                </span>
              </div>
            )
          })}
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)', marginLeft: 'auto' }}>
            {signalBreakdown.total} signals · {RANGES[rangeIdx].label}
          </span>
        </div>
      )}

      {/* Global accuracy + accuracy by signal chart */}
      {accuracy.status === 'error' && <ErrorState message={accuracy.message} onRetry={refetchAccuracy} />}
      {(accuracy.status === 'loading' || accuracy.status === 'idle') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      )}
      {accuracy.status === 'success' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          <GlobalAccuracyCard
            overallPct={accuracy.data.overall_pct}
            bySignal={accuracy.data.by_signal}
            totalEvaluated={accuracy.data.total_evaluated}
          />
          {accuracyTrend.length > 0 && (
            <div className="card stack stack-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <SectionLabel>Accuracy by Signal</SectionLabel>
                <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>24h evaluated</span>
              </div>
              <AccuracyTrendChart data={accuracyTrend} height={180} />
            </div>
          )}
        </div>
      )}

      {/* Signal Distribution Chart */}
      {recentSignals.status === 'loading' && <Skeleton className="h-64 w-full" />}
      {signalDist.length > 1 && (
        <div className="stack stack-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <SectionLabel>Signal Distribution</SectionLabel>
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
              BUY / SELL / HOLD daily breakdown · {RANGES[rangeIdx].label}
            </span>
          </div>
          <div className="card">
            <SignalDistributionChart data={signalDist} height={220} />
          </div>
        </div>
      )}

      {/* Sector Heatmap */}
      {sectorRollup.status === 'success' && sectorRollup.data.length > 0 && (
        <div className="stack stack-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <SectionLabel>Sector Heatmap</SectionLabel>
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
              Green = bullish majority · Red = bearish majority
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
            {sectorRollup.data.map((s, i) => (
              <SectorTile
                key={s.sector}
                name={s.sector}
                bullishRatio={Number.isFinite(s.avg_bullish_ratio) ? s.avg_bullish_ratio : 0.5}
                tickerCount={s.ticker_count}
                index={i}
              />
            ))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        )}
        {movers.status === 'success' && movers.data.length === 0 && (
          <EmptyState title="No movers" description="Not enough signal data in the last 24h." />
        )}
        {movers.status === 'success' && movers.data.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
            {movers.data.slice(0, 8).map(m => (
              <MoverCard key={m.ticker} ticker={m.ticker} signal={m.signal ?? '—'} delta={m.delta} />
            ))}
          </div>
        )}
      </div>

      {/* Sentiment Leaderboard */}
      {leaderboard.status === 'success' && leaderboard.data.length > 0 && (
        <div className="stack stack-3">
          <SectionLabel>Sentiment Leaderboard</SectionLabel>
          <div className="card stack stack-2">
            {leaderboard.data.slice(0, 10).map((item, i) => (
              <LeaderRow
                key={item.ticker}
                rank={i + 1}
                ticker={item.ticker}
                bullishRatio={Number.isFinite(item.bullish_ratio) ? item.bullish_ratio : 0.5}
                postCount={item.post_count ?? 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
