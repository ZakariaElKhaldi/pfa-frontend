import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function AdminDashboardPage() {
  return (
    <div className="p-6">
      <PageHeader title="Admin" subtitle="Platform stats and system overview." />
      <EmptyState title="Coming soon" description="Admin dashboard is being wired to live data." />
    </div>
  )
}
