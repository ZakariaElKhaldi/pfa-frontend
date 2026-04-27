import { SignalBadge, SentimentBadge, PredictionMethodBadge } from '@/components/design-system'
import type { Signal, SentimentLabel } from '@/design-system/tokens'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'

export interface SignalHistoryRow {
  id:                   string | number
  createdAt:            string
  signal:               Signal
  sentiment:            SentimentLabel
  postCount:            number
  bullishRatio:         number
  normalizedIndex:      number
  predictionMethod:     'ml' | 'rule_based'
  predictionConfidence: number
}

export interface SignalHistoryTableProps {
  rows: SignalHistoryRow[]
}

export function SignalHistoryTable({ rows }: SignalHistoryTableProps) {
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
        No signal history available
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <Table className="table">
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Signal</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Posts</TableHead>
            <TableHead>Bull%</TableHead>
            <TableHead>Index</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {r.createdAt}
              </TableCell>
              <TableCell><SignalBadge signal={r.signal} /></TableCell>
              <TableCell><SentimentBadge label={r.sentiment} /></TableCell>
              <TableCell className="mono">{r.postCount}</TableCell>
              <TableCell className="mono" style={{ color: r.bullishRatio >= 0.5 ? 'var(--secondary)' : 'var(--tertiary)' }}>
                {(r.bullishRatio * 100).toFixed(1)}%
              </TableCell>
              <TableCell className="mono">{r.normalizedIndex.toFixed(3)}</TableCell>
              <TableCell><PredictionMethodBadge method={r.predictionMethod} /></TableCell>
              <TableCell className="mono">{(r.predictionConfidence * 100).toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
