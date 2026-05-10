import { useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  PredictionMethodBadge,
  SignalBadge,
  SentimentBadge,
  Icons,
} from '@/components/design-system'
import { WatchlistStarButton } from '@/components/common/WatchlistStarButton'
import type { Signal } from '@/design-system/tokens'

export interface TickerUniverseRow {
  symbol: string
  name: string
  sector?: string
  signal?: Signal
  sentiment?: number
  bullishRatio?: number
  confidence?: number | null
  predictionMethod?: string
  postCount?: number
  updatedAt?: string
}

type SortKey = 'symbol' | 'sector' | 'signal' | 'sentiment' | 'confidence'
type SortDir = 'asc' | 'desc'

function labelForSentiment(value?: number): 'bullish' | 'bearish' | 'neutral' {
  if (typeof value !== 'number') return 'neutral'
  if (value > 0.2) return 'bullish'
  if (value < -0.2) return 'bearish'
  return 'neutral'
}

function pct(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return `${Math.round(value * 100)}%`
}

function ageLabel(iso?: string): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff)) return '—'
  const minutes = Math.max(0, Math.floor(diff / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export interface TickerUniverseTableProps {
  rows: TickerUniverseRow[]
  selectedSymbol: string | null
  onSelect: (symbol: string) => void
  watchSet: Set<string>
  toggling: Set<string>
  onToggleWatchlist: (symbol: string, add: boolean) => void
}

export function TickerUniverseTable({
  rows,
  selectedSymbol,
  onSelect,
  watchSet,
  toggling,
  onToggleWatchlist,
}: TickerUniverseTableProps) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('signal')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sortedRows = useMemo(() => {
    const signalRank: Record<Signal, number> = { BUY: 0, HOLD: 1, SELL: 2 }
    return [...rows].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const av = (() => {
        switch (sortKey) {
          case 'symbol': return a.symbol
          case 'sector': return a.sector ?? ''
          case 'signal': return signalRank[a.signal ?? 'HOLD']
          case 'sentiment': return a.sentiment ?? -999
          case 'confidence': return a.confidence ?? -1
        }
      })()
      const bv = (() => {
        switch (sortKey) {
          case 'symbol': return b.symbol
          case 'sector': return b.sector ?? ''
          case 'signal': return signalRank[b.signal ?? 'HOLD']
          case 'sentiment': return b.sentiment ?? -999
          case 'confidence': return b.confidence ?? -1
        }
      })()
      if (typeof av === 'number' && typeof bv === 'number') return dir * (av - bv)
      return dir * String(av).localeCompare(String(bv))
    })
  }, [rows, sortKey, sortDir])

  function handleSort(next: SortKey) {
    if (sortKey === next) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(next)
      setSortDir('desc')
    }
  }

  const th: CSSProperties = {
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  const headerIcon = (key: SortKey) => {
    if (sortKey !== key) return <Icons.Minus size={12} style={{ opacity: 0.3 }} />
    return sortDir === 'asc'
      ? <Icons.ArrowUp size={12} />
      : <Icons.ArrowDown size={12} />
  }

  if (sortedRows.length === 0) {
    return (
      <div
        className="card"
        style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--on-surface-muted)' }}
      >
        No tickers match your filters.
      </div>
    )
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <Table className="w-full" style={{ minWidth: 980 }}>
        <TableHeader>
          <TableRow>
            <TableHead style={th} onClick={() => handleSort('symbol')}>
              <span className="inline-flex items-center gap-2">Symbol {headerIcon('symbol')}</span>
            </TableHead>
            <TableHead style={th} onClick={() => handleSort('sector')}>
              <span className="inline-flex items-center gap-2">Sector {headerIcon('sector')}</span>
            </TableHead>
            <TableHead style={th} onClick={() => handleSort('signal')}>
              <span className="inline-flex items-center gap-2">Signal {headerIcon('signal')}</span>
            </TableHead>
            <TableHead style={th} onClick={() => handleSort('sentiment')}>
              <span className="inline-flex items-center gap-2">Sentiment {headerIcon('sentiment')}</span>
            </TableHead>
            <TableHead style={th} onClick={() => handleSort('confidence')}>
              <span className="inline-flex items-center gap-2">Confidence {headerIcon('confidence')}</span>
            </TableHead>
            <TableHead className="text-right">Watchlist</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map(row => {
            const selected = row.symbol === selectedSymbol
            const signal = row.signal
            const bullish = row.bullishRatio
            return (
              <TableRow
                key={row.symbol}
                data-state={selected ? 'selected' : undefined}
                onClick={() => onSelect(row.symbol)}
                className={selected ? 'bg-accent/30' : undefined}
              >
                <TableCell>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/tickers/${row.symbol}`)
                    }}
                    className="stack stack-1 text-left"
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.04em' }}>
                      {row.symbol}
                    </span>
                    <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)' }}>
                      {row.name} · {ageLabel(row.updatedAt)} latest signal
                    </span>
                  </button>
                </TableCell>
                <TableCell style={{ color: 'var(--on-surface-muted)' }}>
                  {row.sector ?? '—'}
                </TableCell>
                <TableCell>
                  {signal ? (
                    <div className="cluster cluster-2">
                      <SignalBadge signal={signal} size="sm" />
                      <PredictionMethodBadge method={row.predictionMethod ?? 'rule_based'} />
                    </div>
                  ) : (
                    <span style={{ color: 'var(--on-surface-muted)' }}>No recent signal</span>
                  )}
                </TableCell>
                <TableCell>
                  {signal ? (
                    <div className="stack stack-2">
                      <SentimentBadge label={labelForSentiment(row.sentiment)} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 120, height: 6, borderRadius: 999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.round((bullish ?? 0) * 100)}%`,
                              height: '100%',
                              borderRadius: 999,
                              background: bullish && bullish >= 0.55
                                ? 'linear-gradient(90deg, var(--secondary), color-mix(in srgb, var(--secondary) 50%, white))'
                                : bullish && bullish < 0.45
                                  ? 'linear-gradient(90deg, var(--tertiary), color-mix(in srgb, var(--tertiary) 50%, white))'
                                  : 'linear-gradient(90deg, var(--warning), color-mix(in srgb, var(--warning) 50%, white))',
                            }}
                          />
                        </div>
                        <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)', whiteSpace: 'nowrap' }}>
                          {pct(bullish)} bullish
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--on-surface-muted)' }}>—</span>
                  )}
                </TableCell>
                <TableCell>
                  {signal ? (
                    <div className="stack stack-1">
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {pct(row.confidence)}
                      </span>
                      <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)' }}>
                        {row.postCount ?? 0} posts
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--on-surface-muted)' }}>—</span>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <WatchlistStarButton
                    symbol={row.symbol}
                    active={watchSet.has(row.symbol)}
                    onToggle={onToggleWatchlist}
                    loading={toggling.has(row.symbol)}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
