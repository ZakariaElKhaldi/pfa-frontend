import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'

import { AppLayout } from '@/pages/app/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { TickersPage } from '@/pages/tickers/TickersPage'
import { TickerDetailPage } from '@/pages/tickers/TickerDetailPage'
import { PortfolioPage } from '@/pages/portfolio/PortfolioPage'
import { AlertsPage } from '@/pages/alerts/AlertsPage'
import { StrategiesPage } from '@/pages/strategies/StrategiesPage'
import { StrategyDetailPage } from '@/pages/strategies/StrategyDetailPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'

import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { IntelligencePage } from '@/pages/intelligence/IntelligencePage'
import { AuditPage } from '@/pages/audit/AuditPage'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — all roles */}
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tickers" element={<TickersPage />} />
            <Route path="tickers/:symbol" element={<TickerDetailPage />} />
            <Route path="watchlist" element={<TickersPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="strategies" element={<StrategiesPage />} />
            <Route path="strategies/:id" element={<StrategyDetailPage />} />
            <Route path="export" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Analyst + Admin */}
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="intelligence" element={<IntelligencePage />} />
            <Route path="audit" element={<AuditPage />} />

            {/* Admin only */}
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
