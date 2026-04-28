interface SideToggleProps {
  value:     'buy' | 'sell'
  onChange:  (s: 'buy' | 'sell') => void
  disabled?: boolean
}

export function SideToggle({ value, onChange, disabled }: SideToggleProps) {
  return (
    <div
      style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        borderRadius:        'var(--radius-md)',
        overflow:            'hidden',
        outline:             '1px solid var(--outline-variant)',
      }}
    >
      {(['buy', 'sell'] as const).map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={value === s}
          onClick={() => onChange(s)}
          disabled={disabled}
          style={{
            padding:       'var(--space-3)',
            fontWeight:    600,
            fontSize:      'var(--text-body-md)',
            letterSpacing: '0.02em',
            textTransform: 'capitalize',
            background:    value === s ? (s === 'buy' ? 'var(--secondary)' : 'var(--tertiary)') : 'var(--surface-container)',
            color:         value === s ? (s === 'buy' ? 'var(--on-secondary)' : 'var(--on-tertiary)') : 'var(--on-surface-variant)',
            border:        'none',
            cursor:        disabled ? 'not-allowed' : 'pointer',
            transition:    'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
          }}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
