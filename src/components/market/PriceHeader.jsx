import { formatPrice, formatPct } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function PriceHeader({ quote }) {
  if (!quote) return null

  const { symbol, price, change, change_pct, volume, market_cap } = quote
  const isUp = change_pct >= 0

  return (
    <div className="flex items-end gap-6 flex-wrap">
      <div>
        <p className="text-xs text-subtle mb-0.5 uppercase tracking-wider">{symbol}</p>
        <span className="font-data text-3xl font-semibold text-max-text">
          ${formatPrice(price)}
        </span>
      </div>
      <div className={cn(
        'font-data text-lg font-semibold',
        isUp ? 'text-signal-buy' : 'text-signal-sell'
      )}>
        {isUp ? '+' : ''}{formatPrice(change)} ({formatPct(change_pct)})
      </div>
      <div className="flex gap-4 ml-auto text-right">
        <div>
          <p className="text-[10px] text-muted uppercase">Volume</p>
          <p className="font-data text-xs text-secondary">{formatPrice(volume, 0)}</p>
        </div>
        {market_cap && (
          <div>
            <p className="text-[10px] text-muted uppercase">Mkt Cap</p>
            <p className="font-data text-xs text-secondary">{formatPrice(market_cap / 1e9, 2)}B</p>
          </div>
        )}
      </div>
    </div>
  )
}
