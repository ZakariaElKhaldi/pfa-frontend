const BREAKDOWN_SCORES = [
  { label: 'Sentiment',     value: '+0.62' },
  { label: 'Momentum',      value: '+0.41' },
  { label: 'Consistency',   value: '0.78'  },
  { label: 'Bullish Ratio', value: '62%'   },
  { label: 'Time Decay',    value: '0.54'  },
  { label: 'Confidence',    value: '84%'   },
]

const GAUGE_TICKERS = [
  { symbol: 'AAPL', score:  0.62 },
  { symbol: 'TSLA', score: -0.41 },
  { symbol: 'NVDA', score:  0.88 },
]

export function SentimentSection() {
  return (
    <section aria-labelledby="sentiment-heading" id="section-sentiment">
      <h2 id="sentiment-heading" className="text-headline-md" style={{ marginBottom: 'var(--space-5)' }}>
        Sentiment Tools
      </h2>
      <div className="content-grid-equal">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AAPL Sentiment Breakdown</div>
              <div className="card-subtitle">Based on 2,841 social posts</div>
            </div>
            <span className="badge badge-buy">BUY</span>
          </div>
          <div className="stack stack-4">
            <div className="sentiment-bar">
              <div
                className="sentiment-bar-track"
                role="img"
                aria-label="AAPL sentiment: 62% bullish, 18% neutral, 20% bearish"
              >
                <div className="sentiment-bar-bullish" style={{ width: '62%' }} />
                <div className="sentiment-bar-neutral" style={{ width: '18%' }} />
                <div className="sentiment-bar-bearish" style={{ width: '20%' }} />
              </div>
            </div>
            <div className="sentiment-bar-labels">
              <div className="sentiment-bar-label">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }} />
                <span className="text-secondary">62%</span>
                <span className="text-muted">Bullish</span>
              </div>
              <div className="sentiment-bar-label">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--on-surface-muted)', opacity: 0.5, display: 'inline-block' }} />
                <span>18%</span>
                <span className="text-muted">Neutral</span>
              </div>
              <div className="sentiment-bar-label">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--tertiary)', display: 'inline-block' }} />
                <span className="text-tertiary">20%</span>
                <span className="text-muted">Bearish</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <div className="card-subtitle" style={{ marginBottom: 'var(--space-3)' }}>Signal Scores</div>
            <div className="content-grid-thirds" style={{ gap: 'var(--space-3)' }}>
              {BREAKDOWN_SCORES.map(s => (
                <div key={s.label} className="indicator-chip">
                  <span className="indicator-chip-label">{s.label}</span>
                  <span className="indicator-chip-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Crowd Sentiment Gauge</div>
              <div className="card-subtitle">Current signal needle</div>
            </div>
          </div>
          <div className="stack stack-6">
            {GAUGE_TICKERS.map(t => (
              <div key={t.symbol} className="stack stack-2">
                <div className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
                  <span className="tag tag-primary">{t.symbol}</span>
                  <span
                    className={`text-mono-md ${t.score >= 0 ? 'text-secondary' : 'text-tertiary'}`}
                    style={{ fontWeight: 700 }}
                  >
                    {t.score >= 0 ? '+' : ''}{t.score.toFixed(2)}
                  </span>
                </div>
                <div className="sentiment-gauge" style={{ height: 28 }}>
                  <div className="sentiment-gauge-track" style={{ height: '100%' }}>
                    <div
                      className="sentiment-gauge-needle"
                      style={{ left: `${((t.score + 1) / 2) * 100}%` }}
                      role="img"
                      aria-label={`${t.symbol} sentiment score: ${t.score}`}
                    />
                  </div>
                </div>
                <div className="sentiment-gauge-labels">
                  <span>Bearish −1</span>
                  <span>Neutral 0</span>
                  <span>+1 Bullish</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
