import { formatDistanceToNow, format } from 'date-fns'
import {
  Table, TableHeader, TableRow, TableHead,
  TableBody, TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { useTrades } from '@/hooks/usePortfolio'
import { formatPrice, cn } from '@/lib/utils'
import { History } from 'lucide-react'

/* ─── Side pill ──────────────────────────────────────── */
function SidePill({ side }) {
  const isBuy = side?.toUpperCase() === 'BUY'
  return (
    <span className={cn(
      'inline-flex items-center font-mono font-semibold text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5',
      isBuy
        ? 'text-[--color-signal-buy] bg-[--color-signal-buy-container] border border-[--color-signal-buy-border]'
        : 'text-[--color-signal-sell] bg-[--color-signal-sell-container] border border-[--color-signal-sell-border]',
    )}>
      {isBuy ? '▲' : '▼'} {side}
    </span>
  )
}

/* ─── Skeleton ───────────────────────────────────────── */
function TradeSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <TableRow key={i} className="border-[--color-container]">
      {Array.from({ length: 6 }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-3.5 w-full bg-[--color-container]" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

/* ─── Main component ─────────────────────────────────── */
export default function TradeHistory() {
  const { data: trades, isLoading } = useTrades()

  if (!isLoading && !trades?.length) {
    return (
      <EmptyState
        icon={History}
        title="No trades yet"
        description="Execute a buy or sell order to see your trade history here."
      />
    )
  }

  return (
    <div className="rounded-lg overflow-hidden bg-[--color-container]">
      <Table>
        <TableHeader>
          <TableRow className="border-[--color-container] hover:bg-transparent">
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold">Date</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold">Ticker</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold">Side</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold text-right">Qty</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold text-right">Price</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? <TradeSkeleton /> : (
            trades.map((trade, i) => {
              const total = (trade.quantity ?? 0) * (trade.price ?? 0)
              return (
                <TableRow key={trade.id ?? i} className="border-[--color-container] hover:bg-[--color-container] transition-colors">
                  <TableCell className="text-[10px] text-[--color-muted]">
                    <div>{trade.executed_at ? format(new Date(trade.executed_at), 'MMM d, yyyy') : '—'}</div>
                    <div className="text-[9px] text-[--color-muted] opacity-60">
                      {trade.executed_at ? formatDistanceToNow(new Date(trade.executed_at), { addSuffix: true }) : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-semibold text-sm text-[--color-max-text]">
                      {trade.ticker ?? trade.symbol ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell><SidePill side={trade.side} /></TableCell>
                  <TableCell className="font-data text-sm text-right text-[--color-primary-text]">
                    {trade.quantity ?? '—'}
                  </TableCell>
                  <TableCell className="font-data text-sm text-right text-[--color-primary-text]">
                    ${formatPrice(trade.price)}
                  </TableCell>
                  <TableCell className="font-data text-sm text-right font-semibold text-[--color-max-text]">
                    ${formatPrice(total)}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
