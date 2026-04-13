import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Subscribes to the live signal stream WebSocket.
 * Automatically pushes new signals into TanStack Query cache.
 */
export function useSignalStream() {
  const qc     = useQueryClient()
  const wsRef  = useRef(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token')
    const url   = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/signals/?token=${token}`
    const ws    = new WebSocket(url)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        const signal = JSON.parse(e.data)
        /* Prepend new signal into the 'latest' signals cache */
        qc.setQueryData(['signals', 'latest'], (old) => {
          if (!old) return [signal]
          return [signal, ...old.slice(0, 49)]
        })
      } catch (_) {}
    }

    ws.onclose = (e) => {
      if (e.code !== 1000) setTimeout(connect, 3000)
    }
  }, [qc])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close(1000)
  }, [connect])
}
