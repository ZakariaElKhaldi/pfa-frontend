import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { StrategyCard } from '@/components/cards/StrategyCard'
import { GuidedStrategyForm, type GuidedStrategyFormValues, type StrategyTickerOption } from '@/components/forms/GuidedStrategyForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'
import type { ActionType, ConditionField, ConditionOperator } from '@/components/forms/StrategyFlow/types'

interface StrategyRule {
  id: number
  name: string
  description: string
  tickers: number[]
  is_active: boolean
  updated_at: string
  conditions?: StrategyConditionPayload[]
  actions?: StrategyActionPayload[]
}

type ModalMode = { type: 'create' } | { type: 'edit'; strategy: StrategyRule } | null
type ActiveFilter = 'all' | 'active' | 'inactive'
const PREVIEW_UPDATED_AT = '2026-05-11T12:00:00.000Z'
const PREVIEW_OLDER_UPDATED_AT = '2026-05-11T10:00:00.000Z'

interface StrategyConditionPayload {
  field: ConditionField
  operator: ConditionOperator
  value: string | number
  logical_op?: 'AND' | 'OR'
  order?: number
}

interface StrategyActionPayload {
  action_type: ActionType
  config?: { target?: string }
  order?: number
}

export function StrategiesPage() {
  useNavigate() // reserved for future strategy detail navigation
  const { state, refetch } = useData<StrategyRule[]>('/api/strategies/')
  const { state: tickersState } = useData<StrategyTickerOption[]>('/api/tickers/')
  const [modal, setModal]   = useState<ModalMode>(null)
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | undefined>()
  const [pendingDelete, setPendingDelete] = useState<StrategyRule | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState<ActiveFilter>('all')
  const tickerOptions = tickersState.status === 'success' ? tickersState.data : []
  const tickerById = new Map(tickerOptions.map(ticker => [ticker.id, ticker]))

  const handleToggle = useCallback(async (id: number, active: boolean) => {
    try {
      await api.post(`/api/strategies/${id}/toggle/`, { is_active: active })
      toast.success(active ? 'Strategy activated' : 'Strategy deactivated')
      refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Toggle failed')
    }
  }, [refetch])

  const handleDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.delete(`/api/strategies/${pendingDelete.id}/`)
      toast.success(`Deleted "${pendingDelete.name}"`)
      setPendingDelete(null)
      refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete, refetch])

  const handleSave = useCallback(async (values: GuidedStrategyFormValues) => {
    setSaving(true)
    setSaveErr(undefined)
    try {
      const payload = {
        name:        values.name,
        description: values.desc,
        tickers:     values.tickers,
        conditions:  values.conditions.map((c, order) => ({ field: c.field, operator: c.operator, value: c.value, logical_op: 'AND', order })),
        actions:     values.actions.map((a, order) => ({ action_type: a.actionType, config: { target: a.target }, order })),
      }
      if (modal?.type === 'edit') {
        await api.patch(`/api/strategies/${modal.strategy.id}/`, payload)
        toast.success('Strategy updated')
      } else {
        await api.post('/api/strategies/', { ...payload, is_active: false })
        toast.success('Strategy created')
      }
      setModal(null)
      refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setSaveErr(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }, [modal, refetch])

  return (
    <div className="p-6 stack stack-5">
      <PageHeader
        title="Strategies"
        subtitle="Your automated trading rules."
        actions={
          <button className="btn btn-sm btn-primary" onClick={() => { setSaveErr(undefined); setModal({ type: 'create' }) }}>
            + New Strategy
          </button>
        }
      />

      {/* Filter chips */}
      {state.status === 'success' && state.data.length > 0 && (
        <div className="cluster cluster-2" style={{ flexWrap: 'wrap' }}>
          {(['all', 'active', 'inactive'] as ActiveFilter[]).map(f => {
            const count = f === 'all'
              ? state.data.length
              : state.data.filter(s => f === 'active' ? s.is_active : !s.is_active).length
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} <span style={{ opacity: 0.7, marginLeft: 4 }}>({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'loading' || state.status === 'idle') && (
        <div className="stack stack-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}
      {state.status === 'success' && state.data.length === 0 && (
        <EmptyState title="No strategies" description="Create your first automated rule." action={
          <button className="btn btn-sm btn-primary" onClick={() => setModal({ type: 'create' })}>Create Strategy</button>
        } />
      )}
      {state.status === 'success' && state.data.length > 0 && (() => {
        const list = state.data.filter(s => filter === 'all' ? true : filter === 'active' ? s.is_active : !s.is_active)
        if (list.length === 0) return <EmptyState title={`No ${filter} strategies`} description="Adjust the filter or create a new strategy." />
        return (
        <div className="stack stack-4">
          {list.map(s => (
            <StrategyCard
              key={s.id}
              id={String(s.id)}
              name={s.name}
              desc={s.description}
              tickers={s.tickers.length > 0 ? s.tickers.map(id => tickerById.get(id)?.symbol ?? `#${id}`) : ['All tickers']}
              executions={0}
              lastRun={new Date(s.updated_at).toLocaleString()}
              active={s.is_active}
              onToggle={active => handleToggle(s.id, active)}
              onEdit={async () => {
                setSaveErr(undefined)
                try {
                  const data = await api.get<{
                    tickers?: number[]
                    conditions?: StrategyConditionPayload[]
                    actions?: StrategyActionPayload[]
                  }>(`/api/strategies/${s.id}/`)
                  setModal({
                    type: 'edit',
                    strategy: {
                      ...s,
                      tickers: data.tickers ?? s.tickers,
                      conditions: data.conditions ?? [],
                      actions: data.actions ?? [],
                    }
                  })
                } catch {
                  toast.error("Failed to load strategy details")
                }
              }}
              onDelete={() => setPendingDelete(s)}
            />
          ))}
        </div>
        )
      })()}

      {/* Strategy create/edit modal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 'var(--space-4)' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span className="text-headline-sm">{modal.type === 'create' ? 'New Strategy' : 'Edit Strategy'}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => setModal(null)}>✕</button>
            </div>
            <GuidedStrategyForm
              initial={modal.type === 'edit' ? {
                name: modal.strategy.name,
                desc: modal.strategy.description,
                tickers: modal.strategy.tickers,
                conditions: modal.strategy.conditions || [],
                actions: (modal.strategy.actions || []).map(action => ({ actionType: action.action_type, target: action.config?.target })),
              } : undefined}
              tickerOptions={tickerOptions}
              onSubmit={handleSave}
              loading={saving}
              error={saveErr}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete strategy?"
        description={pendingDelete ? `"${pendingDelete.name}" will be permanently removed. This cannot be undone.` : undefined}
        confirmText="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

export function StrategiesPagePreview() {
  const [modal, setModal] = useState<ModalMode>(null)
  const strategies: StrategyRule[] = [
    { id: 1, name: 'Bullish Momentum Catch', description: 'BUY when sentiment > 0.6 AND RSI < 65', tickers: [1, 2, 3], is_active: true,  updated_at: PREVIEW_UPDATED_AT },
    { id: 2, name: 'Panic Sell Detector',    description: 'SELL when extreme_sentiment AND consistency < 0.3', tickers: [4, 5], is_active: false, updated_at: PREVIEW_OLDER_UPDATED_AT },
  ]
  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Strategies" subtitle="Your automated trading rules." actions={<button className="btn btn-sm btn-primary" onClick={() => setModal({ type: 'create' })}>+ New Strategy</button>} />
      <div className="stack stack-4">
        {strategies.map(s => (
          <StrategyCard key={s.id} id={String(s.id)} name={s.name} desc={s.description} tickers={s.tickers.length > 0 ? s.tickers.map(id => `#${id}`) : ['All tickers']} executions={0} lastRun={new Date(s.updated_at).toLocaleString()} active={s.is_active} onToggle={() => {}} onEdit={() => setModal({ type: 'edit', strategy: s })} />
        ))}
      </div>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 'var(--space-4)' }} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="card" style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span className="text-headline-sm">{modal.type === 'create' ? 'New Strategy' : 'Edit Strategy'}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => setModal(null)}>✕</button>
            </div>
            <GuidedStrategyForm
              initial={modal.type === 'edit' ? { name: modal.strategy.name, desc: modal.strategy.description, tickers: modal.strategy.tickers } : undefined}
              tickerOptions={[
                { id: 1, symbol: 'AAPL', name: 'Apple Inc.' },
                { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.' },
                { id: 3, symbol: 'NVDA', name: 'NVIDIA Corp.' },
                { id: 4, symbol: 'TSLA', name: 'Tesla Inc.' },
                { id: 5, symbol: 'AMD', name: 'Advanced Micro Devices' },
              ]}
              onSubmit={() => setModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
