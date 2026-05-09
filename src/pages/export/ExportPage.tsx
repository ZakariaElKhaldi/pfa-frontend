import { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/layout/EmptyState'
import { Icons } from '@/components/design-system'
import { useData } from '@/hooks/useApi'
import { api, tokenStore } from '@/lib/api'

interface ExportRecord {
  id: string; filename: string; symbol?: string; format: 'csv' | 'json'
  from: string; to: string; createdAt: number; includes: string[]
}

interface TickerItem { symbol: string; name: string }

const HISTORY_KEY = 'cs_export_history'
const MAX_HISTORY = 10

const ALL_INCLUDES = [
  { key: 'signals',  label: 'Signals',  icon: <Icons.Zap size={16} />, desc: 'Buy/Sell/Hold snapshots' },
  { key: 'prices',   label: 'Prices',   icon: <Icons.LineChart size={16} />, desc: 'OHLCV price snapshots' },
  { key: 'posts',    label: 'Posts',    icon: <Icons.MessageSquare size={16} />, desc: 'Social post data' },
  { key: 'alerts',   label: 'Alerts',   icon: <Icons.Bell size={16} />, desc: 'Alert flags' },
] as const

type IncludeKey = typeof ALL_INCLUDES[number]['key']

const PRESETS: { label: string; icon: React.ReactNode; includes: IncludeKey[]; days: number; format: 'csv' | 'json' }[] = [
  { label: 'Last 7 days — Full',   icon: <Icons.Grid3x3 size={20} />, includes: ['signals', 'prices', 'posts'], days: 7,   format: 'csv' },
  { label: 'Monthly Signals',      icon: <Icons.Zap size={20} />, includes: ['signals'],                    days: 30,  format: 'json' },
  { label: 'Year-to-date — All',   icon: <Icons.Briefcase size={20} />, includes: ['signals', 'prices', 'alerts'], days: 365, format: 'csv' },
  { label: '24h Social Dump',      icon: <Icons.MessageSquare size={20} />, includes: ['posts'],                      days: 1,   format: 'json' },
]

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}

// ── Preview table ─────────────────────────────────────────────────────────────
function PreviewTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return null
  const cols = Object.keys(rows[0]).slice(0, 8)
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: 'var(--text-label-sm)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)' }}>
        <thead>
          <tr style={{ background: 'var(--surface-container-high)' }}>
            {cols.map(c => (
              <th key={c} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--on-surface-muted)', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--outline-variant)' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 5).map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface-container)' : 'transparent' }}>
              {cols.map(c => (
                <td key={c} style={{ padding: '5px 10px', color: 'var(--on-surface)', whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {String(row[c] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ExportPage() {
  const [loading, setLoading]     = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[] | null>(null)

  // Form state
  const [symbol,   setSymbol]   = useState('')
  const [includes, setIncludes] = useState<Set<IncludeKey>>(new Set(['signals', 'prices']))
  const [format,   setFormat]   = useState<'csv' | 'json'>('csv')
  const [from,     setFrom]     = useState(daysAgoIso(30))
  const [to,       setTo]       = useState(daysAgoIso(0))

  const [history, setHistory] = useState<ExportRecord[]>([])
  const { state: tickers } = useData<TickerItem[]>('/api/tickers/')

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

  const toggleInclude = (key: IncludeKey) => {
    setIncludes(prev => {
      const n = new Set(prev)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
  }

  const buildParams = useCallback((sym?: string) => {
    const params = new URLSearchParams()
    if (sym || symbol) params.set('symbols', sym || symbol)
    if (includes.size) params.set('include', Array.from(includes).join(','))
    params.set('format', format)
    params.set('from', from)
    params.set('to', to)
    return params
  }, [symbol, includes, format, from, to])

  const handlePreview = useCallback(async () => {
    setPreviewing(true)
    setPreviewRows(null)
    try {
      const params = buildParams()
      const sym = symbol.trim().toUpperCase()
      const url = sym ? `/api/export/${sym}/?${params}&limit=5` : `/api/export/bulk/?${params}&limit=5`
      const data = await api.get<unknown>(url)
      const rows = Array.isArray(data) ? data as Record<string, unknown>[]
        : typeof data === 'object' && data !== null
          ? Object.values(data as Record<string, unknown[]>).flat().slice(0, 5) as Record<string, unknown>[]
          : []
      setPreviewRows(rows)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Preview failed')
    } finally {
      setPreviewing(false)
    }
  }, [buildParams, symbol])

  const handleExport = useCallback(async (overrides?: { includes?: IncludeKey[]; days?: number; format?: 'csv' | 'json'; sym?: string }) => {
    setLoading(true)
    setProgress(0)
    const fmt   = overrides?.format  ?? format
    const sym   = overrides?.sym     ?? symbol.trim().toUpperCase()
    const inc   = overrides?.includes ?? Array.from(includes)
    const f     = overrides?.days    ? daysAgoIso(overrides.days) : from
    const t     = to

    try {
      const params = new URLSearchParams()
      if (sym)        params.set('symbols', sym)
      if (inc.length) params.set('include', inc.join(','))
      params.set('format', fmt); params.set('from', f); params.set('to', t)

      const url = sym ? `/api/export/${sym}/?${params}` : `/api/export/bulk/?${params}`
      const filename = `export-${sym || 'all'}-${f}.${fmt}`

      // Animate progress
      const tick = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 200)

      if (fmt === 'csv') {
        const token = tokenStore.get()
        const res = await fetch(
          `${(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')}${url}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
        if (!res.ok) throw new Error(`Export failed (${res.status})`)
        clearInterval(tick); setProgress(100)
        downloadBlob(await res.blob(), filename)
      } else {
        const data = await api.get<unknown>(url)
        clearInterval(tick); setProgress(100)
        downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename)
      }

      recordHistory({ id: crypto.randomUUID(), filename, symbol: sym || undefined, format: fmt, from: f, to: t, createdAt: Date.now(), includes: inc })
      toast.success('Export downloaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1200)
    }
  }, [format, symbol, includes, from, to])

  const today = daysAgoIso(0)

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Export" subtitle="Download signal, price, and social data in CSV or JSON." />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* ── Left: Export builder ── */}
        <div className="card stack stack-5">
          <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)' }}>
            Export Builder
          </span>

          {/* Ticker selector */}
          <div className="stack stack-2">
            <label style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)' }}>
              Ticker (optional — leave blank for all)
            </label>
            <input
              list="tickers-list"
              placeholder="e.g. AAPL"
              value={symbol}
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              style={{
                padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                fontSize: 'var(--text-body-md)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface)',
                textTransform: 'uppercase', outline: 'none', width: '100%',
              }}
            />
            {tickers.status === 'success' && (
              <datalist id="tickers-list">
                {tickers.data.map(t => <option key={t.symbol} value={t.symbol}>{t.name}</option>)}
              </datalist>
            )}
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div className="stack stack-1" style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>From</label>
              <input type="date" value={from} max={to}
                onChange={e => setFrom(e.target.value)}
                style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: 'var(--text-body-sm)', width: '100%', outline: 'none' }}
              />
            </div>
            <div className="stack stack-1" style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>To</label>
              <input type="date" value={to} min={from} max={today}
                onChange={e => setTo(e.target.value)}
                style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: 'var(--text-body-sm)', width: '100%', outline: 'none' }}
              />
            </div>
          </div>

          {/* Data fields */}
          <div className="stack stack-2">
            <label style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)' }}>
              Data to include
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-2)' }}>
              {ALL_INCLUDES.map(item => {
                const active = includes.has(item.key)
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleInclude(item.key)}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 4, padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)', border: `2px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`,
                      background: active ? 'color-mix(in srgb, var(--primary) 8%, var(--surface-container))' : 'var(--surface-container)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 700, color: active ? 'var(--primary)' : 'var(--on-surface)' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>{item.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Format */}
          <div className="stack stack-2">
            <label style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)' }}>Format</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {(['csv', 'json'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`btn btn-sm ${format === f ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: 64 }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {progress > 0 && (
            <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`, borderRadius: 999,
                background: progress >= 100 ? 'var(--secondary)' : 'var(--primary)',
                transition: 'width 0.2s var(--ease-out), background 0.3s',
              }} />
            </div>
          )}

          {/* Preview table */}
          {previewRows !== null && (
            <div className="stack stack-2">
              <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Preview (first 5 rows)
              </span>
              {previewRows.length === 0
                ? <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>No data in this range.</span>
                : <PreviewTable rows={previewRows} />
              }
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              className="btn btn-ghost"
              onClick={handlePreview}
              disabled={previewing || includes.size === 0}
              style={{ flex: 1, minWidth: 120 }}
            >
              {previewing ? 'Loading…' : 'Preview Data'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleExport()}
              disabled={loading || includes.size === 0}
              style={{ flex: 2, minWidth: 160 }}
            >
              {loading ? 'Preparing…' : `Download ${format.toUpperCase()}`}
            </button>
          </div>
        </div>

        {/* ── Right: Presets + History ── */}
        <div className="stack stack-5">
          {/* Quick presets */}
          <div className="stack stack-3">
            <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)' }}>
              Quick Presets
            </span>
            <div className="stack stack-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="card"
                  onClick={() => handleExport({ includes: p.includes, days: p.days, format: p.format })}
                  disabled={loading}
                  style={{
                    textAlign: 'left', cursor: loading ? 'not-allowed' : 'pointer',
                    border: '1px solid var(--outline-variant)', opacity: loading ? 0.6 : 1,
                    transition: 'border-color 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <div className="stack stack-1" style={{ flex: 1 }}>
                      <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>{p.label}</span>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {p.includes.map(inc => (
                          <span key={inc} style={{
                            fontSize: 'var(--text-label-sm)', color: 'var(--primary)',
                            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                            padding: '1px 6px', borderRadius: 'var(--radius-full)',
                          }}>
                            {inc}
                          </span>
                        ))}
                        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontFamily: 'var(--font-mono)' }}>
                          {p.format.toUpperCase()} · {p.days === 365 ? 'YTD' : `${p.days}d`}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="stack stack-3">
            <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-muted)' }}>
              Recent Exports
            </span>
            {history.length === 0
              ? <EmptyState title="No exports yet" description="Your downloads will appear here." />
              : (
                <div className="stack stack-2">
                  {history.map(h => (
                    <div key={h.id} className="card" style={{ padding: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--on-surface)', wordBreak: 'break-all' }}>
                          {h.filename}
                        </span>
                        <span style={{
                          fontSize: 'var(--text-label-sm)', fontWeight: 700, padding: '1px 8px',
                          borderRadius: 'var(--radius-full)', background: 'var(--surface-container-high)',
                          color: 'var(--on-surface-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0,
                        }}>
                          {h.format.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-1)' }}>
                        {(h.includes ?? []).map(inc => (
                          <span key={inc} style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>{inc}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', display: 'block', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                        {new Date(h.createdAt).toLocaleString()} · {h.from} → {h.to}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
