import type { SentimentLabel } from '@/design-system/tokens'

const CLASS: Record<SentimentLabel, string> = {
  bullish: 'badge-bullish',
  bearish: 'badge-bearish',
  neutral: 'badge-neutral',
}

const DOT: Record<SentimentLabel, string> = {
  bullish: 'var(--secondary)',
  bearish: 'var(--tertiary)',
  neutral: 'var(--on-surface-muted)',
}

export function SentimentBadge({ label }: { label: SentimentLabel }) {
  return (
    <span className={`badge ${CLASS[label]}`}>
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: DOT[label],
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  )
}
