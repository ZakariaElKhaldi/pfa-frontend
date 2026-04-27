import { AccuracyRing, Icons, SignalBadge } from '@/components/design-system'
import { ACCURACY_GAUGES, TICKERS, TRENDING } from '../fixtures'

export function WatchlistSection() {
  return (
    <section aria-labelledby="watchlist-heading" id="section-watchlist">
      <div className="content-grid-main">
        <div className="stack stack-5">
          <h2 id="watchlist-heading" className="text-headline-md">Watchlist Signals</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-5) var(--space-6)', background: 'var(--surface-container-low)' }}>
              <span className="text-label-md text-nav-label text-muted">
                {TICKERS.length} Tickers · Updated 2m ago
              </span>
            </div>
            <div className="stagger-children">
              {TICKERS.map(t => (
                <div
                  key={t.symbol}
                  className="ticker-card animate-fade-in"
                  style={{ borderRadius: 0, margin: '0 var(--space-2)' }}
                >
                  <span className="ticker-card-symbol">{t.symbol}</span>
                  <span className="ticker-card-name">{t.name}</span>
                  <div className="stack stack-2" style={{ alignItems: 'flex-end' }}>
                    <span className="ticker-card-price">${t.price}</span>
                    <span className={`ticker-card-change ${t.change.startsWith('+') ? 'positive' : 'negative'}`}>
                      {t.change} ({t.pct})
                    </span>
                  </div>
                  <SignalBadge signal={t.signal} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stack stack-5">
          <h2 className="text-headline-md">Signal Accuracy</h2>
          <div className="card">
            <div className="cluster cluster-6" style={{ justifyContent: 'space-around', marginBottom: 'var(--space-6)' }}>
              {ACCURACY_GAUGES.map(a => (
                <div key={a.label} className="accuracy-gauge" style={{ textAlign: 'center' }}>
                  <AccuracyRing pct={a.pct} color={a.color} />
                  <span className="accuracy-gauge-label">{a.label}</span>
                </div>
              ))}
            </div>
            <div className="card card-recessed" style={{ padding: 'var(--space-4)' }}>
              <div className="cluster cluster-4" style={{ justifyContent: 'space-between' }}>
                <span className="text-label-md text-muted text-nav-label">Overall 24h</span>
                <span className="text-mono-lg text-secondary" style={{ fontWeight: 700 }}>72.4%</span>
              </div>
              <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                <span className="text-label-md text-muted text-nav-label">Total Evaluated</span>
                <span className="text-mono-md">4,218</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Trending</div>
                <div className="card-subtitle">Top 5 mentioned (30d)</div>
              </div>
              <Icons.Flame size={16} />
            </div>
            <div className="stack stack-3">
              {TRENDING.map((t, i) => (
                <div key={t.symbol} className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
                  <div className="cluster cluster-3">
                    <span className="text-mono-sm text-muted" style={{ minWidth: 16 }}>#{i + 1}</span>
                    <span className="tag tag-primary">{t.symbol}</span>
                  </div>
                  <span className="text-mono-sm text-muted">{t.count.toLocaleString()} mentions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
