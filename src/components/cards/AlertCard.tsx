import { Icons } from '@/components/design-system'
import { AlertTypeBadge } from '@/components/design-system/AlertTypeBadge'
import type { AlertType } from '@/components/design-system/AlertTypeBadge'

export interface AlertCardProps {
  type: AlertType
  symbol: string
  sentiment: number
  momentum: number
  consistency: number
  resolved?: boolean
  onResolve?: () => void
}

type Severity = 'warning' | 'danger'

const SEVERITY: Record<AlertType, Severity> = {
  divergence:        'warning',
  hype_fade:         'warning',
  extreme_sentiment: 'danger',
  pump_suspected:    'danger',
}

export function AlertCard({ type, symbol, sentiment, momentum, consistency, resolved, onResolve }: AlertCardProps) {
  const severity = SEVERITY[type]
  const iconCls  = severity === 'danger' ? 'extreme' : 'divergence'

  return (
    <div className={`alert-card alert-card-${severity}${resolved ? ' alert-card-resolved' : ''}`}>
      <div className={`alert-card-icon ${iconCls}`}>
        <Icons.AlertTriangle size={20} />
      </div>

      <div className="alert-card-body">
        <div className="alert-card-header">
          <div className="alert-card-symbol">{symbol}</div>
          <AlertTypeBadge type={type} />
          {resolved && <span className="badge badge-neutral">Resolved</span>}
        </div>
        
        <div className="alert-card-metrics">
          <div className="alert-metric">
            <span className="alert-metric-label">Sen</span>
            <span className="alert-metric-value">{sentiment.toFixed(2)}</span>
          </div>
          <div className="alert-metric-divider" />
          <div className="alert-metric">
            <span className="alert-metric-label">Mom</span>
            <span className="alert-metric-value">{momentum.toFixed(2)}</span>
          </div>
          <div className="alert-metric-divider" />
          <div className="alert-metric">
            <span className="alert-metric-label">Con</span>
            <span className="alert-metric-value">{consistency.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {!resolved && onResolve && (
        <button className="btn btn-sm btn-outline-alert alert-card-action" onClick={onResolve} aria-label="Resolve alert">
          <span>Resolve</span>
        </button>
      )}
    </div>
  )
}
