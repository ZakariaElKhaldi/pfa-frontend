import { useState } from 'react'
import { useTickerSearch } from '@/hooks/useWatchlist'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Searchable ticker dropdown.
 *
 * onSelect(ticker) — optional. When provided, clicking a result calls onSelect
 *   instead of navigating to /market/:symbol. Use this for watchlist add flows.
 */
export default function TickerSearch({ onSelect, placeholder = 'Search symbol…' }) {
  const [query, setQuery] = useState('')
  const navigate          = useNavigate()
  const { data: results } = useTickerSearch(query)

  const handleSelect = (ticker) => {
    setQuery('')
    if (onSelect) {
      onSelect(ticker)
    } else {
      navigate(`/market/${ticker.symbol}`)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-muted]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-8 h-8 text-xs bg-[--color-container] border-[--color-container] text-[--color-primary-text] placeholder:text-[--color-muted]"
        />
      </div>

      {query && results?.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-lg border border-[--color-container] bg-[--color-container] shadow-lg overflow-hidden">
          {results.map((t) => (
            <button
              key={t.symbol}
              onClick={() => handleSelect(t)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[--color-container] transition-colors text-left"
            >
              <span className="font-mono font-semibold text-[--color-max-text]">{t.symbol}</span>
              <span className="text-[--color-subtle] truncate ml-2">{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
