import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ExportDialog, type ExportDialogValues } from '@/components/common/ExportDialog'
import { EmptyState } from '@/components/layout/EmptyState'
import { api, tokenStore } from '@/lib/api'

interface ExportRecord {
  id:        string
  filename:  string
  symbol?:   string
  format:    'csv' | 'json'
  from:      string
  to:        string
  createdAt: number
}

const HISTORY_KEY = 'cs_export_history'
const MAX_HISTORY = 10

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}
function ytdStartIso(): string {
  return `${new Date().getFullYear()}-01-01`
}

const PRESETS: { label: string; description: string; build: () => ExportDialogValues }[] = [
  {
    label: 'Last 7 days — All',
    description: 'CSV bundle of last week',
    build: () => ({ format: 'csv',  include: ['signals', 'prices', 'posts'], from: daysAgoIso(7),  to: daysAgoIso(0) }),
  },
  {
    label: 'Last 30 days — Signals',
    description: 'JSON of monthly signals',
    build: () => ({ format: 'json', include: ['signals'],                     from: daysAgoIso(30), to: daysAgoIso(0) }),
  },
  {
    label: 'Year-to-date — All',
    description: 'CSV bundle since Jan 1',
    build: () => ({ format: 'csv',  include: ['signals', 'prices', 'alerts'], from: ytdStartIso(),  to: daysAgoIso(0) }),
  },
]

export function ExportPage() {
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<ExportRecord[]>([])

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')) } catch { /* ignore */ }
  }, [])

  const recordHistory = (rec: ExportRecord) => {
    setHistory(prev => {
      const next = [rec, ...prev].slice(0, MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleExport = useCallback(async (values: ExportDialogValues) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (values.symbol)         params.set('symbols', values.symbol)
      if (values.include.length) params.set('include', values.include.join(','))
      params.set('format', values.format)
      params.set('from',   values.from)
      params.set('to',     values.to)

      const url = values.symbol ? `/api/export/${values.symbol}/?${params}` : `/api/export/bulk/?${params}`
      const filename = `export-${values.symbol ?? 'all'}-${values.from}.${values.format}`

      if (values.format === 'csv') {
        const token = tokenStore.get()
        const res   = await fetch(`${(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')}${url}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.ok) throw new Error(`Export failed (${res.status})`)
        downloadBlob(await res.blob(), filename)
      } else {
        const data = await api.get<unknown>(url)
        downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename)
      }

      recordHistory({
        id: crypto.randomUUID(), filename, symbol: values.symbol, format: values.format,
        from: values.from, to: values.to, createdAt: Date.now(),
      })
      toast.success('Export downloaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Export" subtitle="Download signal, price, and alert data." />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(280px, 380px)', gap: 'var(--space-6)', alignItems: 'start' }}>
        <ExportDialog onExport={handleExport} loading={loading} />

        <div className="stack stack-5">
          <div className="stack stack-3">
            <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
              Quick Presets
            </span>
            <div className="stack stack-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="card"
                  onClick={() => handleExport(p.build())}
                  disabled={loading}
                  style={{ textAlign: 'left', cursor: loading ? 'not-allowed' : 'pointer', border: '1px solid var(--outline-variant)', transition: 'border-color 0.15s', opacity: loading ? 0.6 : 1 }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--outline-variant)'}
                >
                  <div className="stack stack-1">
                    <span style={{ fontSize: 'var(--text-body-md)', fontWeight: 500 }}>{p.label}</span>
                    <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>{p.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="stack stack-3">
            <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
              Recent Exports
            </span>
            {history.length === 0 ? (
              <EmptyState title="No exports yet" description="Your downloads will show up here." />
            ) : (
              <div className="stack stack-2">
                {history.map(h => (
                  <div key={h.id} className="card" style={{ padding: 'var(--space-3)' }}>
                    <div className="stack stack-1">
                      <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{h.filename}</span>
                      <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
                        {new Date(h.createdAt).toLocaleString()} · {h.format.toUpperCase()} · {h.from} → {h.to}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExportPagePreview({
  loading = false,
}: {
  loading?: boolean
}) {
  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Export" subtitle="Download signal, price, and alert data." />
      <ExportDialog onExport={() => {}} loading={loading} />
    </div>
  )
}
