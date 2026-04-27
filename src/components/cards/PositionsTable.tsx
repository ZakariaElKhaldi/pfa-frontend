import { PnLBadge } from './PnLBadge'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'

export interface Position {
  symbol:    string
  name:      string
  quantity:  number
  avgPrice:  number
  lastPrice: number
}

export interface PositionsTableProps {
  positions: Position[]
  onSell?:   (symbol: string) => void
}

export function PositionsTable({ positions, onSell }: PositionsTableProps) {
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (positions.length === 0) {
    return (
      <div
        style={{
          padding:    'var(--space-10)',
          textAlign:  'center',
          color:      'var(--on-surface-muted)',
          fontSize:   'var(--text-body-sm)',
          background: 'var(--surface-container)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        No open positions
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <Table className="table">
        <TableHeader>
          <TableRow>
            <TableHead className="table-th">Symbol</TableHead>
            <TableHead className="table-th">Qty</TableHead>
            <TableHead className="table-th">Avg Cost</TableHead>
            <TableHead className="table-th">Last</TableHead>
            <TableHead className="table-th">Market Value</TableHead>
            <TableHead className="table-th">P&amp;L</TableHead>
            {onSell && <TableHead className="table-th" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((p) => {
            const mktValue = p.quantity * p.lastPrice
            const cost     = p.quantity * p.avgPrice
            const pnl      = mktValue - cost
            const pnlPct   = cost !== 0 ? (pnl / cost) * 100 : 0
            return (
              <TableRow key={p.symbol}>
                <TableCell>
                  <div className="stack stack-2">
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize:   'var(--text-mono-md)',
                        color:      'var(--on-surface)',
                      }}
                    >
                      {p.symbol}
                    </span>
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
                      {p.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="mono">{p.quantity.toLocaleString()}</TableCell>
                <TableCell className="mono">${fmt(p.avgPrice)}</TableCell>
                <TableCell className="mono">${fmt(p.lastPrice)}</TableCell>
                <TableCell className="mono">${fmt(mktValue)}</TableCell>
                <TableCell>
                  <PnLBadge value={pnl} pct={pnlPct} size="sm" />
                </TableCell>
                {onSell && (
                  <TableCell>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onSell(p.symbol)}
                      aria-label={`Sell ${p.symbol}`}
                    >
                      Sell
                    </button>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
