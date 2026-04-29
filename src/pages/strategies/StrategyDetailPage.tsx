import { useParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function StrategyDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="p-6">
      <PageHeader title={`Strategy #${id}`} subtitle="Execution log and configuration." />
      <EmptyState title="Coming soon" description="Strategy detail is being wired to live data." />
    </div>
  )
}
