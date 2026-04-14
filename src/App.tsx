/**
 * CrowdSignal — Sentient Terminal
 * Design System Showcase · "The Quantified Pulse"
 *
 * This file renders every component and token in context.
 * It serves as the living design system reference until real pages are built.
 */
import { useState } from 'react'
import './index.css'

/* ─── Inline SVG icons (no external dep needed for showcase) ─────────────── */
const Icons = {
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ArrowUp: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  ),
  ArrowDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Flame: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  Logo: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
}

/* ─── Accuracy Gauge SVG Ring ─────────────────────────────────────────────── */
function AccuracyRing({ pct, color = 'var(--primary)' }: { pct: number; color?: string }) {
  const r = 30, c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <div className="accuracy-gauge-ring" style={{ width: 72, height: 72 }}>
      <svg viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.8s var(--ease-out)' }} />
      </svg>
      <div className="accuracy-gauge-value text-mono-md">{pct}%</div>
    </div>
  )
}

/* ─── Mock data ───────────────────────────────────────────────────────────── */
const TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '189.42', change: '+1.23', pct: '+0.65%', signal: 'BUY' as const },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: '242.16', change: '-4.88', pct: '-1.98%', signal: 'SELL' as const },
  { symbol: 'NVDA', name: 'Nvidia Corp.', price: '875.39', change: '+12.5', pct: '+1.45%', signal: 'BUY' as const },
  { symbol: 'AMZN', name: 'Amazon.com', price: '178.75', change: '-0.55', pct: '-0.31%', signal: 'HOLD' as const },
  { symbol: 'MSFT', name: 'Microsoft', price: '415.23', change: '+3.10', pct: '+0.75%', signal: 'BUY' as const },
]

const POSTS = [
  { source: 'R', sourceName: 'Reddit', time: '2m ago', content: '$AAPL absolutely printing. Multiple institutional upgrades this week, the sentiment shift is real.', label: 'bullish' as const, score: 0.82 },
  { source: 'S', sourceName: 'StockTwits', time: '8m ago', content: 'TSLA breaking down below 245 support. Bears in control here, watch out for more downside.', label: 'bearish' as const, score: -0.71 },
  { source: 'R', sourceName: 'Reddit', time: '15m ago', content: 'NVDA earnings whisper numbers looking very conservative. Market could be underpricing AI demand.', label: 'bullish' as const, score: 0.65 },
]

const ALERTS = [
  { type: 'divergence' as const, symbol: 'TSLA', sentiment: -0.71, momentum: 0.12, consistency: 0.18 },
  { type: 'extreme' as const, symbol: 'NVDA', sentiment: 0.88, momentum: 0.74, consistency: 0.22 },
]

/* ─── Signal badge helper ─────────────────────────────────────────────────── */
function SignalBadge({ signal }: { signal: 'BUY' | 'SELL' | 'HOLD' }) {
  const cls = { BUY: 'badge-buy', SELL: 'badge-sell', HOLD: 'badge-hold' }[signal]
  return <span className={`badge badge-lg ${cls}`}>{signal}</span>
}

/* ─── Sentiment badge ─────────────────────────────────────────────────────── */
function SentimentBadge({ label }: { label: 'bullish' | 'bearish' | 'neutral' }) {
  const cls = { bullish: 'badge-bullish', bearish: 'badge-bearish', neutral: 'badge-neutral' }[label]
  const dot = { bullish: 'var(--secondary)', bearish: 'var(--tertiary)', neutral: 'var(--on-surface-muted)' }[label]
  return (
    <span className={`badge ${cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {label}
    </span>
  )
}

/* ─── Toggle component ────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>
    </label>
  )
}

/* ─── Main App ────────────────────────────────────────────────────────────── */
export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [toggleState, setToggleState] = useState({ strategy1: true, strategy2: false, strategy3: true })
  const [showModal, setShowModal] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard',  icon: Icons.Grid },
    { id: 'signals',   label: 'Signals',    icon: Icons.Zap },
    { id: 'market',    label: 'Market',     icon: Icons.BarChart },
    { id: 'watchlist', label: 'Watchlist',  icon: Icons.Star },
    { id: 'portfolio', label: 'Portfolio',  icon: Icons.Briefcase },
    { id: 'strategies',label: 'Strategies', icon: Icons.TrendingUp },
    { id: 'export',    label: 'Export',     icon: Icons.Download },
  ]

  return (
    <div className="app-shell">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <nav className="sidebar animate-slide-in-left" aria-label="Primary navigation">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark" aria-hidden="true">
            <Icons.Logo />
          </div>
          <div>
            <div className="sidebar-logo-text">CrowdSignal</div>
            <div className="sidebar-logo-sub">Sentient Terminal</div>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-label">Navigate</span>
          {NAV_ITEMS.map(item => (
            <a
              key={item.id}
              className={`sidebar-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveNav(item.id) }}
              aria-current={activeNav === item.id ? 'page' : undefined}
            >
              <span className="sidebar-item-icon"><item.icon /></span>
              {item.label}
            </a>
          ))}
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-section-label">System</span>
          <a className={`sidebar-item ${activeNav === 'settings' ? 'active' : ''}`}
            href="#" onClick={(e) => { e.preventDefault(); setActiveNav('settings') }}>
            <span className="sidebar-item-icon"><Icons.Settings /></span>
            Settings
          </a>
          <div className="sidebar-item" style={{ marginTop: 'auto', cursor: 'default' }}>
            <div className="avatar avatar-sm" aria-label="User: ZK">ZK</div>
            <div className="stack stack-2" style={{ flex: 1, minWidth: 0 }}>
              <span className="text-title-md truncate">Zakaria</span>
              <span className="text-body-sm" style={{ fontSize: '10px' }}>Admin</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="app-main animate-fade-in">

        {/* TOPBAR */}
        <header className="topbar" role="banner">
          <div>
            <h1 className="topbar-title">Design System — "The Quantified Pulse"</h1>
          </div>
          <div className="topbar-actions">
            <div className="input-search-wrapper" style={{ width: 220 }}>
              <span className="input-search-icon"><Icons.Search /></span>
              <input
                className="input"
                type="search"
                placeholder="Search tickers…"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                aria-label="Search tickers"
                style={{ height: 36, fontSize: 'var(--text-body-sm)' }}
              />
            </div>
            <button className="btn-icon btn btn-secondary" aria-label="Notifications">
              <Icons.Bell />
            </button>
            <div className="avatar avatar-md" aria-label="User: ZK">ZK</div>
          </div>
        </header>

        <div className="page-content">
          <div className="stack stack-10">

            {/* ── SECTION 1: HERO ──────────────────────────────────────── */}
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
                      <Icons.Zap />
                      View Signals
                    </button>
                    <button className="btn btn-secondary btn-lg" id="cta-export">
                      <Icons.Download />
                      Export Data
                    </button>
                    <button className="btn btn-tertiary btn-lg" id="cta-learn">
                      How it works
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 2: METRIC CARDS ──────────────────────────────── */}
            <section aria-labelledby="metrics-heading" id="section-metrics">
              <h2 id="metrics-heading" className="text-headline-md" style={{ marginBottom: 'var(--space-5)' }}>
                Platform Overview
              </h2>
              <div className="metric-grid stagger-children animate-slide-up">
                {[
                  { label: 'Total Users',     value: '2,418',  delta: '+12%',  positive: true  },
                  { label: 'Signals Today',   value: '1,836',  delta: '+5.3%', positive: true  },
                  { label: 'Posts Analyzed',  value: '94,721', delta: '+8.1%', positive: true  },
                  { label: 'Tickers Tracked', value: '312',    delta: '+3',    positive: true  },
                  { label: 'Avg. Accuracy',   value: '72.4%',  delta: '-1.2%', positive: false },
                  { label: 'Active Alerts',   value: '7',      delta: '+2',    positive: false },
                ].map(m => (
                  <div key={m.label} className="metric-card animate-fade-in">
                    <span className="metric-card-label">{m.label}</span>
                    <span className="metric-card-value">{m.value}</span>
                    <span className={`metric-card-delta ${m.positive ? 'positive' : 'negative'}`}>
                      {m.positive ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                      {m.delta}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 3: WATCHLIST + ACCURACY ─────────────────────── */}
            <section aria-labelledby="watchlist-heading" id="section-watchlist">
              <div className="content-grid-main">
                {/* Watchlist */}
                <div className="stack stack-5">
                  <h2 id="watchlist-heading" className="text-headline-md">Watchlist Signals</h2>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--space-5) var(--space-6)', background: 'var(--surface-container-low)' }}>
                      <span className="text-label-md text-nav-label text-muted">5 Tickers · Updated 2m ago</span>
                    </div>
                    <div className="stagger-children">
                      {TICKERS.map((t) => (
                        <div key={t.symbol} className="ticker-card animate-fade-in"
                          style={{ borderRadius: 0, margin: '0 var(--space-2)' }}>
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

                {/* Right column */}
                <div className="stack stack-5">
                  {/* Global accuracy */}
                  <h2 className="text-headline-md">Signal Accuracy</h2>
                  <div className="card">
                    <div className="cluster cluster-6" style={{ justifyContent: 'space-around', marginBottom: 'var(--space-6)' }}>
                      {[
                        { label: 'BUY',  pct: 74, color: 'var(--secondary)' },
                        { label: 'SELL', pct: 68, color: 'var(--tertiary)'  },
                        { label: 'HOLD', pct: 71, color: 'var(--warning)'   },
                      ].map(a => (
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

                  {/* Trending */}
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">Trending</div>
                        <div className="card-subtitle">Top 5 mentioned (30d)</div>
                      </div>
                      <Icons.Flame />
                    </div>
                    <div className="stack stack-3">
                      {[
                        { symbol: 'NVDA', count: 12840 },
                        { symbol: 'TSLA', count: 9431  },
                        { symbol: 'AAPL', count: 7220  },
                        { symbol: 'AMD',  count: 4812  },
                        { symbol: 'SPY',  count: 3990  },
                      ].map((t, i) => (
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

            {/* ── SECTION 4: SENTIMENT VISUALIZATION ──────────────────── */}
            <section aria-labelledby="sentiment-heading" id="section-sentiment">
              <h2 id="sentiment-heading" className="text-headline-md" style={{ marginBottom: 'var(--space-5)' }}>
                Sentiment Tools
              </h2>
              <div className="content-grid-equal">

                {/* Sentiment Bar */}
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
                      <div className="sentiment-bar-track" role="img" aria-label="AAPL sentiment: 62% bullish, 18% neutral, 20% bearish">
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
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--on-surface-muted)', opacity: .5, display: 'inline-block' }} />
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
                      {[
                        { label: 'Sentiment',    value: '+0.62' },
                        { label: 'Momentum',     value: '+0.41' },
                        { label: 'Consistency',  value: '0.78'  },
                        { label: 'Bullish Ratio',value: '62%'   },
                        { label: 'Time Decay',   value: '0.54'  },
                        { label: 'Confidence',   value: '84%'   },
                      ].map(s => (
                        <div key={s.label} className="indicator-chip">
                          <span className="indicator-chip-label">{s.label}</span>
                          <span className="indicator-chip-value">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sentiment Gauge */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Crowd Sentiment Gauge</div>
                      <div className="card-subtitle">Current signal needle</div>
                    </div>
                  </div>
                  <div className="stack stack-6">
                    {[
                      { symbol: 'AAPL', score: 0.62 },
                      { symbol: 'TSLA', score: -0.41 },
                      { symbol: 'NVDA', score: 0.88 },
                    ].map(t => (
                      <div key={t.symbol} className="stack stack-2">
                        <div className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
                          <span className="tag tag-primary">{t.symbol}</span>
                          <span className={`text-mono-md ${t.score >= 0 ? 'text-secondary' : 'text-tertiary'}`} style={{ fontWeight: 700 }}>
                            {t.score >= 0 ? '+' : ''}{t.score.toFixed(2)}
                          </span>
                        </div>
                        <div className="sentiment-gauge" style={{ height: 28 }}>
                          <div className="sentiment-gauge-track" style={{ height: '100%' }}>
                            {/* Needle: map -1…+1 → 0%…100% */}
                            <div className="sentiment-gauge-needle"
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

            {/* ── SECTION 5: SOCIAL FEED + ALERTS ─────────────────────── */}
            <section aria-labelledby="social-heading" id="section-social">
              <div className="content-grid-main" style={{ gridTemplateColumns: '1fr 320px' }}>

                {/* Social feed */}
                <div className="stack stack-4">
                  <h2 id="social-heading" className="text-headline-md">Social Feed</h2>
                  <div className="card" style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div className="list-divider-free">
                      {POSTS.map((p, i) => (
                        <div key={i} className="post-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
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

                {/* Alerts */}
                <div className="stack stack-4">
                  <h2 className="text-headline-md">Active Alerts</h2>
                  <div className="stack stack-3">
                    {ALERTS.map((a, i) => (
                      <div key={i} className="alert-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className={`alert-card-icon ${a.type}`}>
                          <Icons.AlertTriangle />
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

            {/* ── SECTION 6: PORTFOLIO OVERVIEW ────────────────────────── */}
            <section aria-labelledby="portfolio-heading" id="section-portfolio">
              <h2 id="portfolio-heading" className="text-headline-md" style={{ marginBottom: 'var(--space-5)' }}>
                Paper Portfolio
              </h2>
              <div className="content-grid-equal">
                {/* Summary */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Portfolio Summary</div>
                      <div className="card-subtitle">Paper trading · $100k starting capital</div>
                    </div>
                  </div>
                  <div className="stack stack-4">
                    {[
                      { label: 'Cash Balance',       value: '$87,240.00', color: 'var(--on-surface)' },
                      { label: 'Positions Value',     value: '$15,560.00', color: 'var(--on-surface)' },
                      { label: 'Total Portfolio',     value: '$102,800.00',color: 'var(--on-surface)' },
                      { label: 'Unrealized P&L',      value: '+$2,800.00  (+2.80%)', color: 'var(--secondary)' },
                    ].map(s => (
                      <div key={s.label} className="cluster cluster-4" style={{ justifyContent: 'space-between' }}>
                        <span className="text-label-md text-muted text-nav-label">{s.label}</span>
                        <span className="text-mono-md" style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cluster cluster-3" style={{ marginTop: 'var(--space-5)' }}>
                    <button className="btn btn-primary btn-md" id="btn-buy" onClick={() => setShowModal(true)}>
                      Buy
                    </button>
                    <button className="btn btn-danger btn-md" id="btn-sell">
                      Sell
                    </button>
                  </div>
                </div>

                {/* Positions table */}
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
                        {[
                          { symbol: 'AAPL', qty: 20,  avg: '$181.10', pnl: '+$165.20', pos: true },
                          { symbol: 'NVDA', qty: 5,   avg: '$852.40', pnl: '+$114.95', pos: true },
                          { symbol: 'TSLA', qty: 10,  avg: '$249.80', pnl: '-$76.40',  pos: false },
                        ].map(p => (
                          <tr key={p.symbol}>
                            <td><span className="tag tag-primary">{p.symbol}</span></td>
                            <td className="mono">{p.qty}</td>
                            <td className="mono">{p.avg}</td>
                            <td className={`mono ${p.pos ? 'text-secondary' : 'text-tertiary'}`} style={{ fontWeight: 600 }}>{p.pnl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 7: STRATEGIES ────────────────────────────────── */}
            <section aria-labelledby="strategies-heading" id="section-strategies">
              <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                <h2 id="strategies-heading" className="text-headline-md">Automation Strategies</h2>
                <button className="btn btn-primary btn-sm" id="btn-new-strategy">+ New Strategy</button>
              </div>
              <div className="stack stack-3">
                {[
                  { id: 'strategy1', name: 'Bullish Momentum Catch', desc: 'BUY when sentiment > 0.6 AND RSI < 65 AND signal == BUY', tickers: ['AAPL','NVDA','MSFT'], executions: 12, lastRun: '4m ago' },
                  { id: 'strategy2', name: 'Panic Sell Detector', desc: 'SELL when extreme_sentiment AND consistency < 0.3 AND momentum < 0', tickers: ['TSLA','AMD'], executions: 3, lastRun: '2h ago' },
                  { id: 'strategy3', name: 'HOLD Accumulation', desc: 'Notify when signal == HOLD AND bullish_ratio > 0.55 for 3 consecutive periods', tickers: ['AMZN','SPY'], executions: 7, lastRun: '18m ago' },
                ].map(s => (
                  <div key={s.id} className="card card-interactive animate-fade-in">
                    <div className="cluster cluster-4" style={{ justifyContent: 'space-between' }}>
                      <div className="stack stack-2">
                        <div className="cluster cluster-3">
                          <span className="text-headline-sm">{s.name}</span>
                          {(toggleState as any)[s.id] && <span className="badge badge-buy" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>}
                        </div>
                        <p className="text-body-sm" style={{ maxWidth: 560, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)' }}>
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
                          checked={(toggleState as any)[s.id]}
                          onChange={v => setToggleState(prev => ({ ...prev, [s.id]: v }))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 8: COMPONENT TOKENS REFERENCE ────────────────── */}
            <section aria-labelledby="tokens-heading" id="section-tokens">
              <h2 id="tokens-heading" className="text-headline-md" style={{ marginBottom: 'var(--space-5)' }}>
                Design Token Reference
              </h2>
              <div className="content-grid-equal">

                {/* Color surfaces */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Surface Tonal Stack</div>
                  <div className="stack stack-2">
                    {[
                      { name: 'surface-container-lowest', var: 'var(--surface-container-lowest)' },
                      { name: 'surface-container-low',    var: 'var(--surface-container-low)'    },
                      { name: 'surface-container',        var: 'var(--surface-container)'        },
                      { name: 'surface-container-high',   var: 'var(--surface-container-high)'   },
                      { name: 'surface-container-highest',var: 'var(--surface-container-highest)'},
                      { name: 'surface-bright',           var: 'var(--surface-bright)'           },
                    ].map(s => (
                      <div key={s.name} className="cluster cluster-3" style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', background: s.var }}>
                        <span className="text-mono-sm" style={{ color: 'var(--on-surface)' }}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Semantic colors */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Semantic Color System</div>
                  <div className="stack stack-3">
                    {[
                      { name: 'primary',   bg: 'var(--primary)',   fg: 'white', label: 'Accent / Signal' },
                      { name: 'secondary',  bg: 'var(--secondary)', fg: 'white', label: 'Bullish / Success' },
                      { name: 'tertiary',  bg: 'var(--tertiary)',  fg: 'white', label: 'Bearish / Error' },
                      { name: 'warning',   bg: 'var(--warning)',   fg: 'white', label: 'Hold / Caution' },
                    ].map(s => (
                      <div key={s.name} className="cluster cluster-4" style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: s.bg }}>
                        <span style={{ color: s.fg, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)', fontWeight: 600 }}>
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

                {/* Typography scale */}
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

                {/* Mono scale */}
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

                {/* Button variants */}
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
                      <button className="btn btn-icon btn-secondary btn-sm" aria-label="Search"><Icons.Search /></button>
                      <button className="btn btn-icon btn-secondary" aria-label="Bell"><Icons.Bell /></button>
                      <button className="btn btn-icon btn-secondary btn-lg" aria-label="Download"><Icons.Download /></button>
                    </div>
                  </div>
                </div>

                {/* Input variants */}
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
                        <span className="input-search-icon"><Icons.Search /></span>
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

                {/* Glass + tooltip */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Glass & Elevation</div>
                  <div
                    className="stack stack-4"
                    style={{ background: 'var(--gradient-bullish)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}
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

                {/* Badges reference */}
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

          </div>
        </div>
      </main>

      {/* ── MODAL ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal animate-slide-up">
            <div className="modal-header">
              <div>
                <h2 id="modal-title" className="modal-title">Execute Trade</h2>
                <p className="card-subtitle">Paper portfolio · At market price</p>
              </div>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setShowModal(false)} aria-label="Close modal">
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-wrapper">
                <label className="input-label" htmlFor="modal-symbol">Ticker Symbol</label>
                <input id="modal-symbol" className="input" defaultValue="AAPL" />
              </div>
              <div className="input-wrapper">
                <label className="input-label" htmlFor="modal-qty">Quantity (shares)</label>
                <input id="modal-qty" className="input" type="number" min="1" defaultValue="10" />
              </div>
              <div className="card card-recessed" style={{ padding: 'var(--space-4)' }}>
                <div className="cluster cluster-4" style={{ justifyContent: 'space-between' }}>
                  <span className="text-label-md text-muted text-nav-label">Estimated Cost</span>
                  <span className="text-mono-lg" style={{ fontWeight: 700 }}>$1,894.20</span>
                </div>
                <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                  <span className="text-label-md text-muted text-nav-label">Current Price</span>
                  <span className="text-mono-md">$189.42 / share</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-md" onClick={() => setShowModal(false)} id="modal-cancel">Cancel</button>
              <button className="btn btn-primary btn-md" id="modal-buy-confirm">Confirm Buy</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
