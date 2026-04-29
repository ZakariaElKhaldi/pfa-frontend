import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function AdminUsersPage() {
  return (
    <div className="p-6">
      <PageHeader title="User Management" subtitle="View and edit all platform users." />
      <EmptyState title="Coming soon" description="User management is being wired to live data." />
    </div>
  )
}
