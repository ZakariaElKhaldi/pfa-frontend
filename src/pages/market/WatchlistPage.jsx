import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchlist'
import { useQuote } from '@/hooks/useMarket'
import TickerSearch from '@/components/market/TickerSearch'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { formatPrice } from '@/lib/utils'
import { Star, StarOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

function WatchlistRow({ item, onRemove }) {
  const { data: quote } = useQuote(item.symbol)
  const navigate        = useNavigate()

  return (
    <div
      onClick={() => navigate(`/market/${item.symbol}`)}
      className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[--color-container] hover:bg-[--color-container] cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-sm text-[--color-max-text]">{item.symbol}</span>
          <span className="text-xs text-[--color-subtle] truncate">{item.name}</span>
        </div>
        <span className="text-[10px] text-[--color-muted]">
          Added {item.added_at ? formatDistanceToNow(new Date(item.added_at), { addSuffix: true }) : ''}
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {quote ? (
          <span className="font-data text-sm font-medium text-[--color-primary-text]">
            ${formatPrice(quote.price)}
          </span>
        ) : (
          <span className="font-data text-sm text-[--color-muted]">—</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.symbol) }}
          className="text-[--color-muted] hover:text-[--color-signal-sell] transition-colors"
          title="Remove from watchlist"
        >
          <StarOff size={15} />
        </button>
      </div>
    </div>
  )
}

export default function WatchlistPage() {
  const { data: watchlist, isLoading } = useWatchlist()
  const add    = useAddToWatchlist()
  const remove = useRemoveFromWatchlist()

  if (isLoading) return (
    <div className="flex justify-center py-20"><LoadingSpinner size={24} /></div>
  )

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="max-w-xs">
        <TickerSearch
          onSelect={(t) => add.mutate(t.symbol)}
          placeholder="Add symbol to watchlist…"
        />
      </div>

      {!watchlist?.length ? (
        <EmptyState
          icon={Star}
          title="Your watchlist is empty"
          description="Search for a ticker above and add it to your watchlist."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {watchlist.map((t) => (
            <WatchlistRow key={t.symbol} item={t} onRemove={(s) => remove.mutate(s)} />
          ))}
        </div>
      )}
    </div>
  )
}
