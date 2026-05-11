import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useWSStatus } from '@/hooks/useWSStatus'
import { useMarketClock } from '@/hooks/useMarketClock'
import type { OHLCBar } from '@/components/charts/PriceChart'

export interface MarketEvent {
  type: string
  symbol?: string
  open?: string | number
  high?: string | number
  low?: string | number
  close?: string | number
  price?: string | number
  volume?: number
  size?: number
  timestamp?: string
  trade_timestamp?: string
  bar_timestamp?: string
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
  const { clock } = useMarketClock()
  const [bars, setBars] = useState<OHLCBar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyReady, setHistoryReady] = useState(false)

  // 1. Fetch historical data once; trade ticks are the live update path.
  const fetchHistory = useCallback(async (
    abortedRef?: { value: boolean },
    options?: { background?: boolean },
  ) => {
    const isBackground = options?.background ?? false
    if (!isBackground) {
      setLoading(true)
      setHistoryReady(false)
    }
    setError(null)
    try {
      const data = await api.get<any[]>(`/api/tickers/${symbol.toUpperCase()}/prices/`)
      if (abortedRef?.value) return

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
      if (abortedRef?.value) return
      if (!isBackground) {
        setError(err instanceof Error ? err.message : 'Failed to fetch price history')
      }
    } finally {
      if (!abortedRef?.value) setLoading(false)
    }
  }, [symbol, limit])

  useEffect(() => {
    const abortedRef = { value: false }
    fetchHistory(abortedRef)
    return () => { abortedRef.value = true }
  }, [fetchHistory])

  // 2. Real-time updates via WebSocket
  const onMessage = useCallback((data: MarketEvent) => {
    const rawClose = data?.close ?? data?.price
    const price = typeof rawClose === 'number' ? rawClose : Number(rawClose)

    if ((data?.type === 'trade' || data?.type === 'price') && Number.isFinite(price)) {
      const open = Number(data.open ?? price)
      const high = Number(data.high ?? price)
      const low = Number(data.low ?? price)
      const timestamp = data.bar_timestamp ?? data.timestamp ?? data.trade_timestamp

      if (!timestamp) return
      const liveBar = {
        date: new Date(timestamp),
        open: Number.isFinite(open) ? open : price,
        high: Number.isFinite(high) ? high : price,
        low: Number.isFinite(low) ? low : price,
        close: price,
        volume: data.volume ?? data.size ?? 0,
      }

      setBars(prev => {
        const liveTime = liveBar.date.getTime()
        const next = [...prev]
        const idx = next.findIndex(b => b.date.getTime() === liveTime)

        if (idx >= 0) {
          next[idx] = liveBar
        } else {
          next.push(liveBar)
          next.sort((a, b) => a.date.getTime() - b.date.getTime())
          if (next.length > limit) next.splice(0, next.length - limit)
        }

        return next
      })
    }
  }, [limit])

  const status = useWSStatus<MarketEvent>(`/ws/market/${symbol.toUpperCase()}/`, onMessage, {
    enabled: historyReady && !!clock?.is_open,
    heartbeat: true,
  })

  return {
    bars,
    loading,
    error,
    status: clock?.is_open ? status : 'unavailable',
  }
}
