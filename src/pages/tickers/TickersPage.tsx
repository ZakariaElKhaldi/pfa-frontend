import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function TickersPage() {
  return (
    <div className="p-6">
      <PageHeader title="Market" subtitle="Browse and search all tracked tickers." />
      <EmptyState title="Coming soon" description="Ticker list is being wired to live data." />
    </div>
  )
}
