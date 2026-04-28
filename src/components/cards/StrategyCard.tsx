import { Icons } from '@/components/design-system'
import { Toggle } from '@/components/design-system'

export interface StrategyCardProps {
  id:         string
  name:       string
  desc:       string
  tickers:    string[]
  executions: number
  lastRun:    string
  active:     boolean
  onToggle:   (v: boolean) => void
  /** Wires to PATCH /api/strategies/<pk>/ — opens StrategyForm */
  onEdit?:    () => void
  /** Wires to DELETE /api/strategies/<pk>/ */
  onDelete?:  () => void
}

export function StrategyCard({
  id, name, desc, tickers, executions, lastRun,
  active, onToggle, onEdit, onDelete,
}: StrategyCardProps) {
  return (
    <div className="card card-interactive">
      <div className="cluster cluster-4" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stack stack-2" style={{ flex: 1, minWidth: 0 }}>
          <div className="cluster cluster-3">
            <span className="text-headline-sm">{name}</span>
            {active && (
              <span className="badge badge-buy" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>
            )}
          </div>
          <p
            className="text-body-sm"
            style={{
              maxWidth:   560,
              fontFamily: 'var(--font-mono)',
              fontSize:   'var(--text-mono-sm)',
              color:      'var(--on-surface-variant)',
            }}
          >
            {desc}
          </p>
          <div className="cluster cluster-2" style={{ marginTop: 'var(--space-2)' }}>
            {tickers.map((t) => <span key={t} className="tag">{t}</span>)}
            <span
              className="text-body-sm text-muted"
              style={{ marginLeft: 'var(--space-2)', color: 'var(--on-surface-muted)', fontSize: 'var(--text-label-sm)' }}
            >
              {executions} executions · Last: {lastRun}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${name}`}
              style={{
                background: 'transparent',
                border:     'none',
                cursor:     'pointer',
                color:      'var(--on-surface-muted)',
                padding:    'var(--space-1)',
                borderRadius: 'var(--radius-sm)',
                lineHeight: 1,
                transition: 'color var(--duration-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--primary)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--on-surface-muted)')}
            >
              <Icons.Settings size={16} aria-hidden />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${name}`}
              style={{
                background: 'transparent',
                border:     'none',
                cursor:     'pointer',
                color:      'var(--on-surface-muted)',
                padding:    'var(--space-1)',
                borderRadius: 'var(--radius-sm)',
                lineHeight: 1,
                transition: 'color var(--duration-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--tertiary)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--on-surface-muted)')}
            >
              <Icons.X size={16} aria-hidden />
            </button>
          )}
          <Toggle id={`toggle-${id}`} checked={active} onChange={onToggle} label={`Toggle ${name}`} />
        </div>
      </div>
    </div>
  )
}
