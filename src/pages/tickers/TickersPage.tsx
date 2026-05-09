import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { WatchlistStarButton } from '@/components/common/WatchlistStarButton'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'

interface TickerItem {
  symbol: string
  name: string
  sector?: string
  created_at: string
}
interface WatchlistItem { symbol: string; name: string; added_at: string }
interface SignalItem { ticker_symbol: string; signal: 'BUY' | 'SELL' | 'HOLD'; bullish_ratio: number; sentiment: number }

type SortKey = 'symbol' | 'name' | 'sector' | 'signal'
type SortDir = 'asc' | 'desc'

const ALL_SECTORS = 'All'
const SIGNAL_COLOR = { BUY: 'var(--secondary)', SELL: 'var(--tertiary)', HOLD: 'var(--warning)' } as const

// ── Mini sparkline (SVG) ────────────────────────────────────────────────────
function Sparkline({ ratio, signal }: { ratio: number; signal?: string }) {
  const color = signal === 'BUY' ? 'var(--secondary)' : signal === 'SELL' ? 'var(--tertiary)' : 'var(--warning)'
  // Fake a tiny 8-point trend from bullish_ratio + some noise seed
  const points = Array.from({ length: 8 }, (_, i) => {
    const v = ratio + Math.sin(i * 1.3 + ratio * 10) * 0.12
    return Math.min(1, Math.max(0, v))
  })
  const w = 60, h = 28, pad = 2
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - pad * 2))
  const ys = points.map(v => h - pad - v * (h - pad * 2))
  const d  = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ display: 'block', flexShrink: 0 }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2.5} fill={color} />
    </svg>
  )
}

export function TickersPage() {
  const navigate = useNavigate()
  const [query,       setQuery]       = useState('')
  const [sector,      setSector]      = useState(ALL_SECTORS)
  const [sortKey,     setSortKey]     = useState<SortKey>('symbol')
  const [sortDir,     setSortDir]     = useState<SortDir>('asc')
  const [toggling,    setToggling]    = useState<Set<string>>(new Set())

  const searchPath = `/api/tickers/${query ? `?search=${encodeURIComponent(query)}` : ''}`
  const { state: tickers,   refetch: refetchTickers   } = useData<TickerItem[]>(searchPath, [query])
  const { state: watchlist, refetch: refetchWatchlist } = useData<WatchlistItem[]>('/api/watchlist/')
  const { state: signals }                              = useData<SignalItem[]>('/api/signals/recent/?limit=100&all=true')

  const watchSet  = new Set((watchlist.status === 'success' ? watchlist.data : []).map(w => w.symbol))
  const signalMap = useMemo(() => {
    if (signals.status !== 'success') return new Map<string, SignalItem>()
    return new Map(signals.data.map(s => [s.ticker_symbol, s]))
  }, [signals])

  // Build sector list from data
  const sectors = useMemo(() => {
    if (tickers.status !== 'success') return [ALL_SECTORS]
    const s = new Set<string>()
    tickers.data.forEach(t => { if (t.sector) s.add(t.sector) })
    return [ALL_SECTORS, ...Array.from(s).sort()]
  }, [tickers])

  // Summary counts
  const summary = useMemo(() => {
    if (signals.status !== 'success') return null
    const counts = { BUY: 0, SELL: 0, HOLD: 0 }
    signals.data.forEach(s => { if (s.signal in counts) counts[s.signal as keyof typeof counts]++ })
    return counts
  }, [signals])

  const displayed = useMemo(() => {
    if (tickers.status !== 'success') return []
    let rows = tickers.data
    if (sector !== ALL_SECTORS) rows = rows.filter(t => t.sector === sector)
    rows = [...rows].sort((a, b) => {
      let va: string, vb: string
      if (sortKey === 'signal') {
        va = signalMap.get(a.symbol)?.signal ?? 'ZZZ'
        vb = signalMap.get(b.symbol)?.signal ?? 'ZZZ'
      } else {
        va = (a[sortKey] ?? '').toLowerCase()
        vb = (b[sortKey] ?? '').toLowerCase()
      }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return rows
  }, [tickers, sector, sortKey, sortDir, signalMap])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const handleToggle = useCallback(async (symbol: string, add: boolean) => {
    setToggling(s => new Set(s).add(symbol))
    try {
      if (add) {
        await api.post('/api/watchlist/', { symbol })
        toast.success(`${symbol} added to watchlist`)
      } else {
        await api.delete(`/api/watchlist/${symbol}/`)
        toast.success(`${symbol} removed from watchlist`)
      }
      refetchWatchlist()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Watchlist update failed')
    } finally {
      setToggling(s => { const n = new Set(s); n.delete(symbol); return n })
    }
  }, [refetchWatchlist])

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span style={{ opacity: 0.3, fontSize: 10 }}>↕</span>
    return <span style={{ fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const thStyle: React.CSSProperties = {
    fontSize: 'var(--text-label-sm)', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: 'var(--on-surface-muted)', padding: 'var(--space-2) var(--space-3)',
    background: 'var(--surface-container-high)', border: 'none', cursor: 'pointer',
    textAlign: 'left', whiteSpace: 'nowrap',
  }

  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Market" subtitle="Browse, screen, and track all instruments." />

      {/* Signal summary strip */}
      {summary && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {(['BUY', 'SELL', 'HOLD'] as const).map(s => (
            <div key={s} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
              background: `color-mix(in srgb, ${SIGNAL_COLOR[s]} 12%, var(--surface-container))`,
              border: `1px solid color-mix(in srgb, ${SIGNAL_COLOR[s]} 25%, transparent)`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: SIGNAL_COLOR[s] }} />
              <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 700, color: SIGNAL_COLOR[s] }}>{s}</span>
              <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface)', fontWeight: 600 }}>
                {summary[s]}
              </span>
            </div>
          ))}
          {tickers.status === 'success' && (
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)', alignSelf: 'center', marginLeft: 'auto' }}>
              {displayed.length} instruments
            </span>
          )}
        </div>
      )}

      {/* Search + Sector pills */}
      <div className="stack stack-3">
        <input
          type="search"
          placeholder="Search ticker or company…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%', maxWidth: 400,
            padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
            fontSize: 'var(--text-body-md)', color: 'var(--on-surface)', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {sectors.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              className={`btn btn-sm ${sector === s ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {tickers.status === 'error' && <ErrorState message={tickers.message} onRetry={refetchTickers} />}

      {(tickers.status === 'loading' || tickers.status === 'idle') && (
        <div className="stack stack-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      )}

      {tickers.status === 'success' && displayed.length === 0 && (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--on-surface-muted)' }}>
          No tickers match your filters.
        </div>
      )}

      {tickers.status === 'success' && displayed.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => toggleSort('symbol')}>
                  Symbol <SortIcon k="symbol" />
                </th>
                <th style={thStyle} onClick={() => toggleSort('name')}>
                  Company <SortIcon k="name" />
                </th>
                <th style={{ ...thStyle, display: window.innerWidth < 600 ? 'none' : undefined }} onClick={() => toggleSort('sector')}>
                  Sector <SortIcon k="sector" />
                </th>
                <th style={thStyle} onClick={() => toggleSort('signal')}>
                  Signal <SortIcon k="signal" />
                </th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Trend</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Watchlist</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((t, idx) => {
                const sig = signalMap.get(t.symbol)
                const sigColor = sig ? SIGNAL_COLOR[sig.signal] : 'var(--on-surface-muted)'
                return (
                  <tr
                    key={t.symbol}
                    onClick={() => navigate(`/tickers/${t.symbol}`)}
                    style={{
                      cursor: 'pointer',
                      background: idx % 2 === 0 ? 'var(--surface-container)' : 'var(--surface-container-low, var(--surface-container))',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container-high)')}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'var(--surface-container)' : 'var(--surface-container)')}
                  >
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--on-surface)', whiteSpace: 'nowrap' }}>
                      {t.symbol}
                    </td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--on-surface-muted)', fontSize: 'var(--text-body-sm)' }}>
                      {t.name}
                    </td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)' }}>
                      {t.sector ?? '—'}
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      {sig ? (
                        <span style={{
                          fontSize: 'var(--text-label-sm)', fontWeight: 700, padding: '2px 10px',
                          borderRadius: 'var(--radius-full)', color: sigColor,
                          background: `color-mix(in srgb, ${sigColor} 15%, transparent)`,
                          letterSpacing: '0.05em',
                        }}>
                          {sig.signal}
                        </span>
                      ) : <span style={{ color: 'var(--on-surface-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                      {sig ? <Sparkline ratio={sig.bullish_ratio} signal={sig.signal} /> : <span style={{ color: 'var(--on-surface-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <WatchlistStarButton
                        symbol={t.symbol}
                        active={watchSet.has(t.symbol)}
                        onToggle={handleToggle}
                        loading={toggling.has(t.symbol)}
                        size="sm"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
