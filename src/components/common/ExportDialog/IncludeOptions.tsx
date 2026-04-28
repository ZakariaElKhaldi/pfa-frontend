import { Label } from '@/components/ui/label'
import { INCLUDE_OPTIONS, type ExportInclude } from './types'

interface IncludeOptionsProps {
  value:     ExportInclude[]
  onChange:  (v: ExportInclude[]) => void
  disabled?: boolean
}

export function IncludeOptions({ value, onChange, disabled }: IncludeOptionsProps) {
  function toggle(key: ExportInclude) {
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <Label>Include</Label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)' }}>
        {INCLUDE_OPTIONS.map(({ key, label }) => {
          const checked = value.includes(key)
          return (
            <label
              key={key}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          'var(--space-3)',
                padding:      'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background:   checked ? 'color-mix(in srgb, var(--primary) 12%, var(--surface-container-low))' : 'var(--surface-container)',
                border:       `1px solid ${checked ? 'var(--primary)' : 'transparent'}`,
                cursor:       disabled ? 'not-allowed' : 'pointer',
                fontSize:     'var(--text-body-sm)',
                color:        checked ? 'var(--primary)' : 'var(--on-surface)',
                fontWeight:   checked ? 600 : 400,
                transition:   'all var(--duration-fast) var(--ease-out)',
                userSelect:   'none',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(key)}
                disabled={disabled}
                style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
              />
              {label}
            </label>
          )
        })}
      </div>
    </div>
  )
}
