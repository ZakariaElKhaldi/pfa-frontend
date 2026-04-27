import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/design-system'

export type ExportFormat  = 'json' | 'csv'
export type ExportInclude = 'posts' | 'signals' | 'prices' | 'alerts'

export interface ExportDialogValues {
  symbol?:   string
  format:    ExportFormat
  include:   ExportInclude[]
  from:      string
  to:        string
}

export interface ExportDialogProps {
  /** Pre-populate + lock the ticker field, or leave blank for signal/portfolio exports */
  symbol?:    string
  onExport:   (v: ExportDialogValues) => void
  onCancel?:  () => void
  loading?:   boolean
}

const INCLUDE_OPTIONS: { key: ExportInclude; label: string }[] = [
  { key: 'posts',   label: 'Social Posts'   },
  { key: 'signals', label: 'Signals'        },
  { key: 'prices',  label: 'Price History'  },
  { key: 'alerts',  label: 'Alert Flags'    },
]

export function ExportDialog({
  symbol: fixedSymbol,
  onExport,
  onCancel,
  loading,
}: ExportDialogProps) {
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)

  const [format,  setFormat]  = useState<ExportFormat>('json')
  const [include, setInclude] = useState<ExportInclude[]>(['signals', 'prices'])
  const [from,    setFrom]    = useState(weekAgo)
  const [to,      setTo]      = useState(today)

  function toggleInclude(key: ExportInclude) {
    setInclude((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  function handleExport() {
    onExport({ symbol: fixedSymbol, format, include, from, to })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export data"
      style={{
        display:      'flex',
        flexDirection:'column',
        gap:          'var(--space-6)',
        padding:      'var(--space-8)',
        background:   'var(--surface-container-low)',
        borderRadius: 'var(--radius-xl)',
        maxWidth:     480,
        width:        '100%',
        boxShadow:    'var(--shadow-lg)',
      }}
    >
      {/* Header */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <h2 style={{ fontSize: 'var(--text-headline-sm)', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
          Export Data
        </h2>
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)', margin: 0 }}>
          {fixedSymbol ? `Exporting data for ${fixedSymbol}` : 'Configure and download your data export.'}
        </p>
      </header>

      {/* Format */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Label>Format</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 'var(--radius-md)', overflow: 'hidden', outline: '1px solid var(--outline-variant)' }}>
          {(['json', 'csv'] as ExportFormat[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              disabled={loading}
              style={{
                padding:   'var(--space-3)',
                fontWeight: 600,
                fontSize:  'var(--text-body-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: format === f ? 'var(--primary)' : 'var(--surface-container)',
                color:      format === f ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                border:     'none',
                cursor:     loading ? 'not-allowed' : 'pointer',
                transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Include */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Label>Include</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)' }}>
          {INCLUDE_OPTIONS.map(({ key, label }) => {
            const checked = include.includes(key)
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
                  cursor:       loading ? 'not-allowed' : 'pointer',
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
                  onChange={() => toggleInclude(key)}
                  disabled={loading}
                  style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
                />
                {label}
              </label>
            )
          })}
        </div>
      </div>

      {/* Date range */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Label htmlFor="export-from">From</Label>
          <input
            id="export-from"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            disabled={loading}
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
            onChange={(e) => setTo(e.target.value)}
            disabled={loading}
            className="input"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-md btn-secondary" disabled={loading}>
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleExport}
          className="btn btn-md btn-primary"
          disabled={loading || include.length === 0}
        >
          {loading ? 'Exporting…' : <><Icons.Download size={14} aria-hidden style={{ marginRight: 4 }} /> Export</>}
        </button>
      </div>
    </div>
  )
}
