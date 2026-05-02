import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export interface Quote {
  price:      string
  open_price: string
  high_price: string
  low_price:  string
  volume:     number
  timestamp:  string
}

/** Fetches /api/tickers/<sym>/quote/ for a list of symbols in parallel.
 * Returns a map keyed by symbol; missing entries indicate a quote that 404'd. */
export function useQuotes(symbols: string[]): { quotes: Record<string, Quote | null>; loading: boolean } {
  const [quotes, setQuotes]   = useState<Record<string, Quote | null>>({})
  const [loading, setLoading] = useState(false)
  const key = symbols.slice().sort().join(',')

  useEffect(() => {
    if (symbols.length === 0) { setQuotes({}); return }
    const ctrl = new AbortController()
    setLoading(true)
    Promise.all(symbols.map(async sym => {
      try {
        const q = await api.get<Quote>(`/api/tickers/${sym}/quote/`)
        return [sym, q] as const
      } catch {
        return [sym, null] as const
      }
    })).then(entries => {
      if (ctrl.signal.aborted) return
      setQuotes(Object.fromEntries(entries))
      setLoading(false)
    })
    return () => ctrl.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { quotes, loading }
}
