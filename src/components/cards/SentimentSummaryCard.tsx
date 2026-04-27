import { SentimentBadge } from '@/components/design-system'
import type { SentimentLabel } from '@/design-system/tokens'

export interface SentimentSummaryCardProps {
  symbol:       string
  /** Aggregate score in [-1, 1] */
  score:        number
  /** Dominant sentiment derived from score */
  label:        SentimentLabel
  /** Total posts analysed */
  postCount:    number
  bullishCount: number
  bearishCount: number
  neutralCount: number
}

export function SentimentSummaryCard({
  symbol,
  score,
  label,
  postCount,
  bullishCount,
  bearishCount,
  neutralCount,
}: SentimentSummaryCardProps) {
  const total = bullishCount + bearishCount + neutralCount || 1
  const bullPct = (bullishCount / total) * 100
  const bearPct = (bearishCount / total) * 100
  const neuPct  = (neutralCount / total) * 100
  const sign    = score >= 0 ? '+' : ''

  return (
    <article
      className="card"
      aria-label={`Sentiment summary for ${symbol}`}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize:   'var(--text-headline-sm)',
            color:      'var(--on-surface)',
          }}
        >
          {symbol}
        </span>
        <SentimentBadge label={label} />
      </div>

      {/* Big score */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <span
          style={{
            fontFamily:         'var(--font-mono)',
            fontSize:           'var(--text-display-sm)',
            fontWeight:         800,
            letterSpacing:      'var(--tracking-mono)',
            color:              label === 'bullish' ? 'var(--secondary)' : label === 'bearish' ? 'var(--tertiary)' : 'var(--on-surface)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {sign}{score.toFixed(3)}
        </span>
        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label-pro)', fontWeight: 500 }}>
          Sentiment score · {postCount} posts
        </span>
      </div>

      {/* Segmented bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div
          style={{
            display:      'flex',
            height:        8,
            borderRadius: 'var(--radius-full)',
            overflow:     'hidden',
            gap:           2,
          }}
        >
          <div style={{ width: `${bullPct}%`, background: 'var(--secondary)', transition: 'width 500ms var(--ease-out)' }} />
          <div style={{ width: `${neuPct}%`,  background: 'var(--on-surface-muted)', opacity: 0.35, transition: 'width 500ms var(--ease-out)' }} />
          <div style={{ width: `${bearPct}%`, background: 'var(--tertiary)', transition: 'width 500ms var(--ease-out)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-label-sm)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--secondary)' }}>{bullishCount} bull</span>
          <span style={{ color: 'var(--on-surface-muted)' }}>{neutralCount} neutral</span>
          <span style={{ color: 'var(--tertiary)' }}>{bearishCount} bear</span>
        </div>
      </div>
    </article>
  )
}
