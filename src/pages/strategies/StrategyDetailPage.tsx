import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { StrategyExecutionLog, type StrategyExecution } from '@/components/cards/StrategyExecutionLog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'

interface StrategyRule {
  id: number; name: string; description: string; is_active: boolean
  created_at?: string; updated_at: string
}
interface BackendExecution {
  id: number; triggered_at: string; event_type: string; event_data: Record<string, unknown>
  conditions_matched: unknown[]; actions_taken: unknown[]; success: boolean
}

export function StrategyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { state: strategy, refetch: refetchStrategy } = useData<StrategyRule>(id ? `/api/strategies/${id}/` : null)
  const { state: execs, refetch }                     = useData<BackendExecution[]>(id ? `/api/strategies/${id}/executions/` : null)

  const [pendingDelete, setPendingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleToggle = useCallback(async () => {
    if (strategy.status !== 'success') return
    setToggling(true)
    try {
      const newActive = !strategy.data.is_active
      await api.post(`/api/strategies/${id}/toggle/`, { is_active: newActive })
      toast.success(newActive ? 'Strategy activated' : 'Strategy deactivated')
      refetchStrategy()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Toggle failed')
    } finally {
      setToggling(false)
    }
  }, [strategy, id, refetchStrategy])

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/strategies/${id}/`)
      toast.success('Strategy deleted')
      navigate('/strategies')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
      setDeleting(false)
    }
  }, [id, navigate])

  const executions: StrategyExecution[] = execs.status === 'success'
    ? execs.data.map(e => ({
        id:           e.id,
        executedAt:   new Date(e.triggered_at).toLocaleString(),
        ticker:       (e.event_data?.symbol as string) ?? e.event_type,
        triggered:    e.success,
        actionsTaken: Array.isArray(e.actions_taken) ? e.actions_taken.map(String) : [],
        notes:        Array.isArray(e.conditions_matched) && e.conditions_matched.length > 0
          ? `${e.conditions_matched.length} condition(s) matched`
          : undefined,
      }))
    : []

  const name = strategy.status === 'success' ? strategy.data.name : `Strategy #${id}`
  const isActive = strategy.status === 'success' ? strategy.data.is_active : null

  if (!id) {
    return (
      <div className="p-6">
        <ErrorState message="No strategy ID provided." onRetry={() => navigate('/strategies')} />
      </div>
    )
  }

  return (
    <div className="p-6 stack stack-6">
      <PageHeader
        title={name}
        subtitle="Execution log and configuration."
        actions={
          strategy.status === 'success' && (
            <div className="cluster cluster-2">
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/strategies')}>← Back</button>
              <button
                className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleToggle}
                disabled={toggling}
              >
                {toggling ? '…' : isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/strategies')}>
                Edit
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setPendingDelete(true)} style={{ color: 'var(--tertiary)' }}>
                Delete
              </button>
            </div>
          )
        }
      />

      {strategy.status === 'error' && <ErrorState message={strategy.message} onRetry={refetchStrategy} />}
      {(strategy.status === 'idle' || strategy.status === 'loading') && <Skeleton className="h-32 w-full" />}

      {strategy.status === 'success' && (
        <div className="card stack stack-4">
          {/* Status row */}
          <div className="cluster cluster-3" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              className="cluster cluster-2"
              style={{
                alignItems: 'center',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                background: isActive
                  ? 'color-mix(in srgb, var(--secondary) 15%, transparent)'
                  : 'color-mix(in srgb, var(--on-surface-muted) 12%, transparent)',
                color: isActive ? 'var(--secondary)' : 'var(--on-surface-muted)',
                fontSize: 'var(--text-label-sm)',
                fontWeight: 500,
                letterSpacing: 'var(--tracking-label-pro)',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {isActive ? 'Active' : 'Inactive'}
            </span>
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
              Updated {new Date(strategy.data.updated_at).toLocaleString()}
            </span>
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
              {execs.status === 'success' ? `${execs.data.length} execution${execs.data.length === 1 ? '' : 's'}` : ''}
            </span>
          </div>

          {/* Description */}
          <div className="stack stack-1">
            <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
              Description
            </span>
            <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--on-surface)', margin: 0 }}>
              {strategy.data.description || <em style={{ color: 'var(--on-surface-muted)' }}>No description.</em>}
            </p>
          </div>
        </div>
      )}

      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
          Execution Log
        </span>
        {execs.status === 'error'                                && <ErrorState message={execs.message} onRetry={refetch} />}
        {(execs.status === 'idle' || execs.status === 'loading') && <Skeleton className="h-32 w-full" />}
        {execs.status === 'success' && executions.length === 0   && (
          <EmptyState title="No executions yet" description="This strategy hasn't run yet." />
        )}
        {execs.status === 'success' && executions.length > 0 && (
          <StrategyExecutionLog executions={executions} />
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete}
        title="Delete strategy?"
        description={strategy.status === 'success' ? `"${strategy.data.name}" will be permanently removed. This cannot be undone.` : undefined}
        confirmText="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(false)}
      />
    </div>
  )
}

export function StrategyDetailPagePreview({ id = '1' }: { id?: string }) {
  const executions: StrategyExecution[] = [
    { id: 1, executedAt: '2024-01-15 09:31', ticker: 'AAPL', triggered: true,  actionsTaken: ['BUY 10 AAPL @ $189.42'],           notes: '3 conditions matched' },
    { id: 2, executedAt: '2024-01-14 14:10', ticker: 'NVDA', triggered: false, actionsTaken: [],                                  notes: 'RSI condition not met' },
    { id: 3, executedAt: '2024-01-13 09:30', ticker: 'MSFT', triggered: true,  actionsTaken: ['NOTIFY: MSFT sentiment crossed 0.6'], notes: '2 conditions matched' },
  ]
  return (
    <div className="p-6 stack stack-5">
      <PageHeader title={`Strategy #${id}`} subtitle="Execution log and configuration." />
      <div className="card">
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
          BUY when sentiment &gt; 0.6 AND RSI &lt; 65 AND signal == BUY
        </p>
      </div>
      <StrategyExecutionLog executions={executions} />
    </div>
  )
}
