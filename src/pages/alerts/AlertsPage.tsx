import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function AlertsPage() {
  return (
    <div className="p-6">
      <PageHeader title="Alerts" subtitle="Manipulation flags and signal divergences." />
      <EmptyState title="Coming soon" description="Alerts are being wired to live data." />
    </div>
  )
}
