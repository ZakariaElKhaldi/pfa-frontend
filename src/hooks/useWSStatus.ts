import { useState, useEffect, useRef } from 'react'
import type { WSStatus } from '@/components/common/WSStatusDot'

/**
 * Open a WebSocket to `path` and track connection status.
 * If `onMessage` is provided, parses each message as JSON and invokes the callback.
 * Reconnects with exponential backoff on disconnect.
 */
export function useWSStatus<T = unknown>(
  path: string,
  onMessage?: (data: T) => void,
): WSStatus {
  const [status, setStatus] = useState<WSStatus>('disconnected')
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    let attempt   = 0
    let timer:    ReturnType<typeof setTimeout> | null = null
    let ws:       WebSocket | null = null
    let stopped   = false

    function connect() {
      if (stopped) return
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
      const url = `${protocol}//${location.host}${path}`
      setStatus('connecting')
      ws = new WebSocket(url)
      ws.onopen = () => {
        attempt = 0
        setStatus('connected')
      }
      ws.onmessage = e => {
        if (!onMessageRef.current) return
        try {
          onMessageRef.current(JSON.parse(e.data) as T)
        } catch {
          /* ignore non-JSON */
        }
      }
      ws.onclose = () => {
        setStatus('disconnected')
        if (stopped) return
        attempt++
        const delay = Math.min(30_000, 1000 * 2 ** Math.min(attempt, 5))
        timer = setTimeout(connect, delay)
      }
      ws.onerror = () => { ws?.close() }
    }
    connect()

    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      ws?.close()
    }
  }, [path])

  return status
}
