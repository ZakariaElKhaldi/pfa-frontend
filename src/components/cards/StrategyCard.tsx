import { Toggle } from '@/components/design-system'

export interface StrategyCardProps {
  id: string
  name: string
  desc: string
  tickers: string[]
  executions: number
  lastRun: string
  active: boolean
  onToggle: (v: boolean) => void
}

export function StrategyCard({ id, name, desc, tickers, executions, lastRun, active, onToggle }: StrategyCardProps) {
  return (
    <div className="card card-interactive">
      <div className="cluster cluster-4" style={{ justifyContent: 'space-between' }}>
        <div className="stack stack-2">
          <div className="cluster cluster-3">
            <span className="text-headline-sm">{name}</span>
            {active && <span className="badge badge-buy" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>}
          </div>
          <p className="text-body-sm" style={{ maxWidth: 560, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)' }}>
            {desc}
          </p>
          <div className="cluster cluster-2" style={{ marginTop: 'var(--space-2)' }}>
            {tickers.map(t => <span key={t} className="tag">{t}</span>)}
            <span className="text-body-sm text-muted" style={{ marginLeft: 'var(--space-2)' }}>
              {executions} executions · Last: {lastRun}
            </span>
          </div>
        </div>
        <Toggle id={`toggle-${id}`} checked={active} onChange={onToggle} label={`Toggle ${name}`} />
      </div>
    </div>
  )
}
