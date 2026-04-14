import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import AlertCard from '@/components/alerts/AlertCard'
import AlertForm from '@/components/alerts/AlertForm'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import LiveDot from '@/components/shared/LiveDot'
import { useAlerts } from '@/hooks/useAlerts'
import { useAlertStream } from '@/hooks/useAlertStream'
import { Bell } from 'lucide-react'

/* ─── Main component ─────────────────────────────────── */
export default function AlertFeed() {
  const [filters, setFilters] = useState({ type: undefined, resolved: 'unresolved' })
  const { data: alerts, isLoading } = useAlerts()
  const { lastAlert }               = useAlertStream()
  const qc                          = useQueryClient()

  /* Invalidate alerts query when a new WS alert arrives */
  useEffect(() => {
    if (lastAlert) {
      qc.invalidateQueries({ queryKey: ['alerts'] })
    }
  }, [lastAlert, qc])

  /* Client-side filter */
  const filtered = (alerts ?? []).filter((a) => {
    if (filters.type && a.type !== filters.type) return false
    if (filters.resolved === 'unresolved' && a.resolved) return false
    if (filters.resolved === 'resolved'   && !a.resolved) return false
    return true
  })

  const unresolvedCount = (alerts ?? []).filter((a) => !a.resolved).length

  return (
    <div className="flex flex-col gap-4">

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="text-xs font-semibold text-subtle uppercase tracking-wider">
            Alert Feed
          </span>
          {unresolvedCount > 0 && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-signal-sell-container text-signal-sell border border-signal-sell-border">
              {unresolvedCount} unresolved
            </span>
          )}
        </div>
        <AlertForm filters={filters} onChange={setFilters} />
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size={20} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts"
          description={
            filters.resolved === 'unresolved'
              ? 'All caught up — no unresolved alerts.'
              : 'No alerts match the current filter.'
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}
