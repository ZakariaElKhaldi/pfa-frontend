import { Handle, Position } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/design-system'
import type { ActionNodeData, ActionType } from '../types'
import { ACTION_TYPES, ACTION_LABELS } from '../types'

export function ActionNode({ data }: { data: ActionNodeData }) {
  return (
    <div
      className="card card-elevated"
      style={{
        width: 320,
        padding: 'var(--space-3)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-container)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: 'var(--primary)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ padding: 4, background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)', borderRadius: 'var(--radius-sm)' }}>
            <Icons.Play size={14} />
          </div>
          <span className="text-label-md font-semibold text-tertiary">Action</span>
        </div>
        <button
          type="button"
          onClick={data.onDelete}
          style={{ color: 'var(--on-surface-muted)', cursor: 'pointer' }}
          className="nodrag"
        >
          <Icons.Trash2 size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <select
          value={data.actionType}
          onChange={(e) => data.onActionTypeChange(e.target.value as ActionType)}
          className="nodrag"
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--outline-variant)',
            background: 'var(--surface-container-high)',
            color: 'var(--on-surface)',
            fontSize: 'var(--text-label-md)',
            flexShrink: 0,
          }}
        >
          {ACTION_TYPES.map((t) => (
            <option key={t} value={t}>{ACTION_LABELS[t]}</option>
          ))}
        </select>

        <Input
          value={data.target ?? ''}
          onChange={(e) => data.onTargetChange(e.target.value)}
          placeholder="target URL/email"
          className="nodrag"
          style={{ flex: 1, height: 32, fontSize: 'var(--text-label-md)' }}
        />
      </div>
    </div>
  )
}
