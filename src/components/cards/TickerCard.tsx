import { SignalBadge } from '@/components/design-system'
import type { Signal } from '@/design-system/tokens'

export interface TickerCardProps {
  symbol: string
  name: string
  price: string
  change: string
  pct: string
  signal: Signal
  onClick?: () => void
}

export function TickerCard({ symbol, name, price, change, pct, signal, onClick }: TickerCardProps) {
  const positive = change.startsWith('+')
  return (
    <div className="ticker-card" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <span className="ticker-card-symbol">{symbol}</span>
      <span className="ticker-card-name">{name}</span>
      <div className="stack stack-2" style={{ alignItems: 'flex-end' }}>
        <span className="ticker-card-price">${price}</span>
        <span className={`ticker-card-change ${positive ? 'positive' : 'negative'}`}>
          {change} ({pct})
        </span>
      </div>
      <SignalBadge signal={signal} />
    </div>
  )
}
