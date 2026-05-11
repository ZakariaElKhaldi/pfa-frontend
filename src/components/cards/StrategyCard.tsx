import { Icons } from '@/components/design-system'
import { Toggle } from '@/components/design-system'

export type StrategyHealth = 'inactive' | 'working' | 'idle' | 'failing' | 'never_run'

export interface StrategyCardProps {
  id:         string
  name:       string
  desc:       string
  tickers:    string[]
  executions: number
  lastRun:    string | null
  lastTriggered?: string | null
  lastEventType?: string | null
  health:     StrategyHealth
  active:     boolean
  onToggle:   (v: boolean) => void
  onOpen?:     () => void
  /** Wires to PATCH /api/strategies/<pk>/ — opens StrategyForm */
  onEdit?:    () => void
  /** Wires to DELETE /api/strategies/<pk>/ */
  onDelete?:  () => void
}

export function StrategyCard({
  id, name, desc, tickers, executions, lastRun,
  lastTriggered, lastEventType, health, active, onToggle, onOpen, onEdit, onDelete,
}: StrategyCardProps) {
  const status = HEALTH_META[health]
  return (
    <div
      className="card card-interactive"
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onOpen) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      style={{ cursor: onOpen ? 'pointer' : undefined }}
    >
      <div className="cluster cluster-4" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stack stack-2" style={{ flex: 1, minWidth: 0 }}>
          <div className="cluster cluster-3" style={{ alignItems: 'center' }}>
            <span className="text-headline-sm">{name}</span>
            <span
              className={`strategy-health-badge strategy-health-${health}`}
              style={{ ['--health-color' as string]: status.color }}
            >
              <span className={health === 'working' ? 'strategy-health-dot is-live' : 'strategy-health-dot'} />
              {status.label}
            </span>
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
          <div className="cluster cluster-2" style={{ marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
            {tickers.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <div className="strategy-card-metrics">
            <span><Icons.Activity size={13} aria-hidden /> {executions} checks</span>
            <span><Icons.RefreshCw size={13} aria-hidden /> Last checked: {lastRun ?? 'Never'}</span>
            <span><Icons.Zap size={13} aria-hidden /> Last triggered: {lastTriggered ?? 'Never'}</span>
            {lastEventType && <span><Icons.Flag size={13} aria-hidden /> {lastEventType.replace(/_/g, ' ')}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
          {onEdit && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onEdit() }}
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
              onClick={(event) => { event.stopPropagation(); onDelete() }}
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
          <div onClick={(event) => event.stopPropagation()}>
            <Toggle id={`toggle-${id}`} checked={active} onChange={onToggle} label={`Toggle ${name}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

const HEALTH_META: Record<StrategyHealth, { label: string; color: string }> = {
  working: { label: 'Working', color: 'var(--secondary)' },
  idle: { label: 'Idle', color: 'var(--warning)' },
  failing: { label: 'Failing', color: 'var(--tertiary)' },
  never_run: { label: 'Never run', color: 'var(--on-surface-muted)' },
  inactive: { label: 'Inactive', color: 'var(--on-surface-muted)' },
}
