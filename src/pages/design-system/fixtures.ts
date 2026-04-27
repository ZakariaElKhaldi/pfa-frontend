import type { Signal, SentimentLabel } from '@/design-system/tokens'

export interface TickerRow {
  symbol: string
  name: string
  price: string
  change: string
  pct: string
  signal: Signal
}

export interface PostRow {
  source: string
  sourceName: string
  time: string
  content: string
  label: SentimentLabel
  score: number
}

export type AlertKind = 'divergence' | 'extreme' | 'hype_fade' | 'pump_suspected'

export interface AlertRow {
  type: AlertKind
  symbol: string
  sentiment: number
  momentum: number
  consistency: number
}

export const TICKERS: TickerRow[] = [
  { symbol: 'AAPL', name: 'Apple Inc.',   price: '189.42', change: '+1.23', pct: '+0.65%', signal: 'BUY' },
  { symbol: 'TSLA', name: 'Tesla Inc.',   price: '242.16', change: '-4.88', pct: '-1.98%', signal: 'SELL' },
  { symbol: 'NVDA', name: 'Nvidia Corp.', price: '875.39', change: '+12.5', pct: '+1.45%', signal: 'BUY' },
  { symbol: 'AMZN', name: 'Amazon.com',   price: '178.75', change: '-0.55', pct: '-0.31%', signal: 'HOLD' },
  { symbol: 'MSFT', name: 'Microsoft',    price: '415.23', change: '+3.10', pct: '+0.75%', signal: 'BUY' },
]

export const POSTS: PostRow[] = [
  { source: 'R', sourceName: 'Reddit',     time: '2m ago',  content: '$AAPL absolutely printing. Multiple institutional upgrades this week, the sentiment shift is real.', label: 'bullish', score: 0.82 },
  { source: 'S', sourceName: 'StockTwits', time: '8m ago',  content: 'TSLA breaking down below 245 support. Bears in control here, watch out for more downside.',        label: 'bearish', score: -0.71 },
  { source: 'R', sourceName: 'Reddit',     time: '15m ago', content: 'NVDA earnings whisper numbers looking very conservative. Market could be underpricing AI demand.',  label: 'bullish', score: 0.65 },
]

export const ALERTS: AlertRow[] = [
  { type: 'divergence', symbol: 'TSLA', sentiment: -0.71, momentum: 0.12, consistency: 0.18 },
  { type: 'extreme',    symbol: 'NVDA', sentiment:  0.88, momentum: 0.74, consistency: 0.22 },
]

export const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: 'Grid'       as const },
  { id: 'signals',    label: 'Signals',    icon: 'Zap'        as const },
  { id: 'market',     label: 'Market',     icon: 'BarChart'   as const },
  { id: 'watchlist',  label: 'Watchlist',  icon: 'Star'       as const },
  { id: 'portfolio',  label: 'Portfolio',  icon: 'Briefcase'  as const },
  { id: 'strategies', label: 'Strategies', icon: 'TrendingUp' as const },
  { id: 'export',     label: 'Export',     icon: 'Download'   as const },
]

export const METRICS = [
  { label: 'Total Users',     value: '2,418',  delta: '+12%',  positive: true  },
  { label: 'Signals Today',   value: '1,836',  delta: '+5.3%', positive: true  },
  { label: 'Posts Analyzed',  value: '94,721', delta: '+8.1%', positive: true  },
  { label: 'Tickers Tracked', value: '312',    delta: '+3',    positive: true  },
  { label: 'Avg. Accuracy',   value: '72.4%',  delta: '-1.2%', positive: false },
  { label: 'Active Alerts',   value: '7',      delta: '+2',    positive: false },
]

export const ACCURACY_GAUGES = [
  { label: 'BUY',  pct: 74, color: 'var(--secondary)' },
  { label: 'SELL', pct: 68, color: 'var(--tertiary)'  },
  { label: 'HOLD', pct: 71, color: 'var(--warning)'   },
]

export const TRENDING = [
  { symbol: 'NVDA', count: 12840 },
  { symbol: 'TSLA', count: 9431  },
  { symbol: 'AAPL', count: 7220  },
  { symbol: 'AMD',  count: 4812  },
  { symbol: 'SPY',  count: 3990  },
]

export const STRATEGIES = [
  { id: 'strategy1', name: 'Bullish Momentum Catch', desc: 'BUY when sentiment > 0.6 AND RSI < 65 AND signal == BUY',                             tickers: ['AAPL', 'NVDA', 'MSFT'], executions: 12, lastRun: '4m ago'  },
  { id: 'strategy2', name: 'Panic Sell Detector',    desc: 'SELL when extreme_sentiment AND consistency < 0.3 AND momentum < 0',                  tickers: ['TSLA', 'AMD'],          executions:  3, lastRun: '2h ago'  },
  { id: 'strategy3', name: 'HOLD Accumulation',      desc: 'Notify when signal == HOLD AND bullish_ratio > 0.55 for 3 consecutive periods',       tickers: ['AMZN', 'SPY'],          executions:  7, lastRun: '18m ago' },
]
