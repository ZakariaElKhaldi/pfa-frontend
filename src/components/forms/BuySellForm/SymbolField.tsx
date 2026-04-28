import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface SymbolFieldProps {
  fixedSymbol?: string
  value:        string
  onChange:     (v: string) => void
  disabled?:    boolean
}

export function SymbolField({ fixedSymbol, value, onChange, disabled }: SymbolFieldProps) {
  if (fixedSymbol) {
    return (
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        'var(--space-3) var(--space-4)',
          background:     'var(--surface-container)',
          borderRadius:   'var(--radius-md)',
        }}
      >
        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Ticker
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-mono-md)', color: 'var(--on-surface)' }}>
          {fixedSymbol}
        </span>
      </div>
    )
  }

  return (
    <div className="stack stack-2">
      <Label htmlFor="bs-symbol">Ticker</Label>
      <Input
        id="bs-symbol"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="AAPL"
        required
        disabled={disabled}
      />
    </div>
  )
}
