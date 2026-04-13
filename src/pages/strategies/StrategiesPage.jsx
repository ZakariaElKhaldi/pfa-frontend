import { useState } from 'react'
import {
  useStrategies, useToggleStrategy,
  useDeleteStrategy, useCreateStrategy,
} from '@/hooks/useStrategies'
import SectionCard from '@/components/shared/SectionCard'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { GitBranch, Plus, Trash2, ChevronDown, ChevronRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { useStrategyExecutions } from '@/hooks/useStrategies'

/* ── Action type labels ───────────────────────────────────── */
const ACTION_LABELS = {
  notify:     'In-app notification',
  email:      'Email',
  webhook:    'Webhook',
  log:        'Log only',
  auto_trade: 'Auto trade (post-MVP)',
}

/* ── Execution log sub-panel ──────────────────────────────── */
function ExecutionLog({ strategyId }) {
  const { data: executions, isLoading } = useStrategyExecutions(strategyId)

  if (isLoading) return <LoadingSpinner size={16} className="mx-auto my-4" />
  if (!executions?.length) return (
    <p className="text-xs text-[--color-muted] text-center py-4">No executions yet</p>
  )

  return (
    <div className="flex flex-col gap-1 mt-2">
      {executions.slice(0, 10).map((ex) => (
        <div
          key={ex.id}
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded text-xs',
            ex.success
              ? 'bg-[--color-signal-buy-container] text-[--color-signal-buy]'
              : 'bg-[--color-signal-sell-container] text-[--color-signal-sell]'
          )}
        >
          <div className="flex items-center gap-2">
            <Play size={10} />
            <span className="font-mono">{ex.event_type}</span>
          </div>
          <span className="text-[--color-muted]">
            {formatDistanceToNow(new Date(ex.triggered_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Single strategy row ──────────────────────────────────── */
function StrategyRow({ strategy }) {
  const [expanded, setExpanded]   = useState(false)
  const toggle = useToggleStrategy()
  const remove = useDeleteStrategy()

  const { name, description, is_active, conditions, actions, tickers, created_at } = strategy

  return (
    <div className="rounded-lg bg-[--color-surface-low] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[--color-muted] hover:text-[--color-subtle] shrink-0"
        >
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[--color-max-text]">{name}</span>
            {tickers?.map((t) => (
              <Badge
                key={t.symbol ?? t}
                variant="outline"
                className="text-[10px] px-1.5 py-0 font-mono border-[--color-container] text-[--color-subtle]"
              >
                {t.symbol ?? t}
              </Badge>
            ))}
          </div>
          {description && (
            <p className="text-xs text-[--color-subtle] mt-0.5 truncate">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-[--color-muted] hidden sm:block">
            {created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : ''}
          </span>
          <Switch
            checked={is_active}
            onCheckedChange={() => toggle.mutate(strategy.id)}
            className="data-[state=checked]:bg-[--color-signal-buy]"
          />
          <button
            onClick={() => remove.mutate(strategy.id)}
            className="text-[--color-muted] hover:text-[--color-signal-sell] transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[--color-void] px-4 py-3 flex flex-col gap-4">
          {/* Conditions */}
          {conditions?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[--color-muted] uppercase tracking-wider mb-2">
                Conditions
              </p>
              <div className="flex flex-col gap-1">
                {conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {i > 0 && (
                      <span className="text-[10px] font-mono font-bold text-[--color-action]">
                        {c.logical_op}
                      </span>
                    )}
                    <span className="font-mono text-[--color-secondary] bg-[--color-container] px-2 py-0.5 rounded">
                      {c.field} {c.operator} {c.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {actions?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[--color-muted] uppercase tracking-wider mb-2">
                Actions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {actions.map((a, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[--color-action-container] text-[--color-action-hover] font-medium"
                  >
                    {ACTION_LABELS[a.action_type] ?? a.action_type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Execution log */}
          <div>
            <p className="text-[10px] font-semibold text-[--color-muted] uppercase tracking-wider mb-1">
              Recent Executions
            </p>
            <ExecutionLog strategyId={strategy.id} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Create strategy form ─────────────────────────────────── */
const FIELD_OPTIONS = [
  { value: 'sentiment_score',    label: 'Sentiment Score' },
  { value: 'signal',             label: 'Signal (BUY/SELL/HOLD)' },
  { value: 'rsi',                label: 'RSI' },
  { value: 'sma_20',             label: 'SMA 20' },
  { value: 'ema_50',             label: 'EMA 50' },
  { value: 'volume_change',      label: 'Volume Change' },
  { value: 'bollinger_position', label: 'Bollinger Position' },
  { value: 'macd_signal',        label: 'MACD Signal' },
  { value: 'price',              label: 'Price' },
  { value: 'mood',               label: 'Market Mood' },
]

const OPERATOR_OPTIONS = [
  { value: 'gt',            label: '>' },
  { value: 'lt',            label: '<' },
  { value: 'gte',           label: '>=' },
  { value: 'lte',           label: '<=' },
  { value: 'eq',            label: '==' },
  { value: 'crosses_above', label: 'crosses above' },
  { value: 'crosses_below', label: 'crosses below' },
]

const ACTION_OPTIONS = [
  { value: 'notify',  label: 'In-app notification' },
  { value: 'email',   label: 'Email' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'log',     label: 'Log only' },
]

const BLANK_CONDITION = { field: 'sentiment_score', operator: 'gt', value: '', logical_op: 'AND' }

function CreateStrategyDialog({ onClose }) {
  const create = useCreateStrategy()
  const [name, setName]             = useState('')
  const [description, setDesc]      = useState('')
  const [conditions, setConditions] = useState([{ ...BLANK_CONDITION }])
  const [actionType, setActionType] = useState('notify')

  const updateCondition = (i, field, val) =>
    setConditions((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))

  const handleSubmit = (e) => {
    e.preventDefault()
    create.mutate(
      {
        name,
        description,
        conditions: conditions.map((c, i) => ({ ...c, order: i })),
        actions: [{ action_type: actionType, config: {}, order: 0 }],
      },
      { onSuccess: onClose }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-[--color-subtle]">Strategy name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My strategy"
          required
          className="h-9 text-sm bg-[--color-surface] border-[--color-container]"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-[--color-subtle]">Description (optional)</Label>
        <Input
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Trigger when…"
          className="h-9 text-sm bg-[--color-surface] border-[--color-container]"
        />
      </div>

      {/* Conditions */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-[--color-subtle]">Conditions</Label>
        {conditions.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 flex-wrap">
            {i > 0 && (
              <Select value={c.logical_op} onValueChange={(v) => updateCondition(i, 'logical_op', v)}>
                <SelectTrigger className="w-16 h-8 text-xs bg-[--color-surface] border-[--color-container]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={c.field} onValueChange={(v) => updateCondition(i, 'field', v)}>
              <SelectTrigger className="w-40 h-8 text-xs bg-[--color-surface] border-[--color-container]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
                {FIELD_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={c.operator} onValueChange={(v) => updateCondition(i, 'operator', v)}>
              <SelectTrigger className="w-28 h-8 text-xs bg-[--color-surface] border-[--color-container]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
                {OPERATOR_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              value={c.value}
              onChange={(e) => updateCondition(i, 'value', e.target.value)}
              placeholder="value"
              className="w-24 h-8 text-xs bg-[--color-surface] border-[--color-container] font-mono"
              required
            />
            {conditions.length > 1 && (
              <button
                type="button"
                onClick={() => setConditions((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-[--color-muted] hover:text-[--color-signal-sell]"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setConditions((prev) => [...prev, { ...BLANK_CONDITION }])}
          className="text-xs text-[--color-action] hover:text-[--color-action-hover] text-left mt-1 w-fit"
        >
          + Add condition
        </button>
      </div>

      {/* Action */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-[--color-subtle]">Action when triggered</Label>
        <Select value={actionType} onValueChange={setActionType}>
          <SelectTrigger className="h-9 text-sm bg-[--color-surface] border-[--color-container]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
            {ACTION_OPTIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={create.isPending}
        className="h-9 bg-[--color-action] hover:bg-[--color-action-hover] text-white"
      >
        {create.isPending ? 'Creating…' : 'Create Strategy'}
      </Button>
    </form>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function StrategiesPage() {
  const { data: strategies, isLoading } = useStrategies()
  const [dialogOpen, setDialogOpen]     = useState(false)

  const active   = strategies?.filter((s) => s.is_active).length ?? 0
  const total    = strategies?.length ?? 0

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <SectionCard
        title="Automation Strategies"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-[--color-action] hover:bg-[--color-action-hover] text-white text-xs"
              >
                <Plus size={13} /> New Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-[--color-surface-low] border-[--color-container]">
              <DialogHeader>
                <DialogTitle className="text-sm text-[--color-primary-text]">
                  Create Strategy
                </DialogTitle>
              </DialogHeader>
              <CreateStrategyDialog onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      >
        {/* Summary chips */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-[--color-subtle]">{total} strategies</span>
          <span className="text-[--color-muted]">·</span>
          <span className={cn(
            'text-xs font-medium',
            active > 0 ? 'text-[--color-signal-buy]' : 'text-[--color-muted]'
          )}>
            {active} active
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><LoadingSpinner size={24} /></div>
        ) : !strategies?.length ? (
          <EmptyState
            icon={GitBranch}
            title="No strategies yet"
            description="Create rules that trigger notifications or actions when market conditions are met."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {strategies.map((s) => <StrategyRow key={s.id} strategy={s} />)}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
