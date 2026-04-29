import { useParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'

export function TickerDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  return (
    <div className="p-6">
      <PageHeader title={symbol ?? ''} subtitle="Price, signals, and sentiment for this ticker." />
      <EmptyState title="Coming soon" description="Ticker detail is being wired to live data." />
    </div>
  )
}
