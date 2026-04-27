import { Icons } from '@/components/design-system'

export interface TrendingTickerRowProps {
  rank:    number
  symbol:  string
  name:    string
  /** Total post count in the trending window */
  postCount: number
  /** Bullish post ratio 0–1 */
  bullishRatio: number
  onClick?: () => void
}

export function TrendingTickerRow({
  rank,
  symbol,
  name,
  postCount,
  bullishRatio,
  onClick,
}: TrendingTickerRowProps) {
  const pct     = Math.round(bullishRatio * 100)
  const bullish = bullishRatio >= 0.55
  const neutral = bullishRatio >= 0.45 && bullishRatio < 0.55
  const sentimentColor = bullish
    ? 'var(--secondary)'
    : neutral
    ? 'var(--on-surface-muted)'
    : 'var(--tertiary)'

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           'var(--space-4)',
        padding:       'var(--space-3) var(--space-4)',
        borderRadius:  'var(--radius-md)',
        background:    'transparent',
        cursor:        onClick ? 'pointer' : 'default',
        transition:    'background var(--duration-fast) var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.background = 'var(--surface-container-low)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      {/* Rank */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize:   'var(--text-mono-sm)',
          color:      'var(--on-surface-muted)',
          minWidth:   20,
          textAlign:  'right',
        }}
      >
        {rank}
      </span>

      {/* Flame icon */}
      <Icons.Flame size={14} style={{ color: 'var(--warning)', flexShrink: 0 } as React.CSSProperties} />

      {/* Ticker info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize:   'var(--text-mono-md)',
            color:      'var(--on-surface)',
          }}
        >
          {symbol}
        </span>
        <span
          style={{
            fontSize:     'var(--text-label-sm)',
            color:        'var(--on-surface-muted)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}
        >
          {name}
        </span>
      </div>

      {/* Post count + sentiment */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <span
          style={{
            fontFamily:         'var(--font-mono)',
            fontSize:           'var(--text-mono-sm)',
            fontWeight:         600,
            color:              'var(--on-surface)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {postCount >= 1000 ? `${(postCount / 1000).toFixed(1)}k` : postCount} posts
        </span>
        <span style={{ fontSize: 'var(--text-label-sm)', color: sentimentColor, fontWeight: 500 }}>
          {pct}% bullish
        </span>
      </div>
    </div>
  )
}
