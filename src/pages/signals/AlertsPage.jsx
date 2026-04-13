import { useState, useMemo } from 'react'
import { useAlerts } from '@/hooks/useAlerts'
import AlertCard from '@/components/alerts/AlertCard'
import AlertForm from '@/components/alerts/AlertForm'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Bell } from 'lucide-react'

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts()
  const [filters, setFilters]       = useState({ resolved: 'unresolved' })

  const filtered = useMemo(() => {
    if (!alerts) return []
    let result = [...alerts]
    if (filters.type) result = result.filter((a) => a.type === filters.type)
    if (filters.resolved === 'unresolved') result = result.filter((a) => !a.resolved)
    if (filters.resolved === 'resolved')   result = result.filter((a) => a.resolved)
    return result
  }, [alerts, filters])

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-[--color-primary-text]">
          System Alerts
          {filtered.length > 0 && (
            <span className="ml-2 text-xs text-[--color-subtle] font-normal">{filtered.length}</span>
          )}
        </h2>
        <AlertForm filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size={24} /></div>
      ) : !filtered.length ? (
        <EmptyState icon={Bell} title="No alerts" description="System alerts appear here when divergences or extreme sentiment are detected." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((a) => <AlertCard key={a.id} alert={a} />)}
        </div>
      )}
    </div>
  )
}
