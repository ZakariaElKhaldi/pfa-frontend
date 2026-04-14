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

/* ─── Side tag ──────────────────────────────────────── */
function SidePill({ side }) {
  const isBuy = side?.toUpperCase() === 'BUY'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-mono font-semibold text-[10px] uppercase tracking-wide leading-none rounded-md px-2 py-1',
      isBuy
        ? 'text-signal-buy bg-signal-buy-container border border-signal-buy-border'
        : 'text-signal-sell bg-signal-sell-container border border-signal-sell-border',
    )}>
      {isBuy ? '▲' : '▼'} {side}
    </span>
  )
}

/* ─── Skeleton ───────────────────────────────────────── */
function TradeSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <TableRow key={i} className="border-container">
      {Array.from({ length: 6 }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-3.5 w-full bg-container" />
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
    <div className="rounded-lg overflow-hidden bg-container p-1">
      <Table>
        <TableHeader>
          <TableRow className="border-ghost hover:bg-transparent">
            <TableHead className="text-[11px] uppercase tracking-wide text-subtle font-semibold py-3">Date</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-subtle font-semibold py-3">Ticker</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-subtle font-semibold py-3">Side</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-subtle font-semibold text-right py-3">Qty</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-subtle font-semibold text-right py-3">Price</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-subtle font-semibold text-right py-3">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? <TradeSkeleton /> : (
            trades.map((trade, i) => {
              const total = (trade.quantity ?? 0) * (trade.price ?? 0)
              return (
                <TableRow key={trade.id ?? i} className="border-ghost hover:bg-surface-low/50 transition-colors">
                  <TableCell className="text-xs text-subtle py-3">
                    <div>{trade.executed_at ? format(new Date(trade.executed_at), 'MMM d, yyyy') : '—'}</div>
                    <div className="text-[10px] text-muted mt-0.5">
                      {trade.executed_at ? formatDistanceToNow(new Date(trade.executed_at), { addSuffix: true }) : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-semibold text-sm text-max-text">
                      {trade.ticker ?? trade.symbol ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell><SidePill side={trade.side} /></TableCell>
                  <TableCell className="font-data text-sm text-right text-primary-text">
                    {trade.quantity ?? '—'}
                  </TableCell>
                  <TableCell className="font-data text-sm text-right text-primary-text">
                    ${formatPrice(trade.price)}
                  </TableCell>
                  <TableCell className="font-data text-sm text-right font-semibold text-max-text">
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
