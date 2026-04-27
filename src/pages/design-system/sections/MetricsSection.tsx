import { Icons } from '@/components/design-system'
import { METRICS } from '../fixtures'

export function MetricsSection() {
  return (
    <section aria-labelledby="metrics-heading" id="section-metrics">
      <h2 id="metrics-heading" className="text-headline-md" style={{ marginBottom: 'var(--space-5)' }}>
        Platform Overview
      </h2>
      <div className="metric-grid stagger-children animate-slide-up">
        {METRICS.map(m => (
          <div key={m.label} className="metric-card animate-fade-in">
            <span className="metric-card-label">{m.label}</span>
            <span className="metric-card-value">{m.value}</span>
            <span className={`metric-card-delta ${m.positive ? 'positive' : 'negative'}`}>
              {m.positive ? <Icons.ArrowUp size={12} /> : <Icons.ArrowDown size={12} />}
              {m.delta}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
