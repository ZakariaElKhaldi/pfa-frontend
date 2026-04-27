import { SentimentBadge } from '@/components/design-system'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'

export interface Trade {
  id:         string | number
  symbol:     string
  side:       'buy' | 'sell'
  quantity:   number
  price:      number
  executedAt: string   // ISO or pre-formatted
}

export interface TradeHistoryTableProps {
  trades: Trade[]
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (trades.length === 0) {
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
        No trades yet
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <Table className="table">
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize:   'var(--text-mono-md)',
                    color:      'var(--on-surface)',
                  }}
                >
                  {t.symbol}
                </span>
              </TableCell>
              <TableCell>
                <SentimentBadge label={t.side === 'buy' ? 'bullish' : 'bearish'} />
              </TableCell>
              <TableCell className="mono">{t.quantity.toLocaleString()}</TableCell>
              <TableCell className="mono">${fmt(t.price)}</TableCell>
              <TableCell className="mono">${fmt(t.quantity * t.price)}</TableCell>
              <TableCell
                style={{
                  fontSize: 'var(--text-label-sm)',
                  color:    'var(--on-surface-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {t.executedAt}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
