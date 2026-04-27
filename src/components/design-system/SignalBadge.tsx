import type { Signal } from '@/design-system/tokens'

const CLASS: Record<Signal, string> = {
  BUY:  'badge-buy',
  SELL: 'badge-sell',
  HOLD: 'badge-hold',
}

export function SignalBadge({ signal, size = 'lg' }: { signal: Signal; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`badge badge-${size} ${CLASS[signal]}`}>{signal}</span>
}
