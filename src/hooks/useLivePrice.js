import { useEffect, useRef, useCallback } from 'react'

export function useLivePrice(symbol, onTick) {
  const wsRef     = useRef(null)
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  const connect = useCallback(() => {
    if (!symbol) return
    const token = localStorage.getItem('access_token')
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    const url   = `${proto}://${location.host}/ws/market/${symbol}/?token=${token}`
    const ws    = new WebSocket(url)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'market_update') onTickRef.current?.(msg.data)
      } catch (_) {}
    }
    ws.onclose = (e) => { if (e.code !== 1000) setTimeout(connect, 3000) }
  }, [symbol])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close(1000)
  }, [connect])
}
