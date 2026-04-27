import { Toggle } from '@/components/design-system'
import { STRATEGIES } from '../fixtures'

type ToggleState = Record<string, boolean>

interface StrategiesSectionProps {
  state: ToggleState
  onToggle: (id: string, v: boolean) => void
}

export function StrategiesSection({ state, onToggle }: StrategiesSectionProps) {
  return (
    <section aria-labelledby="strategies-heading" id="section-strategies">
      <div
        className="cluster cluster-4"
        style={{ justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}
      >
        <h2 id="strategies-heading" className="text-headline-md">Automation Strategies</h2>
        <button className="btn btn-primary btn-sm" id="btn-new-strategy">+ New Strategy</button>
      </div>
      <div className="stack stack-3">
        {STRATEGIES.map(s => (
          <div key={s.id} className="card card-interactive animate-fade-in">
            <div className="cluster cluster-4" style={{ justifyContent: 'space-between' }}>
              <div className="stack stack-2">
                <div className="cluster cluster-3">
                  <span className="text-headline-sm">{s.name}</span>
                  {state[s.id] && (
                    <span className="badge badge-buy" style={{ fontSize: '10px', padding: '2px 8px' }}>
                      Active
                    </span>
                  )}
                </div>
                <p
                  className="text-body-sm"
                  style={{ maxWidth: 560, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)' }}
                >
                  {s.desc}
                </p>
                <div className="cluster cluster-2" style={{ marginTop: 'var(--space-2)' }}>
                  {s.tickers.map(t => <span key={t} className="tag">{t}</span>)}
                  <span className="text-body-sm text-muted" style={{ marginLeft: 'var(--space-2)' }}>
                    {s.executions} executions · Last: {s.lastRun}
                  </span>
                </div>
              </div>
              <div className="cluster cluster-4">
                <Toggle
                  id={`toggle-${s.id}`}
                  checked={!!state[s.id]}
                  onChange={v => onToggle(s.id, v)}
                  label={`Toggle ${s.name}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
