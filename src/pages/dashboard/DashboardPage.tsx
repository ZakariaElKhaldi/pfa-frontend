import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function DashboardPage() {
  return (
    <div className="p-6">
      <PageHeader title="Dashboard" subtitle="Your market overview and latest signals." />
      <EmptyState title="Coming soon" description="Dashboard widgets are being wired to live data." />
    </div>
  )
}
