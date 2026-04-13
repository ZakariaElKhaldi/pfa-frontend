import { usePortfolioSummary } from '@/hooks/usePortfolio'
import { useSignalAccuracy } from '@/hooks/useSignals'
import { useSignalStream } from '@/hooks/useSignalStream'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useAlerts } from '@/hooks/useAlerts'
import { formatPrice, formatPct } from '@/lib/utils'
import { Briefcase, Target, Eye, Bell } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import SectionCard from '@/components/shared/SectionCard'
import SignalFeed from '@/components/signals/SignalFeed'
import TrendingTopics from '@/components/social/TrendingTopics'

export default function DashboardPage() {
  const { data: portfolio }  = usePortfolioSummary()
  const { data: accuracy }   = useSignalAccuracy()
  const { data: watchlist }  = useWatchlist()
  const { data: alerts }     = useAlerts()

  /* Single WS connection owned here; SignalFeed reads from TanStack Query cache */
  useSignalStream()

  const unresolvedAlerts = (alerts ?? []).filter((a) => !a.resolved).length

  return (
    <div className="flex flex-col gap-6">

      {/* KPI row — 4 cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Portfolio Value"
          value={portfolio ? `$${formatPrice(portfolio.total_value)}` : '—'}
          sub={portfolio?.total_pnl_pct != null ? `${formatPct(portfolio.total_pnl_pct)} all time` : undefined}
          trend={portfolio?.total_pnl_pct}
          icon={Briefcase}
        />
        <StatCard
          label="Signal Accuracy"
          value={accuracy ? `${accuracy.overall_pct}%` : '—'}
          sub="last 30d"
          icon={Target}
        />
        <StatCard
          label="Watchlist"
          value={watchlist != null ? String(watchlist.length) : '—'}
          sub="tickers tracked"
          icon={Eye}
        />
        <StatCard
          label="Active Alerts"
          value={alerts != null ? String(unresolvedAlerts) : '—'}
          sub="unresolved"
          trend={unresolvedAlerts > 0 ? -1 : 0}
          icon={Bell}
        />
      </div>

      {/* Live feed + trending */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Live Signals" className="lg:col-span-2">
          <SignalFeed limit={20} />
        </SectionCard>
        <SectionCard title="Trending">
          <TrendingTopics />
        </SectionCard>
      </div>
    </div>
  )
}
