import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'

import AppShell       from '@/components/layout/AppShell'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminRoute     from '@/components/layout/AdminRoute'

/* auth */
import LoginPage      from '@/pages/auth/LoginPage'
/* dashboard */
import DashboardPage  from '@/pages/dashboard/DashboardPage'
/* market */
import WatchlistPage  from '@/pages/market/WatchlistPage'
import MarketPage     from '@/pages/market/MarketPage'
/* signals */
import SignalsPage    from '@/pages/signals/SignalsPage'
import AlertsPage     from '@/pages/signals/AlertsPage'
/* portfolio */
import PortfolioPage  from '@/pages/portfolio/PortfolioPage'
/* strategies */
import StrategiesPage from '@/pages/strategies/StrategiesPage'
/* social */
import SocialPage     from '@/pages/social/SocialPage'
/* tools */
import ExportPage     from '@/pages/tools/ExportPage'
/* admin */
import AdminPage      from '@/pages/admin/AdminPage'
/* catch-all */
import NotFoundPage   from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={300}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — all inside AppShell */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route id="dashboard"   index                  element={<DashboardPage />} />

            {/* Market */}
            <Route id="watchlist"   path="watchlist"       element={<WatchlistPage />} />
            <Route id="market"      path="market/:symbol"  element={<MarketPage />} />

            {/* Signals */}
            <Route id="signals"     path="signals"         element={<SignalsPage />} />
            <Route id="alerts"      path="alerts"          element={<AlertsPage />} />

            {/* Portfolio */}
            <Route id="portfolio"   path="portfolio"       element={<PortfolioPage />} />

            {/* Strategies */}
            <Route id="strategies"  path="strategies"      element={<StrategiesPage />} />

            {/* Social */}
            <Route id="social"      path="social"          element={<SocialPage />} />

            {/* Tools */}
            <Route id="export"      path="export"          element={<ExportPage />} />

            {/* Admin only */}
            <Route
              id="admin"
              path="admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}
