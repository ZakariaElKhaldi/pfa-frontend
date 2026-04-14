import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { StarOff, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  Table, TableHeader, TableRow, TableHead,
  TableBody, TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import SignalBadge from '@/components/signals/SignalBadge'
import EmptyState from '@/components/shared/EmptyState'
import { useWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchlist'
import { useQuote } from '@/hooks/useMarket'
import { useSignal } from '@/hooks/useSignals'
import { formatPrice, formatPct, cn } from '@/lib/utils'
import { Eye } from 'lucide-react'

/* ─── Per-row live price + signal ────────────────────── */
function WatchlistRow({ item, onRemove }) {
  const { data: quote }  = useQuote(item.symbol)
  const { data: signal } = useSignal(item.symbol)
  const navigate         = useNavigate()

  const change     = quote?.change_pct ?? null
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <TableRow
      onClick={() => navigate(`/market/${item.symbol}`)}
      className="cursor-pointer hover:bg-[--color-container] transition-colors group"
    >
      {/* Symbol */}
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono font-semibold text-sm text-[--color-max-text]">
            {item.symbol}
          </span>
          <span className="text-[10px] text-[--color-muted] truncate max-w-[140px]">
            {item.name}
          </span>
        </div>
      </TableCell>

      {/* Signal */}
      <TableCell>
        {signal?.signal ? (
          <SignalBadge signal={signal.signal} />
        ) : (
          <span className="text-xs text-[--color-muted]">—</span>
        )}
      </TableCell>

      {/* Price */}
      <TableCell className="font-data text-sm text-right">
        {quote?.price != null ? (
          <span className="text-[--color-primary-text]">${formatPrice(quote.price)}</span>
        ) : (
          <span className="text-[--color-muted]">—</span>
        )}
      </TableCell>

      {/* Change */}
      <TableCell className="text-right">
        {change != null ? (
          <span
            className={cn(
              'font-data text-sm flex items-center justify-end gap-1',
              isPositive && 'text-[--color-signal-buy]',
              isNegative && 'text-[--color-signal-sell]',
              !isPositive && !isNegative && 'text-[--color-muted]',
            )}
          >
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            {!isPositive && !isNegative && <Minus size={12} />}
            {formatPct(change)}
          </span>
        ) : (
          <span className="text-[--color-muted] font-data text-sm">—</span>
        )}
      </TableCell>

      {/* Added */}
      <TableCell className="text-[10px] text-[--color-muted]">
        {item.added_at
          ? formatDistanceToNow(new Date(item.added_at), { addSuffix: true })
          : '—'}
      </TableCell>

      {/* Remove */}
      <TableCell>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.symbol) }}
          title="Remove from watchlist"
          className="text-[--color-muted] hover:text-[--color-signal-sell] transition-colors opacity-0 group-hover:opacity-100"
        >
          <StarOff size={14} />
        </button>
      </TableCell>
    </TableRow>
  )
}

function WatchlistSkeleton() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 6 }).map((_, j) => (
        <TableCell key={j}><Skeleton className="h-4 w-full bg-[--color-container]" /></TableCell>
      ))}
    </TableRow>
  ))
}

/* ─── Main export ────────────────────────────────────── */
export default function WatchlistTable({ onAdd }) {
  const { data: watchlist, isLoading } = useWatchlist()
  const remove = useRemoveFromWatchlist()

  if (!isLoading && !watchlist?.length) {
    return (
      <EmptyState
        icon={Eye}
        title="Your watchlist is empty"
        description="Use the search above to add tickers you want to track."
      />
    )
  }

  return (
    <div className="rounded-lg overflow-hidden bg-[--color-container]">
      <Table>
        <TableHeader>
          <TableRow className="border-[--color-container] hover:bg-transparent">
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold">Ticker</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold">Signal</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold text-right">Price</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold text-right">Change</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-[--color-muted] font-semibold">Added</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? <WatchlistSkeleton />
            : watchlist.map((item) => (
                <WatchlistRow
                  key={item.symbol}
                  item={item}
                  onRemove={(s) => remove.mutate(s)}
                />
              ))
          }
        </TableBody>
      </Table>
    </div>
  )
}
