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
    <TableRow className="border-[--color-surface-low] hover:bg-[--color-surface-low]">
      <TableCell className="font-mono font-semibold text-sm text-[--color-max-text]">{symbol}</TableCell>
      <TableCell className="font-data text-xs text-[--color-secondary]">{quantity}</TableCell>
      <TableCell className="font-data text-xs text-[--color-secondary]">${formatPrice(avg_price)}</TableCell>
      <TableCell className="font-data text-xs text-[--color-secondary]">
        {currentPrice != null ? `$${formatPrice(currentPrice)}` : '—'}
      </TableCell>
      <TableCell className="font-data text-xs text-[--color-primary-text]">
        {value != null ? `$${formatPrice(value)}` : '—'}
      </TableCell>
      <TableCell className={cn('font-data text-xs', isUp == null ? 'text-[--color-muted]' : isUp ? 'text-[--color-signal-buy]' : 'text-[--color-signal-sell]')}>
        {pnl != null ? `${isUp ? '+' : ''}${formatPrice(pnl)}` : '—'}
      </TableCell>
      <TableCell className={cn('font-data text-xs', isUp == null ? 'text-[--color-muted]' : isUp ? 'text-[--color-signal-buy]' : 'text-[--color-signal-sell]')}>
        {pnlPct != null ? formatPct(pnlPct) : '—'}
      </TableCell>
    </TableRow>
  )
}

export default function HoldingsTable({ positions = [] }) {
  if (!positions.length) return (
    <p className="text-xs text-[--color-muted] text-center py-4">No positions yet</p>
  )

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[--color-surface-low] hover:bg-transparent">
          {['Symbol', 'Qty', 'Avg Cost', 'Current', 'Value', 'P&L', 'P&L %'].map((h) => (
            <TableHead key={h} className="text-[10px] font-medium text-[--color-muted] uppercase tracking-wider">
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
