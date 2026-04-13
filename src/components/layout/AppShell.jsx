import { Outlet, useMatches, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

/**
 * Maps route id → page title.
 * Route ids are set in App.jsx via the `id` prop on each <Route>.
 */
const ROUTE_TITLES = {
  'dashboard':  'Dashboard',
  'watchlist':  'Watchlist',
  'signals':    'Signals',
  'alerts':     'Alerts',
  'portfolio':  'Portfolio',
  'strategies': 'Strategies',
  'social':     'Social Feed',
  'export':     'Export',
  'admin':      'Admin Panel',
  'market':     null, // resolved dynamically from URL param
}

function usePageTitle() {
  const matches = useMatches()
  const params  = useParams()
  const last    = matches[matches.length - 1]
  const id      = last?.id

  if (id === 'market') return params.symbol ?? 'Market'
  return ROUTE_TITLES[id] ?? 'CrowdSignal'
}

export default function AppShell() {
  const title = usePageTitle()

  return (
    <div className="flex h-screen bg-[--color-void] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} />
        <main className="flex-1 overflow-auto bg-[--color-surface] p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
