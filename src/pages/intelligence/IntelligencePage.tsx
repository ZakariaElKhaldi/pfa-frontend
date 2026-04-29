import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function IntelligencePage() {
  return (
    <div className="p-6">
      <PageHeader title="Intelligence" subtitle="Manipulation flags, mood snapshots, and retrain logs." />
      <EmptyState title="Coming soon" description="Intelligence views are being wired to live data." />
    </div>
  )
}
