import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function AnalyticsPage() {
  return (
    <div className="p-6">
      <PageHeader title="Analytics" subtitle="Cross-ticker intelligence, correlation, and backtests." />
      <EmptyState title="Coming soon" description="Analytics are being wired to live data." />
    </div>
  )
}
