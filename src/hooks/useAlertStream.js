import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Subscribes to the personal alert stream WebSocket.
 * Returns the most recently triggered alert.
 */
export function useAlertStream() {
  const [lastAlert, setLastAlert] = useState(null)
  const wsRef = useRef(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token')
    const url   = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/alerts/?token=${token}`
    const ws    = new WebSocket(url)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        const alert = JSON.parse(e.data)
        setLastAlert(alert)
      } catch (_) {}
    }

    ws.onclose = (e) => {
      if (e.code !== 1000) setTimeout(connect, 3000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close(1000)
  }, [connect])

  return { lastAlert }
}
