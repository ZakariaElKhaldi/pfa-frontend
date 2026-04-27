// Operator / field / value display-only row matching the RuleCondition model

import { Icons } from '@/components/design-system'

export type ConditionField =
  | 'sentiment_score' | 'signal' | 'rsi' | 'sma_20' | 'ema_50'
  | 'volume_change' | 'bollinger_position' | 'macd_signal'
  | 'alert_type' | 'mood' | 'price'

export type ConditionOperator =
  | 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq'
  | 'contains' | 'crosses_above' | 'crosses_below'

export interface RuleConditionRowProps {
  field:    ConditionField
  operator: ConditionOperator
  value:    string | number
  /** Optional: show a "remove" button (edit mode) */
  onRemove?: () => void
}

const FIELD_LABELS: Record<ConditionField, string> = {
  sentiment_score:    'Sentiment Score',
  signal:             'Signal',
  rsi:                'RSI',
  sma_20:             'SMA 20',
  ema_50:             'EMA 50',
  volume_change:      'Volume Change',
  bollinger_position: 'Bollinger Position',
  macd_signal:        'MACD Signal',
  alert_type:         'Alert Type',
  mood:               'Mood',
  price:              'Price',
}

const OP_LABELS: Record<ConditionOperator, string> = {
  gt:            '>',
  lt:            '<',
  gte:           '≥',
  lte:           '≤',
  eq:            '=',
  neq:           '≠',
  contains:      '∋',
  crosses_above: '↑ crosses',
  crosses_below: '↓ crosses',
}

export function RuleConditionRow({ field, operator, value, onRemove }: RuleConditionRowProps) {
  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          'var(--space-3)',
        padding:      'var(--space-2) var(--space-4)',
        background:   'var(--surface-container)',
        borderRadius: 'var(--radius-md)',
        fontSize:     'var(--text-body-sm)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color:      'var(--on-surface)',
          fontSize:   'var(--text-mono-sm)',
        }}
      >
        {FIELD_LABELS[field]}
      </span>
      <span
        style={{
          padding:      '1px 6px',
          borderRadius: 'var(--radius-sm)',
          background:   'var(--surface-container-high)',
          fontFamily:   'var(--font-mono)',
          fontSize:     'var(--text-mono-sm)',
          color:        'var(--primary)',
          fontWeight:   700,
        }}
      >
        {OP_LABELS[operator]}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   'var(--text-mono-sm)',
          color:      'var(--on-surface)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(value)}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove condition"
          className="btn-icon"
          style={{
            marginLeft:     'auto',
            width:          20,
            height:         20,
            borderRadius:   'var(--radius-full)',
            background:     'transparent',
            border:         'none',
            color:          'var(--on-surface-muted)',
            cursor:         'pointer',
            transition:     'color var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--tertiary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--on-surface-muted)')}
        >
          <Icons.X size={12} aria-hidden />
        </button>
      )}
    </div>
  )
}
