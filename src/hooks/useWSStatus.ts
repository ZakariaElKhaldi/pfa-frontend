import { useState, useEffect, useRef } from 'react'
import type { WSStatus } from '@/components/common/WSStatusDot'
import { getWebSocketAuthToken } from '@/lib/api'

export const TERMINAL_CLOSE_CODES = new Set([4401, 4403, 1008])

export function isTerminalWebSocketClose(code: number): boolean {
  return TERMINAL_CLOSE_CODES.has(code)
}

export function shouldMarkWsUnavailable(attempt: number, maxRetries: number): boolean {
  return attempt > maxRetries
}

/**
 * Open a WebSocket to `path` and track connection status.
 * If `onMessage` is provided, parses each message as JSON and invokes the callback.
 * Reconnects with exponential backoff on disconnect.
 */
export function useWSStatus<T = unknown>(
  path: string,
  onMessage?: (data: T) => void,
  opts?: { requireAuth?: boolean; enabled?: boolean; maxRetries?: number },
): WSStatus {
  const [status, setStatus] = useState<WSStatus>('disconnected')
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage
  const requireAuth = opts?.requireAuth ?? false
  const enabled = opts?.enabled ?? true
  const maxRetries = opts?.maxRetries ?? 6

  useEffect(() => {
    if (!enabled) {
      setStatus('disconnected')
      return
    }

    let attempt   = 0
    let timer:    ReturnType<typeof setTimeout> | null = null
    let ws:       WebSocket | null = null
    let stopped   = false
    let terminalAuthFailure = false

    function connect() {
      if (stopped || terminalAuthFailure) return
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = import.meta.env.VITE_WS_URL
      const apiUrl = import.meta.env.VITE_API_URL ?? ''
      const host = wsUrl
        ? wsUrl.replace(/^wss?:\/\//, '').replace(/\/$/, '')
        : apiUrl
          ? apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
          : location.host
      const token = requireAuth ? getWebSocketAuthToken() : null
      if (requireAuth && !token) {
        setStatus('unavailable')
        return
      }
      const tokenQuery = token ? `${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : ''
      const url = `${protocol}//${host}${path}${tokenQuery}`
      setStatus('connecting')
      ws = new WebSocket(url)
      ws.onopen = () => {
        if (stopped) return
        attempt = 0
        setStatus('connected')
      }
      ws.onmessage = e => {
        if (stopped || !onMessageRef.current) return
        try {
          onMessageRef.current(JSON.parse(e.data) as T)
        } catch {
          /* ignore non-JSON */
        }
      }
      ws.onclose = (event) => {
        if (stopped) return
        if (isTerminalWebSocketClose(event.code)) {
          terminalAuthFailure = true
          setStatus('unavailable')
          return
        }
        attempt++
        if (shouldMarkWsUnavailable(attempt, maxRetries)) {
          setStatus('unavailable')
          return
        }
        setStatus('disconnected')
        const baseDelay = Math.min(30_000, 1000 * 2 ** Math.min(attempt, 5))
        const jitter = Math.floor(Math.random() * 250)
        const delay = baseDelay + jitter
        timer = setTimeout(connect, delay)
      }
      ws.onerror = () => {
        if (stopped) return
        ws?.close()
      }
    }
    connect()

    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      ws?.close()
    }
  }, [path, requireAuth, enabled, maxRetries])

  return status
}
