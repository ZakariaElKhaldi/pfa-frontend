import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export interface MarketClock {
  is_open: boolean
  next_open: string
  next_close: string
  server_timestamp: string
}

export function useMarketClock() {
  const [clock, setClock] = useState<MarketClock | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await api.get<MarketClock>('/api/market/clock/')
        if (!cancelled) setClock(data)
      } catch {
        if (!cancelled) setClock(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { clock, loading }
}
