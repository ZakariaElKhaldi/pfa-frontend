import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '@/lib/api'
import { useWSStatus } from '@/hooks/useWSStatus'
import type { OHLCBar } from '@/components/charts/PriceChart'

export interface MarketEvent {
  type: string
  open?: string | number
  high?: string | number
  low?: string | number
  price?: string | number
  volume?: number
  timestamp?: string
}

export interface UseOHLCDataReturn {
  bars: OHLCBar[]
  loading: boolean
  error: string | null
  status: 'connected' | 'connecting' | 'disconnected' | 'unavailable'
}

/**
 * Hook to fetch historical OHLC bars and sync with real-time WebSocket updates.
 * @param symbol The ticker symbol (e.g., 'AAPL')
 * @param limit Maximum number of bars to keep in state
 */
export function useOHLCData(symbol: string, limit: number = 100): UseOHLCDataReturn {
  const [bars, setBars] = useState<OHLCBar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveBar, setLiveBar] = useState<OHLCBar | null>(null)
  const [historyReady, setHistoryReady] = useState(false)

  // 1. Fetch historical data
  useEffect(() => {
    let aborted = false
    const fetchHistory = async () => {
      setLoading(true)
      setError(null)
      setHistoryReady(false)
      try {
        const data = await api.get<any[]>(`/api/tickers/${symbol.toUpperCase()}/prices/`)
        if (aborted) return

        const formatted = data.map(p => ({
          date: new Date(p.timestamp),
          open: parseFloat(p.open_price),
          high: parseFloat(p.high_price),
          low: parseFloat(p.low_price),
          close: parseFloat(p.price),
          volume: p.volume,
        }))
        // Ensure chronological order for D3
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-limit)

        setBars(formatted)
        setHistoryReady(true)
      } catch (err) {
        if (aborted) return
        setError(err instanceof Error ? err.message : 'Failed to fetch price history')
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    fetchHistory()
    return () => { aborted = true }
  }, [symbol, limit])

  // 2. Real-time updates via WebSocket
  const onMessage = useCallback((data: MarketEvent) => {
    const price = typeof data?.price === 'number' ? data.price : Number(data?.price)
    
    if (data?.type === 'price' && data.timestamp && Number.isFinite(price)) {
      const open = Number(data.open ?? price)
      const high = Number(data.high ?? price)
      const low = Number(data.low ?? price)
      
      setLiveBar({
        date: new Date(data.timestamp),
        open: Number.isFinite(open) ? open : price,
        high: Number.isFinite(high) ? high : price,
        low: Number.isFinite(low) ? low : price,
        close: price,
        volume: data.volume ?? 0,
      })
    }
  }, [])

  const status = useWSStatus<MarketEvent>(`/ws/market/${symbol.toUpperCase()}/`, onMessage, {
    enabled: historyReady,
  })

  // 3. Merge historical bars with the live bar
  const mergedBars = useMemo(() => {
    if (!liveBar) return bars
    
    const next = [...bars]
    const liveTime = liveBar.date.getTime()
    const idx = next.findIndex(b => b.date.getTime() === liveTime)
    
    if (idx >= 0) {
      next[idx] = liveBar
    } else {
      // Only append if it's newer than the latest bar
      const lastBar = next[next.length - 1]
      if (!lastBar || liveTime > lastBar.date.getTime()) {
        next.push(liveBar)
        if (next.length > limit) next.shift()
      }
    }
    return next
  }, [bars, liveBar, limit])

  return {
    bars: mergedBars,
    loading,
    error,
    status,
  }
}
