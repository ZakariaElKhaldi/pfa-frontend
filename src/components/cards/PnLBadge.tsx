import { Icons } from '@/components/design-system'

export interface PnLBadgeProps {
  /** Absolute P&L in dollars (positive = profit, negative = loss) */
  value: number
  /** Show percentage alongside dollar amount */
  pct?: number
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: 'var(--text-mono-sm)',
  md: 'var(--text-mono-md)',
  lg: 'var(--text-mono-lg)',
} as const

export function PnLBadge({ value, pct, size = 'md' }: PnLBadgeProps) {
  const positive = value >= 0
  const color = positive ? 'var(--secondary)' : 'var(--tertiary)'
  const sign  = positive ? '+' : ''
  const Icon  = positive ? Icons.ArrowUp : Icons.ArrowDown
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13

  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            4,
        fontFamily:     'var(--font-mono)',
        fontSize:       SIZE[size],
        fontWeight:     600,
        color,
        letterSpacing:  'var(--tracking-mono)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <Icon size={iconSize} aria-hidden />
      {sign}{value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
      {pct !== undefined && (
        <span style={{ opacity: 0.75 }}>({sign}{pct.toFixed(2)}%)</span>
      )}
    </span>
  )
}
