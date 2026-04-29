import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function StrategiesPage() {
  return (
    <div className="p-6">
      <PageHeader title="Strategies" subtitle="Your automated trading strategies." />
      <EmptyState title="Coming soon" description="Strategies are being wired to live data." />
    </div>
  )
}
