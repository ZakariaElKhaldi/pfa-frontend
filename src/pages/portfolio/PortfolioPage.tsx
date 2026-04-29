import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function PortfolioPage() {
  return (
    <div className="p-6">
      <PageHeader title="Portfolio" subtitle="Holdings, trades, and P&L." />
      <EmptyState title="Coming soon" description="Portfolio is being wired to live data." />
    </div>
  )
}
