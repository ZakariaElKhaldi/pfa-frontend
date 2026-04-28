import { Label } from '@/components/ui/label'

interface DateRangeProps {
  from:      string
  to:        string
  today:     string
  onFrom:    (v: string) => void
  onTo:      (v: string) => void
  disabled?: boolean
}

export function DateRange({ from, to, today, onFrom, onTo, disabled }: DateRangeProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="export-from">From</Label>
        <input
          id="export-from"
          type="date"
          value={from}
          max={to}
          onChange={(e) => onFrom(e.target.value)}
          disabled={disabled}
          className="input"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label htmlFor="export-to">To</Label>
        <input
          id="export-to"
          type="date"
          value={to}
          min={from}
          max={today}
          onChange={(e) => onTo(e.target.value)}
          disabled={disabled}
          className="input"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)' }}
        />
      </div>
    </div>
  )
}
