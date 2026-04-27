import { Icons, SentimentBadge } from '@/components/design-system'

const SURFACES = [
  { name: 'surface-container-lowest',  var: 'var(--surface-container-lowest)'  },
  { name: 'surface-container-low',     var: 'var(--surface-container-low)'     },
  { name: 'surface-container',         var: 'var(--surface-container)'         },
  { name: 'surface-container-high',    var: 'var(--surface-container-high)'    },
  { name: 'surface-container-highest', var: 'var(--surface-container-highest)' },
  { name: 'surface-bright',            var: 'var(--surface-bright)'            },
]

const SEMANTIC = [
  { name: 'primary',   bg: 'var(--primary)',   fg: 'white', label: 'Accent / Signal'    },
  { name: 'secondary', bg: 'var(--secondary)', fg: 'white', label: 'Bullish / Success'  },
  { name: 'tertiary',  bg: 'var(--tertiary)',  fg: 'white', label: 'Bearish / Error'    },
  { name: 'warning',   bg: 'var(--warning)',   fg: 'white', label: 'Hold / Caution'     },
]

export function TokensSection() {
  return (
    <section aria-labelledby="tokens-heading" id="section-tokens">
      <h2 id="tokens-heading" className="text-headline-md" style={{ marginBottom: 'var(--space-5)' }}>
        Design Token Reference
      </h2>
      <div className="content-grid-equal">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Surface Tonal Stack</div>
          <div className="stack stack-2">
            {SURFACES.map(s => (
              <div
                key={s.name}
                className="cluster cluster-3"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  background: s.var,
                }}
              >
                <span className="text-mono-sm" style={{ color: 'var(--on-surface)' }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Semantic Color System</div>
          <div className="stack stack-3">
            {SEMANTIC.map(s => (
              <div
                key={s.name}
                className="cluster cluster-4"
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  background: s.bg,
                }}
              >
                <span
                  style={{
                    color: s.fg,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-mono-sm)',
                    fontWeight: 600,
                  }}
                >
                  --{s.name}
                </span>
                <span style={{ color: s.fg, fontSize: 'var(--text-label-sm)', opacity: 0.8 }}>{s.label}</span>
              </div>
            ))}
            <div className="stack stack-2">
              <div className="card-subtitle">Container variants (for chip backgrounds)</div>
              <div className="cluster cluster-2">
                <div className="badge badge-bullish">Bullish container</div>
                <div className="badge badge-bearish">Bearish container</div>
                <div className="badge badge-hold">Hold container</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Typography Scale · Inter</div>
          <div className="stack stack-4">
            <div className="text-display-md">Display Md · Bold</div>
            <div className="text-headline-lg">Headline Lg · Semibold</div>
            <div className="text-headline-md">Headline Md · Semibold</div>
            <div className="text-title-lg">Title Lg · Medium</div>
            <div className="text-body-lg">Body Lg · Regular</div>
            <div className="text-label-md text-nav-label">Nav label · allcaps +0.05em</div>
          </div>
        </div>

        <div className="card card-recessed">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Data Type Scale · JetBrains Mono</div>
          <div className="stack stack-4">
            <div className="text-mono-lg">+0.8821  ← sentiment score</div>
            <div className="text-mono-md">$189.42  ← price</div>
            <div className="text-mono-md">72.4%    ← accuracy</div>
            <div className="text-mono-sm">2026-04-14T11:24:00Z ← timestamp</div>
            <div className="text-mono-sm text-muted">RSI-14: 67.3 · SMA-20: 184.10 · EMA-12: 186.22</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Button System</div>
          <div className="stack stack-4">
            <div className="cluster cluster-3">
              <button className="btn btn-primary btn-sm" id="btn-primary-sm">Primary SM</button>
              <button className="btn btn-primary btn-md" id="btn-primary-md">Primary MD</button>
              <button className="btn btn-primary btn-lg" id="btn-primary-lg">Primary LG</button>
            </div>
            <div className="cluster cluster-3">
              <button className="btn btn-secondary btn-sm" id="btn-secondary-sm">Secondary</button>
              <button className="btn btn-secondary btn-md" id="btn-secondary-md">Secondary</button>
            </div>
            <div className="cluster cluster-3">
              <button className="btn btn-tertiary btn-md" id="btn-tertiary">Tertiary link</button>
              <button className="btn btn-danger btn-md" id="btn-danger">Danger action</button>
            </div>
            <div className="cluster cluster-3">
              <button className="btn btn-icon btn-secondary btn-sm" aria-label="Search">
                <Icons.Search size={14} />
              </button>
              <button className="btn btn-icon btn-secondary" aria-label="Bell">
                <Icons.Bell size={18} />
              </button>
              <button className="btn btn-icon btn-secondary btn-lg" aria-label="Download">
                <Icons.Download size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Input System</div>
          <div className="stack stack-5">
            <div className="input-wrapper">
              <label className="input-label" htmlFor="input-default">Ticker Symbol</label>
              <input id="input-default" className="input" placeholder="e.g. AAPL" />
            </div>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="input-search-demo">Search Social Posts</label>
              <div className="input-search-wrapper">
                <span className="input-search-icon"><Icons.Search size={16} /></span>
                <input id="input-search-demo" className="input" placeholder="Search posts…" />
              </div>
            </div>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="input-error">Quantity (shares)</label>
              <input id="input-error" className="input input-error" placeholder="100" defaultValue="-5" />
              <span className="input-hint error">Quantity must be a positive integer.</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Glass & Elevation</div>
          <div
            className="stack stack-4"
            style={{
              background: 'var(--gradient-bullish)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
            }}
          >
            <div className="glass" style={{ padding: 'var(--space-4) var(--space-5)' }}>
              <span className="text-mono-md" style={{ color: 'var(--on-surface)' }}>
                Glassmorphism panel · backdrop-blur: 16px
              </span>
            </div>
            <div className="cluster cluster-4">
              <div className="tooltip-wrapper">
                <button className="btn btn-secondary btn-md" id="btn-tooltip-demo">
                  Hover for tooltip
                </button>
                <div className="tooltip" role="tooltip">
                  Feature importances · MACD: 0.32, RSI: 0.28, Sentiment: 0.24
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Badge & Tag System</div>
          <div className="stack stack-4">
            <div>
              <div className="text-label-sm text-muted" style={{ marginBottom: 'var(--space-2)' }}>Signal badges</div>
              <div className="cluster cluster-2">
                <span className="badge badge-buy badge-lg">BUY</span>
                <span className="badge badge-sell badge-lg">SELL</span>
                <span className="badge badge-hold badge-lg">HOLD</span>
              </div>
            </div>
            <div>
              <div className="text-label-sm text-muted" style={{ marginBottom: 'var(--space-2)' }}>Sentiment badges</div>
              <div className="cluster cluster-2">
                <SentimentBadge label="bullish" />
                <SentimentBadge label="bearish" />
                <SentimentBadge label="neutral" />
              </div>
            </div>
            <div>
              <div className="text-label-sm text-muted" style={{ marginBottom: 'var(--space-2)' }}>Ticker tags</div>
              <div className="cluster cluster-2">
                <span className="tag tag-primary">AAPL</span>
                <span className="tag tag-primary">NVDA</span>
                <span className="tag">SPY</span>
                <span className="tag tag-removable">TSLA ×</span>
              </div>
            </div>
            <div>
              <div className="text-label-sm text-muted" style={{ marginBottom: 'var(--space-2)' }}>Avatars</div>
              <div className="cluster cluster-3">
                <div className="avatar avatar-sm">ZK</div>
                <div className="avatar avatar-md">ZK</div>
                <div className="avatar avatar-lg">ZK</div>
                <div className="avatar avatar-xl">ZK</div>
              </div>
            </div>
            <div>
              <div className="text-label-sm text-muted" style={{ marginBottom: 'var(--space-2)' }}>Spinners</div>
              <div className="cluster cluster-4">
                <span className="spinner spinner-sm" role="status" aria-label="Loading" />
                <span className="spinner" role="status" aria-label="Loading" />
                <span className="spinner spinner-lg" role="status" aria-label="Loading" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
