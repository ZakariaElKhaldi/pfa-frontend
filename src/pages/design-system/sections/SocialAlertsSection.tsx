import { Icons, SentimentBadge } from '@/components/design-system'
import { ALERTS, POSTS } from '../fixtures'

export function SocialAlertsSection() {
  return (
    <section aria-labelledby="social-heading" id="section-social">
      <div className="content-grid-main" style={{ gridTemplateColumns: '1fr 320px' }}>
        <div className="stack stack-4">
          <h2 id="social-heading" className="text-headline-md">Social Feed</h2>
          <div className="card" style={{ padding: 'var(--space-5) var(--space-6)' }}>
            <div className="list-divider-free">
              {POSTS.map((p, i) => (
                <div
                  key={i}
                  className="post-card animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="post-card-source">{p.source}</div>
                  <div className="post-card-body">
                    <div className="post-card-header">
                      <span className="post-card-source-name">{p.sourceName}</span>
                      <span className="post-card-time">{p.time}</span>
                    </div>
                    <p className="post-card-content">{p.content}</p>
                    <div className="post-card-footer">
                      <SentimentBadge label={p.label} />
                      <span className="text-mono-sm text-muted">
                        score: {p.score >= 0 ? '+' : ''}{p.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stack stack-4">
          <h2 className="text-headline-md">Active Alerts</h2>
          <div className="stack stack-3">
            {ALERTS.map((a, i) => (
              <div
                key={i}
                className="alert-card animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`alert-card-icon ${a.type}`}>
                  <Icons.AlertTriangle size={16} />
                </div>
                <div className="alert-card-body">
                  <div className="alert-card-title">
                    {a.type === 'divergence' ? 'Divergence' : 'Extreme Sentiment'} · {a.symbol}
                  </div>
                  <div className="alert-card-meta">
                    <span className="alert-card-stat">S: {a.sentiment.toFixed(2)}</span>
                    <span className="alert-card-stat">M: {a.momentum.toFixed(2)}</span>
                    <span className="alert-card-stat">C: {a.consistency.toFixed(2)}</span>
                  </div>
                </div>
                <button className="btn btn-sm btn-secondary" aria-label={`Resolve alert for ${a.symbol}`}>
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
