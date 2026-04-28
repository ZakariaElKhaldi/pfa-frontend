import { useState } from 'react'
import { Icons } from '@/components/design-system'
import { SignalBadge } from '@/components/design-system'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'

export interface TickerAccuracyRow {
  symbol:      string
  /** 0–1, null when no evaluated records exist */
  accuracy1h:  number | null
  /** 0–1, null when no evaluated records exist */
  accuracy24h: number | null
  signalCount: number
  /** Signal type with the highest accuracy for this ticker */
  bestSignal:  'BUY' | 'SELL' | 'HOLD' | null
}

export interface TickerAccuracyTableProps {
  rows: TickerAccuracyRow[]
}

type SortKey = 'symbol' | 'accuracy1h' | 'accuracy24h' | 'signalCount'
type SortDir = 'asc' | 'desc'

// ── accuracy → traffic-light color ────────────────────────────────────────────
function accColor(v: number | null): string {
  if (v === null)  return 'var(--on-surface-muted)'
  if (v >= 0.70)   return 'hsl(158,60%,38%)'   // green
  if (v >= 0.55)   return 'hsl(38,88%,46%)'    // amber
  return 'hsl(4,68%,50%)'                       // red
}

// ── accuracy cell ─────────────────────────────────────────────────────────────
function AccuracyCell({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)' }}>—</span>
    )
  }
  const pct   = (value * 100).toFixed(1)
  const color = accColor(value)
  const bg    = color.replace(')', ', 0.10)').replace('hsl(', 'hsla(')
  return (
    <span
      style={{
        display:            'inline-block',
        padding:            '2px 8px',
        borderRadius:       'var(--radius-full)',
        background:         bg,
        color,
        fontSize:           'var(--text-mono-sm)',
        fontFamily:         'var(--font-mono)',
        fontWeight:         600,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {pct}%
    </span>
  )
}

// ── sort icon ─────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <Icons.Minus size={12} style={{ opacity: 0.3 }} />
  return sortDir === 'asc'
    ? <Icons.ArrowUp   size={12} />
    : <Icons.ArrowDown size={12} />
}

// ── component ─────────────────────────────────────────────────────────────────
export function TickerAccuracyTable({ rows }: TickerAccuracyTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('accuracy24h')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'symbol') {
      return dir * a.symbol.localeCompare(b.symbol)
    }
    const av = a[sortKey] ?? -Infinity
    const bv = b[sortKey] ?? -Infinity
    return dir * (av - bv)
  })

  const thStyle: React.CSSProperties = {
    cursor:      'pointer',
    userSelect:  'none',
    whiteSpace:  'nowrap',
    paddingRight: 'var(--space-2)',
  }

  const thInner: React.CSSProperties = {
    display:    'inline-flex',
    alignItems: 'center',
    gap:        4,
  }

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding:      'var(--space-10)',
          textAlign:    'center',
          color:        'var(--on-surface-muted)',
          fontSize:     'var(--text-body-sm)',
          background:   'var(--surface-container)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        No ticker accuracy data
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <Table className="table">
        <TableHeader>
          <TableRow>
            <TableHead style={thStyle} onClick={() => handleSort('symbol')}>
              <span style={thInner}>
                Ticker
                <SortIcon col="symbol" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </TableHead>
            <TableHead style={thStyle} onClick={() => handleSort('accuracy1h')}>
              <span style={thInner}>
                1h Acc.
                <SortIcon col="accuracy1h" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </TableHead>
            <TableHead style={thStyle} onClick={() => handleSort('accuracy24h')}>
              <span style={thInner}>
                24h Acc.
                <SortIcon col="accuracy24h" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </TableHead>
            <TableHead style={thStyle} onClick={() => handleSort('signalCount')}>
              <span style={thInner}>
                Signals
                <SortIcon col="signalCount" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </TableHead>
            <TableHead>Best Signal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(row => (
            <TableRow key={row.symbol}>
              <TableCell
                style={{
                  fontFamily:  'var(--font-mono)',
                  fontWeight:  700,
                  fontSize:    'var(--text-mono-sm)',
                  color:       'var(--on-surface)',
                  letterSpacing: '0.04em',
                }}
              >
                {row.symbol}
              </TableCell>
              <TableCell><AccuracyCell value={row.accuracy1h} /></TableCell>
              <TableCell><AccuracyCell value={row.accuracy24h} /></TableCell>
              <TableCell
                className="mono"
                style={{ color: 'var(--on-surface-variant)', fontVariantNumeric: 'tabular-nums' }}
              >
                {row.signalCount.toLocaleString()}
              </TableCell>
              <TableCell>
                {row.bestSignal
                  ? <SignalBadge signal={row.bestSignal} />
                  : <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)' }}>—</span>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
