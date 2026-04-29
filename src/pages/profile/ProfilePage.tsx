import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function ProfilePage() {
  return (
    <div className="p-6">
      <PageHeader title="Profile" subtitle="Account settings and preferences." />
      <EmptyState title="Coming soon" description="Profile settings are being wired." />
    </div>
  )
}
