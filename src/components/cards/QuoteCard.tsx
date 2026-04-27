import { PnLBadge } from './PnLBadge'

export interface QuoteCardProps {
  symbol:     string
  name:       string
  last:       number
  bid:        number
  ask:        number
  change:     number    // absolute
  changePct:  number    // percent
  volume:     number
  /** Hides volume when false (e.g. crypto) */
  showVolume?: boolean
}

function Stat({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="stack stack-2">
      <span
        style={{
          fontSize:      'var(--text-label-sm)',
          fontWeight:    500,
          letterSpacing: 'var(--tracking-label-pro)',
          textTransform: 'uppercase',
          color:         'var(--on-surface-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily:         mono ? 'var(--font-mono)' : undefined,
          fontSize:           'var(--text-mono-md)',
          fontWeight:         600,
          color:              'var(--on-surface)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function QuoteCard({
  symbol,
  name,
  last,
  bid,
  ask,
  change,
  changePct,
  volume,
  showVolume = true,
}: QuoteCardProps) {
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <article
      className="card"
      aria-label={`Quote for ${symbol}`}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
    >
      {/* Header */}
      <div className="cluster cluster-4" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="stack stack-2">
          <span
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      'var(--text-headline-sm)',
              fontWeight:    800,
              letterSpacing: 'var(--tracking-mono)',
              color:         'var(--on-surface)',
            }}
          >
            {symbol}
          </span>
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
            {name}
          </span>
        </div>

        <div className="stack stack-2" style={{ alignItems: 'flex-end' }}>
          <span
            style={{
              fontFamily:         'var(--font-mono)',
              fontSize:           'var(--text-display-sm)',
              fontWeight:         700,
              letterSpacing:      'var(--tracking-mono)',
              color:              'var(--on-surface)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ${fmt(last)}
          </span>
          <PnLBadge value={change} pct={changePct} size="sm" />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--outline-variant)' }} />

      {/* Stats grid */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: `repeat(${showVolume ? 4 : 3}, 1fr)`,
          gap:                 'var(--space-4)',
        }}
      >
        <Stat label="Bid"  value={`$${fmt(bid)}`}  />
        <Stat label="Ask"  value={`$${fmt(ask)}`}  />
        <Stat label="Spread" value={`$${fmt(Math.abs(ask - bid))}`} />
        {showVolume && (
          <Stat
            label="Volume"
            value={volume >= 1_000_000
              ? `${(volume / 1_000_000).toFixed(2)}M`
              : volume >= 1_000
              ? `${(volume / 1_000).toFixed(1)}K`
              : volume.toString()}
          />
        )}
      </div>
    </article>
  )
}
