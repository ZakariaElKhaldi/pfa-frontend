import { useState } from 'react'
import { Icons } from '@/components/design-system'
import { FormatToggle } from './FormatToggle'
import { IncludeOptions } from './IncludeOptions'
import { DateRange } from './DateRange'
import type { ExportDialogProps, ExportDialogValues, ExportFormat, ExportInclude } from './types'

export type { ExportDialogProps, ExportDialogValues, ExportFormat, ExportInclude }

export function ExportDialog({ symbol: fixedSymbol, onExport, onCancel, loading }: ExportDialogProps) {
  const today   = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)

  const [format,  setFormat]  = useState<ExportFormat>('json')
  const [include, setInclude] = useState<ExportInclude[]>(['signals', 'prices'])
  const [from,    setFrom]    = useState(weekAgo)
  const [to,      setTo]      = useState(today)

  function handleExport() {
    onExport({ symbol: fixedSymbol, format, include, from, to } satisfies ExportDialogValues)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export data"
      style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           'var(--space-6)',
        padding:       'var(--space-8)',
        background:    'var(--surface-container-low)',
        borderRadius:  'var(--radius-xl)',
        maxWidth:      480,
        width:         '100%',
        boxShadow:     'var(--shadow-lg)',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <h2 style={{ fontSize: 'var(--text-headline-sm)', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
          Export Data
        </h2>
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)', margin: 0 }}>
          {fixedSymbol ? `Exporting data for ${fixedSymbol}` : 'Configure and download your data export.'}
        </p>
      </header>

      <FormatToggle  value={format}  onChange={setFormat}  disabled={loading} />
      <IncludeOptions value={include} onChange={setInclude} disabled={loading} />
      <DateRange from={from} to={to} today={today} onFrom={setFrom} onTo={setTo} disabled={loading} />

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
