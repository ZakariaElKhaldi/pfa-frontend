import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Icons } from '@/components/design-system'
import type { LucideIcon } from 'lucide-react'

export type RetrainStatus = 'success' | 'failed' | 'running'

/** Maps to intelligence.RetrainLog model */
export interface RetrainLogEntry {
  id:               string | number
  ticker?:          string
  triggerReason:    string
  oldAccuracy:      number
  newAccuracy:      number
  modelVersion:     string
  trainingSamples:  number
  startedAt:        string
  completedAt?:     string
  status:           RetrainStatus
}

export interface RetrainLogRowProps {
  entries: RetrainLogEntry[]
}

const STATUS_CONFIG: Record<RetrainStatus, { bg: string; color: string; label: string; icon: LucideIcon }> = {
  success: { bg: 'var(--secondary-container)', color: 'var(--on-secondary-container)', label: 'Success', icon: Icons.Check },
  failed:  { bg: 'var(--tertiary-container)',  color: 'var(--on-tertiary-container)',  label: 'Failed',  icon: Icons.X     },
  running: { bg: 'var(--warning-container)',   color: 'var(--on-warning-container)',   label: 'Running', icon: Icons.Zap   },
}

function AccuracyDelta({ old: o, next: n }: { old: number; next: number }) {
  const delta = n - o
  const color = delta > 0 ? 'var(--secondary)' : delta < 0 ? 'var(--tertiary)' : 'var(--on-surface-muted)'
  const sign  = delta >= 0 ? '+' : ''
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)', color: 'var(--on-surface-muted)' }}>
        {(o * 100).toFixed(1)}%
      </span>
      <span style={{ color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)' }}>→</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)', color: 'var(--on-surface)', fontWeight: 700 }}>
        {(n * 100).toFixed(1)}%
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)', color, fontWeight: 600 }}>
        ({sign}{(delta * 100).toFixed(1)}pp)
      </span>
    </div>
  )
}

export function RetrainLogRow({ entries }: RetrainLogRowProps) {
  if (entries.length === 0) {
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
        No retrain logs yet
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <Table className="table">
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Accuracy (old → new)</TableHead>
            <TableHead>Samples</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => {
            const cfg = STATUS_CONFIG[e.status]
            const StatusIcon = cfg.icon
            return (
              <TableRow key={e.id}>
                <TableCell>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-mono-sm)', color: 'var(--on-surface)' }}>
                    {e.ticker ?? 'global'}
                  </span>
                </TableCell>
                <TableCell style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-variant)', maxWidth: 200, whiteSpace: 'normal' }}>
                  {e.triggerReason}
                </TableCell>
                <TableCell>
                  <AccuracyDelta old={e.oldAccuracy} next={e.newAccuracy} />
                </TableCell>
                <TableCell className="mono">{e.trainingSamples.toLocaleString()}</TableCell>
                <TableCell className="mono" style={{ color: 'var(--on-surface-muted)' }}>v{e.modelVersion}</TableCell>
                <TableCell style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {e.startedAt}
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
                      background:   cfg.bg,
                      color:        cfg.color,
                      whiteSpace:   'nowrap',
                    }}
                  >
                    <StatusIcon size={11} aria-hidden />
                    {cfg.label}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
