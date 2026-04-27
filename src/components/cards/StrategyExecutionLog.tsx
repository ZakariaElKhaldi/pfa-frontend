import { Icons } from '@/components/design-system'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'

/** Maps directly to /api/strategies/:pk/executions/ */
export interface StrategyExecution {
  id:          string | number
  executedAt:  string
  ticker:      string
  triggered:   boolean
  actionsTaken: string[]
  notes?:      string
}

export interface StrategyExecutionLogProps {
  executions: StrategyExecution[]
}

export function StrategyExecutionLog({ executions }: StrategyExecutionLogProps) {
  if (executions.length === 0) {
    return (
      <div
        style={{
          padding:      'var(--space-8)',
          textAlign:    'center',
          color:        'var(--on-surface-muted)',
          fontSize:     'var(--text-body-sm)',
          background:   'var(--surface-container)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        No executions recorded yet
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <Table className="table">
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Triggered</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((ex) => (
            <TableRow key={ex.id}>
              <TableCell style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {ex.executedAt}
              </TableCell>
              <TableCell>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-mono-sm)', color: 'var(--on-surface)' }}>
                  {ex.ticker}
                </span>
              </TableCell>
              <TableCell>
                <span
                  style={{
                    display:      'inline-flex',
                    alignItems:   'center',
                    gap:           4,
                    padding:      '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize:     'var(--text-label-sm)',
                    fontWeight:   600,
                    background:   ex.triggered ? 'var(--secondary-container)' : 'var(--surface-container-high)',
                    color:        ex.triggered ? 'var(--on-secondary-container)' : 'var(--on-surface-muted)',
                  }}
                >
                  {ex.triggered
                    ? <><Icons.Check size={11} aria-hidden /> Yes</>
                    : <><Icons.Minus size={11} aria-hidden /> No</>
                  }
                </span>
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {ex.actionsTaken.map((a, i) => (
                    <span
                      key={i}
                      className="tag"
                      style={{ fontSize: 'var(--text-mono-sm)' }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-variant)', maxWidth: 200, whiteSpace: 'normal' }}>
                {ex.notes ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
