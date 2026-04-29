import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function AuditPage() {
  return (
    <div className="p-6">
      <PageHeader title="Audit" subtitle="Decision logs and scoring history." />
      <EmptyState title="Coming soon" description="Audit logs are being wired to live data." />
    </div>
  )
}
