import { Handle, Position } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/design-system'
import type { ConditionNodeData, ConditionField, ConditionOperator } from '../types'
import { CONDITION_FIELDS, CONDITION_OPERATORS, OP_LABELS } from '../types'

export function ConditionNode({ data }: { data: ConditionNodeData }) {
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
          <div style={{ padding: 4, background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', borderRadius: 'var(--radius-sm)' }}>
            <Icons.Filter size={14} />
          </div>
          <span className="text-label-md font-semibold text-secondary">Condition</span>
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
          value={data.field}
          onChange={(e) => data.onFieldChange(e.target.value as ConditionField)}
          className="nodrag"
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--outline-variant)',
            background: 'var(--surface-container-high)',
            color: 'var(--on-surface)',
            fontSize: 'var(--text-label-md)',
            flex: 2,
          }}
        >
          {CONDITION_FIELDS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={data.operator}
          onChange={(e) => data.onOperatorChange(e.target.value as ConditionOperator)}
          className="nodrag"
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--outline-variant)',
            background: 'var(--surface-container-high)',
            color: 'var(--primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 700,
            flex: 1,
          }}
        >
          {CONDITION_OPERATORS.map((op) => (
            <option key={op} value={op}>{OP_LABELS[op]}</option>
          ))}
        </select>

        <Input
          value={data.value}
          onChange={(e) => data.onValueChange(e.target.value)}
          placeholder="value"
          className="nodrag"
          style={{ flex: 2, height: 32, fontSize: 'var(--text-label-md)' }}
        />
      </div>

      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: 'var(--primary)' }} />
    </div>
  )
}
