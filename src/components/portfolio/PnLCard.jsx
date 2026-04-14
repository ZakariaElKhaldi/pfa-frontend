import { formatPrice, formatPct, cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function PnLCard({ totalValue, totalPnl, totalPnlPct, cash }) {
  const isUp = totalPnl == null ? true : totalPnl >= 0

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-subtle uppercase tracking-wider">Total Value</span>
      <span className="font-data text-3xl font-semibold text-max-text">
        {totalValue != null ? `$${formatPrice(totalValue)}` : '—'}
      </span>
      {totalPnl != null && (
        <div className={cn(
          'flex items-center gap-1.5 font-data text-sm font-medium',
          isUp ? 'text-signal-buy' : 'text-signal-sell'
        )}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isUp ? '+' : ''}{formatPrice(totalPnl)}
          {totalPnlPct != null && ` (${formatPct(totalPnlPct)})`}
        </div>
      )}
      {cash != null && (
        <span className="text-xs text-muted mt-1">
          Cash: ${formatPrice(cash)}
        </span>
      )}
    </div>
  )
}
