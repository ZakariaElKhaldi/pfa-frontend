import { Icons } from '@/components/design-system'

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="animate-slide-up" id="section-hero">
      <div className="card" style={{ background: 'var(--gradient-hero)', padding: 'var(--space-10)' }}>
        <div className="stack stack-4">
          <div className="cluster cluster-2">
            <span className="badge badge-buy">LIVE</span>
            <span className="text-label-md text-muted text-nav-label">Market Intelligence Platform</span>
          </div>
          <h1 id="hero-heading" className="text-display-lg" style={{ maxWidth: '720px' }}>
            The crowd speaks.<br />
            <span style={{ color: 'var(--primary)' }}>The signal is clear.</span>
          </h1>
          <p className="text-body-lg" style={{ maxWidth: '560px' }}>
            CrowdSignal transforms raw Reddit & StockTwits sentiment into high-confidence
            BUY / SELL / HOLD signals, powered by FinBERT and live market data.
          </p>
          <div className="cluster cluster-3">
            <button className="btn btn-primary btn-lg" id="cta-start">
              <Icons.Zap size={18} />
              View Signals
            </button>
            <button className="btn btn-secondary btn-lg" id="cta-export">
              <Icons.Download size={18} />
              Export Data
            </button>
            <button className="btn btn-tertiary btn-lg" id="cta-learn">
              How it works
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
