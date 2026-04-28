export type ExportFormat  = 'json' | 'csv'
export type ExportInclude = 'posts' | 'signals' | 'prices' | 'alerts'

export interface ExportDialogValues {
  symbol?:  string
  format:   ExportFormat
  include:  ExportInclude[]
  from:     string
  to:       string
}

export interface ExportDialogProps {
  symbol?:   string
  onExport:  (v: ExportDialogValues) => void
  onCancel?: () => void
  loading?:  boolean
}

export const INCLUDE_OPTIONS: { key: ExportInclude; label: string }[] = [
  { key: 'posts',   label: 'Social Posts'  },
  { key: 'signals', label: 'Signals'       },
  { key: 'prices',  label: 'Price History' },
  { key: 'alerts',  label: 'Alert Flags'   },
]
