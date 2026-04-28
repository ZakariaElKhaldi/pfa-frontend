import { Icons } from '@/components/design-system'

interface DecisionLogHeaderProps {
  id:              string | number
  ticker:          string
  timestamp:       string
  inputSummary:    string
  alertCount:      number
  open:            boolean
  onToggle:        () => void
}

export function DecisionLogHeader({ id, ticker, timestamp, inputSummary, alertCount, open, onToggle }: DecisionLogHeaderProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={`decision-detail-${id}`}
      onClick={onToggle}
      style={{
        width:      '100%',
        display:    'flex',
        alignItems: 'center',
        gap:        'var(--space-4)',
        padding:    'var(--space-3) var(--space-4)',
        background: 'transparent',
        border:     'none',
        cursor:     'pointer',
        textAlign:  'left',
      }}
    >
      <span
        style={{
          fontFamily:   'var(--font-mono)',
          fontWeight:   700,
          fontSize:     'var(--text-mono-sm)',
          color:        'var(--on-surface)',
          padding:      '2px 8px',
          background:   'var(--surface-container-high)',
          borderRadius: 'var(--radius-sm)',
          flexShrink:   0,
        }}
      >
        {ticker}
      </span>

      <time style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {timestamp}
      </time>

      <span style={{ flex: 1, fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {inputSummary}
      </span>

      {alertCount > 0 && (
        <span
          style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          4,
            padding:      '2px 8px',
            borderRadius: 'var(--radius-full)',
            background:   'var(--tertiary-container)',
            color:        'var(--tertiary)',
            fontSize:     'var(--text-label-sm)',
            fontWeight:   600,
            flexShrink:   0,
          }}
        >
          <Icons.AlertTriangle size={11} aria-hidden />
          {alertCount}
        </span>
      )}

      <Icons.ChevronDown
        size={16}
        aria-hidden
        style={{
          color:      'var(--on-surface-muted)',
          flexShrink: 0,
          transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform var(--duration-fast) var(--ease-out)',
        } as React.CSSProperties}
      />
    </button>
  )
}
