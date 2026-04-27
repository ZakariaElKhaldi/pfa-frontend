const SUMMARY = [
  { label: 'Cash Balance',    value: '$87,240.00',            color: 'var(--on-surface)' },
  { label: 'Positions Value', value: '$15,560.00',            color: 'var(--on-surface)' },
  { label: 'Total Portfolio', value: '$102,800.00',           color: 'var(--on-surface)' },
  { label: 'Unrealized P&L',  value: '+$2,800.00  (+2.80%)',  color: 'var(--secondary)'  },
]

const POSITIONS = [
  { symbol: 'AAPL', qty: 20, avg: '$181.10', pnl: '+$165.20', pos: true  },
  { symbol: 'NVDA', qty:  5, avg: '$852.40', pnl: '+$114.95', pos: true  },
  { symbol: 'TSLA', qty: 10, avg: '$249.80', pnl: '-$76.40',  pos: false },
]

export function PortfolioSection({ onBuy }: { onBuy: () => void }) {
  return (
    <section aria-labelledby="portfolio-heading" id="section-portfolio">
      <h2 id="portfolio-heading" className="text-headline-md" style={{ marginBottom: 'var(--space-5)' }}>
        Paper Portfolio
      </h2>
      <div className="content-grid-equal">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Portfolio Summary</div>
              <div className="card-subtitle">Paper trading · $100k starting capital</div>
            </div>
          </div>
          <div className="stack stack-4">
            {SUMMARY.map(s => (
              <div key={s.label} className="cluster cluster-4" style={{ justifyContent: 'space-between' }}>
                <span className="text-label-md text-muted text-nav-label">{s.label}</span>
                <span className="text-mono-md" style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="cluster cluster-3" style={{ marginTop: 'var(--space-5)' }}>
            <button className="btn btn-primary btn-md" id="btn-buy" onClick={onBuy}>Buy</button>
            <button className="btn btn-danger btn-md" id="btn-sell">Sell</button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-5) var(--space-6)', background: 'var(--surface-container-low)' }}>
            <span className="card-title">Open Positions</span>
          </div>
          <div className="table-wrapper">
            <table className="table" aria-label="Open positions">
              <thead>
                <tr>
                  <th scope="col">Symbol</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Avg Price</th>
                  <th scope="col">P&L</th>
                </tr>
              </thead>
              <tbody>
                {POSITIONS.map(p => (
                  <tr key={p.symbol}>
                    <td><span className="tag tag-primary">{p.symbol}</span></td>
                    <td className="mono">{p.qty}</td>
                    <td className="mono">{p.avg}</td>
                    <td
                      className={`mono ${p.pos ? 'text-secondary' : 'text-tertiary'}`}
                      style={{ fontWeight: 600 }}
                    >
                      {p.pnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
