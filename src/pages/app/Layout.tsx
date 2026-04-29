import { Navigate, Outlet } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/context/AuthContext'

/** Redirects unauthenticated users to /login and wraps the app in AppShell. */
export function AppLayout() {
  const { user, loading } = useAuth()

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
      <AppShell username={user.username} role={user.role}>
        <Outlet />
      </AppShell>
    </div>
  )
}
