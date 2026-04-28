import { Label } from '@/components/ui/label'
import type { ExportFormat } from './types'

interface FormatToggleProps {
  value:     ExportFormat
  onChange:  (f: ExportFormat) => void
  disabled?: boolean
}

export function FormatToggle({ value, onChange, disabled }: FormatToggleProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <Label>Format</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 'var(--radius-md)', overflow: 'hidden', outline: '1px solid var(--outline-variant)' }}>
        {(['json', 'csv'] as ExportFormat[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            disabled={disabled}
            style={{
              padding:       'var(--space-3)',
              fontWeight:    600,
              fontSize:      'var(--text-body-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background:    value === f ? 'var(--primary)' : 'var(--surface-container)',
              color:         value === f ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              border:        'none',
              cursor:        disabled ? 'not-allowed' : 'pointer',
              transition:    'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
