import { useCallback, useRef } from 'react'
import { Navigate, Outlet } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/context/AuthContext'
import { useWSStatus } from '@/hooks/useWSStatus'
import { showSignalToast } from '@/components/common/SignalToast'
import type { Signal } from '@/design-system/tokens'

interface SignalEvent {
  id:                    number
  ticker_symbol:         string
  signal:                Signal
  prediction_confidence: number
  created_at:            string
}

/** Redirects unauthenticated users to /login and wraps the app in AppShell. */
export function AppLayout() {
  const { user, loading } = useAuth()
  const lastSeenRef = useRef<number>(0)

  const handleSignal = useCallback((data: SignalEvent) => {
    if (!data?.signal || !data.ticker_symbol) return
    if (data.id && data.id <= lastSeenRef.current) return
    lastSeenRef.current = data.id ?? lastSeenRef.current
    if (data.signal === 'BUY' || data.signal === 'SELL') {
      showSignalToast({
        symbol:    data.ticker_symbol,
        signal:    data.signal,
        price:     data.prediction_confidence ? `${(data.prediction_confidence * 100).toFixed(0)}% conf` : '—',
        timestamp: new Date(data.created_at ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }, [])

  const wsStatus = useWSStatus<SignalEvent>('/ws/signals/', handleSignal)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-base)' }}>
        <span className="text-body-md" style={{ color: 'var(--on-surface-muted)' }}>Loading…</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="h-screen">
      <AppShell username={user.username} role={user.role} wsStatus={wsStatus}>
        <Outlet />
      </AppShell>
    </div>
  )
}
