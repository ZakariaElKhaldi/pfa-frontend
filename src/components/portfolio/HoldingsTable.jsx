import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useQuote } from '@/hooks/useMarket'
import { formatPrice, formatPct, cn } from '@/lib/utils'

function PositionRow({ position }) {
  const { symbol, quantity, avg_price } = position
  const { data: quote } = useQuote(symbol)
  const currentPrice    = quote?.price ?? null
  const value           = currentPrice != null ? currentPrice * quantity : null
  const pnl             = currentPrice != null ? (currentPrice - avg_price) * quantity : null
  const pnlPct          = avg_price > 0 && currentPrice != null
    ? ((currentPrice - avg_price) / avg_price) * 100
    : null
  const isUp = pnl == null ? null : pnl >= 0

  return (
    <TableRow className="border-surface-low hover:bg-container">
      <TableCell className="font-mono font-semibold text-sm text-max-text">{symbol}</TableCell>
      <TableCell className="font-data text-xs text-secondary">{quantity}</TableCell>
      <TableCell className="font-data text-xs text-secondary">${formatPrice(avg_price)}</TableCell>
      <TableCell className="font-data text-xs text-secondary">
        {currentPrice != null ? `$${formatPrice(currentPrice)}` : '—'}
      </TableCell>
      <TableCell className="font-data text-xs text-primary-text">
        {value != null ? `$${formatPrice(value)}` : '—'}
      </TableCell>
      <TableCell className={cn('font-data text-xs', isUp == null ? 'text-muted' : isUp ? 'text-signal-buy' : 'text-signal-sell')}>
        {pnl != null ? `${isUp ? '+' : ''}${formatPrice(pnl)}` : '—'}
      </TableCell>
      <TableCell className={cn('font-data text-xs', isUp == null ? 'text-muted' : isUp ? 'text-signal-buy' : 'text-signal-sell')}>
        {pnlPct != null ? formatPct(pnlPct) : '—'}
      </TableCell>
    </TableRow>
  )
}

export default function HoldingsTable({ positions = [] }) {
  if (!positions.length) return (
    <p className="text-xs text-muted text-center py-4">No positions yet</p>
  )

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-surface-low hover:bg-transparent">
          {['Symbol', 'Qty', 'Avg Cost', 'Current', 'Value', 'P&L', 'P&L %'].map((h) => (
            <TableHead key={h} className="text-[10px] font-medium text-muted uppercase tracking-wider">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((p) => <PositionRow key={p.symbol} position={p} />)}
      </TableBody>
    </Table>
  )
}
