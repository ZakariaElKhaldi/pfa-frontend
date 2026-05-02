import './index.css'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { RoleGate } from '@/components/layout/RoleGate'

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
import { ExportPage } from '@/pages/export/ExportPage'
import { SocialFeedPage } from '@/pages/social/SocialFeedPage'

import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { BacktestPage } from '@/pages/analytics/BacktestPage'
import { CorrelationPage } from '@/pages/analytics/CorrelationPage'
import { HeatmapPage } from '@/pages/analytics/HeatmapPage'
import { IntelligencePage } from '@/pages/intelligence/IntelligencePage'
import { AuditPage } from '@/pages/audit/AuditPage'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'

function AnalystGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return null
  return (
    <RoleGate role={user.role} require="analyst+admin" fallback={<Navigate to="/" replace />}>
      {children}
    </RoleGate>
  )
}

function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return null
  return (
    <RoleGate role={user.role} require="admin" fallback={<Navigate to="/" replace />}>
      {children}
    </RoleGate>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
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
            <Route path="feed"   element={<SocialFeedPage />} />
            <Route path="strategies" element={<StrategiesPage />} />
            <Route path="strategies/:id" element={<StrategyDetailPage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Analyst + Admin */}
            <Route path="analytics"    element={<AnalystGuard><AnalyticsPage /></AnalystGuard>} />
            <Route path="backtest"     element={<AnalystGuard><BacktestPage /></AnalystGuard>} />
            <Route path="correlation"  element={<AnalystGuard><CorrelationPage /></AnalystGuard>} />
            <Route path="heatmap"      element={<AnalystGuard><HeatmapPage /></AnalystGuard>} />
            <Route path="intelligence" element={<AnalystGuard><IntelligencePage /></AnalystGuard>} />
            <Route path="audit"        element={<AnalystGuard><AuditPage /></AnalystGuard>} />

            {/* Admin only */}
            <Route path="admin"       element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
            <Route path="admin/users" element={<AdminGuard><AdminUsersPage /></AdminGuard>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
