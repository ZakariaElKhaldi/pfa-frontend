import { useState, useEffect, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { PriceChart } from './PriceChart'
import type { OHLCBar } from './PriceChart'

/* ═══════════════════════════════════════════════════════════════════════════
   Data generators
   ═══════════════════════════════════════════════════════════════════════════ */

function nextWeekday(d: Date): Date {
  const next = new Date(+d + 864e5)
  while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
    next.setTime(+next + 864e5)
  }
  return next
}

/** Generate N candles of OHLCV data with configurable drift & volatility. */
function makeCandles(
  n: number,
  opts: {
    startPrice?: number
    startDate?: Date
    drift?: number      // per-bar price drift
    volatility?: number // per-bar vol magnitude
  } = {},
): OHLCBar[] {
  const {
    startPrice = 180,
    startDate = new Date('2024-01-02'),
    drift = 0,
    volatility = 3,
  } = opts

  const bars: OHLCBar[] = []
  let price = startPrice
  let d = new Date(startDate)

  for (let i = 0; i < n; i++) {
    while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d = nextWeekday(d)

    const move  = (Math.random() - 0.5) * volatility * 2 + drift
    const open  = price + (Math.random() - 0.48) * volatility * 0.8
    const close = open + move
    const high  = Math.max(open, close) + Math.random() * volatility * 0.6
    const low   = Math.min(open, close) - Math.random() * volatility * 0.6
    const vol   = Math.round(
      (8 + Math.abs(move) * 4) * 1e6 * (0.5 + Math.random()),
    )

    bars.push({ date: new Date(d), open, high, low, close, volume: vol })
    price = close
    d = nextWeekday(d)
  }
  return bars
}

/** Generate a "pump & dump" dataset. */
function makePumpDump(): OHLCBar[] {
  // Quiet accumulation
  const phase1 = makeCandles(15, { startPrice: 42, drift: 0.15, volatility: 1.5 })
  const last1  = phase1[phase1.length - 1]

  // Pump — strong upward drift with high volume
  const phase2 = makeCandles(8, {
    startPrice: last1.close,
    startDate: nextWeekday(last1.date),
    drift: 3.5,
    volatility: 4,
  })
  const last2 = phase2[phase2.length - 1]

  // Blow-off top
  const phase3 = makeCandles(3, {
    startPrice: last2.close,
    startDate: nextWeekday(last2.date),
    drift: 6,
    volatility: 8,
  })
  const last3 = phase3[phase3.length - 1]

  // Dump
  const phase4 = makeCandles(10, {
    startPrice: last3.close,
    startDate: nextWeekday(last3.date),
    drift: -5,
    volatility: 6,
  })
  const last4 = phase4[phase4.length - 1]

  // Dead cat bounce
  const phase5 = makeCandles(8, {
    startPrice: last4.close,
    startDate: nextWeekday(last4.date),
    drift: 0.5,
    volatility: 3,
  })

  return [...phase1, ...phase2, ...phase3, ...phase4, ...phase5]
}

/* ═══════════════════════════════════════════════════════════════════════════
   Real-time simulation wrapper
   ═══════════════════════════════════════════════════════════════════════════ */

function RealTimeChart() {
  const [data, setData] = useState<OHLCBar[]>(() => makeCandles(40, { startPrice: 185 }))
  const priceRef = useRef(data[data.length - 1].close)
  const dateRef  = useRef(data[data.length - 1].date)

  // Tick the "live" candle every 300ms
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setData(prev => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }

        // Random tick
        const tick = (Math.random() - 0.48) * 1.8
        last.close = Math.max(0.01, last.close + tick)
        last.high  = Math.max(last.high, last.close)
        last.low   = Math.min(last.low, last.close)
        last.volume += Math.round(Math.abs(tick) * 5e5)

        updated[updated.length - 1] = last
        priceRef.current = last.close
        return updated
      })
    }, 300)

    return () => clearInterval(tickInterval)
  }, [])

  // Add a new candle every 3s
  useEffect(() => {
    const barInterval = setInterval(() => {
      setData(prev => {
        const lastDate = prev[prev.length - 1].date
        const newDate  = nextWeekday(lastDate)
        dateRef.current = newDate

        const open   = priceRef.current
        const move   = (Math.random() - 0.48) * 3
        const close  = open + move
        const high   = Math.max(open, close) + Math.random() * 1.5
        const low    = Math.min(open, close) - Math.random() * 1.5
        const volume = Math.round((5 + Math.abs(move) * 3) * 1e6)

        const newBar: OHLCBar = { date: newDate, open, high, low, close, volume }

        // Keep last 60 candles on screen
        const next = [...prev, newBar]
        if (next.length > 60) next.shift()
        return next
      })
    }, 3000)

    return () => clearInterval(barInterval)
  }, [])

  const lastBar  = data[data.length - 1]
  const prevBar  = data[data.length - 2]
  const chg      = prevBar ? ((lastBar.close - prevBar.close) / prevBar.close * 100).toFixed(2) : '0.00'
  const isUp     = lastBar.close >= (prevBar?.close ?? lastBar.open)
  const chgColor = isUp ? 'hsl(158, 60%, 35%)' : 'hsl(4, 68%, 50%)'

  return (
    <div className="price-chart-story-wrapper">
      <div className="price-chart-story-header">
        <div className="price-chart-story-title">
          <h3>AAPL</h3>
          <span style={{ color: chgColor }}>
            ${lastBar.close.toFixed(2)} ({isUp ? '+' : ''}{chg}%)
          </span>
          <div className="price-chart-live-badge">
            <div className="price-chart-live-dot" />
            Live
          </div>
        </div>
      </div>
      <PriceChart
        data={data}
        height={420}
        showVolume
        showSMA
        showBollinger={false}
        showCrosshair
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Interactive indicators toggle wrapper
   ═══════════════════════════════════════════════════════════════════════════ */

function InteractiveChart() {
  const [showSMA, setShowSMA] = useState(true)
  const [showBB, setShowBB]   = useState(true)
  const [showVol, setShowVol] = useState(true)
  const chartData = useRef(makeCandles(90, { startPrice: 165, drift: 0.3 })).current

  const last = chartData[chartData.length - 1]

  return (
    <div className="price-chart-story-wrapper">
      <div className="price-chart-story-header">
        <div className="price-chart-story-title">
          <h3>MSFT</h3>
          <span style={{ color: 'hsl(158, 60%, 35%)' }}>
            ${last.close.toFixed(2)}
          </span>
        </div>
        <div className="price-chart-story-controls">
          <button
            className={showSMA ? 'active' : ''}
            onClick={() => setShowSMA(v => !v)}
          >
            SMA 20
          </button>
          <button
            className={showBB ? 'active' : ''}
            onClick={() => setShowBB(v => !v)}
          >
            Bollinger
          </button>
          <button
            className={showVol ? 'active' : ''}
            onClick={() => setShowVol(v => !v)}
          >
            Volume
          </button>
        </div>
      </div>
      <PriceChart
        data={chartData}
        height={440}
        showVolume={showVol}
        showSMA={showSMA}
        showBollinger={showBB}
        showCrosshair
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Pump Suspected wrapper
   ═══════════════════════════════════════════════════════════════════════════ */

function PumpSuspectedChart() {
  const chartData = useRef(makePumpDump()).current
  const maxPrice  = Math.max(...chartData.map(d => d.high))
  const pumpIdx   = chartData.findIndex(d => d.high === maxPrice)
  const pumpDate  = chartData[pumpIdx]?.date

  return (
    <div className="price-chart-story-wrapper">
      <div className="price-chart-story-header">
        <div className="price-chart-story-title">
          <h3>$MEME</h3>
          <span style={{ color: 'hsl(4, 68%, 50%)' }}>
            Pump Suspected — Peak ${maxPrice.toFixed(2)} on{' '}
            {pumpDate ? pumpDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </span>
        </div>
        <div className="price-chart-live-badge" style={{ background: 'hsla(38, 88%, 46%, 0.12)', color: 'hsl(38, 88%, 46%)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Alert
        </div>
      </div>
      <PriceChart
        data={chartData}
        height={440}
        showVolume
        showSMA
        showBollinger
        showCrosshair
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Multi-timeframe comparison wrapper
   ═══════════════════════════════════════════════════════════════════════════ */

function MultiTimeframeChart() {
  type TF = '1W' | '1M' | '3M' | '6M'
  const [tf, setTF] = useState<TF>('1M')

  const datasets = useRef<Record<TF, OHLCBar[]>>({
    '1W': makeCandles(5, { startPrice: 190, volatility: 2 }),
    '1M': makeCandles(22, { startPrice: 185 }),
    '3M': makeCandles(65, { startPrice: 170, drift: 0.2 }),
    '6M': makeCandles(130, { startPrice: 155, drift: 0.15, volatility: 4 }),
  }).current

  const last = datasets[tf][datasets[tf].length - 1]
  const first = datasets[tf][0]
  const pctChg = ((last.close - first.open) / first.open * 100).toFixed(2)
  const isUp = last.close >= first.open

  return (
    <div className="price-chart-story-wrapper">
      <div className="price-chart-story-header">
        <div className="price-chart-story-title">
          <h3>NVDA</h3>
          <span style={{ color: isUp ? 'hsl(158, 60%, 35%)' : 'hsl(4, 68%, 50%)' }}>
            ${last.close.toFixed(2)} ({isUp ? '+' : ''}{pctChg}%)
          </span>
        </div>
        <div className="price-chart-story-controls">
          {(['1W', '1M', '3M', '6M'] as TF[]).map(t => (
            <button
              key={t}
              className={tf === t ? 'active' : ''}
              onClick={() => setTF(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <PriceChart
        data={datasets[tf]}
        height={420}
        showVolume
        showSMA={tf !== '1W'}
        showBollinger={tf === '3M' || tf === '6M'}
        showCrosshair
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Storybook meta
   ═══════════════════════════════════════════════════════════════════════════ */

const meta: Meta<typeof PriceChart> = {
  title: 'Charts/PriceChart',
  component: PriceChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Advanced D3 candlestick chart with volume sub-chart, 20-period SMA, Bollinger Bands, interactive crosshair + tooltip, and latest price marker. Supports real-time data feeds.',
      },
    },
  },
  argTypes: {
    showVolume:    { control: 'boolean' },
    showSMA:       { control: 'boolean' },
    showBollinger: { control: 'boolean' },
    showCrosshair: { control: 'boolean' },
    height:        { control: { type: 'range', min: 300, max: 700, step: 20 } },
  },
}
export default meta

type Story = StoryObj<typeof PriceChart>

/* ── Default ──────────────────────────────────────────────────────────────── */
export const Default: Story = {
  args: {
    data: makeCandles(60),
    height: 440,
    showVolume: true,
    showSMA: true,
    showBollinger: false,
    showCrosshair: true,
  },
}

/* ── Real-time Simulation ─────────────────────────────────────────────────── */
export const RealTimeSimulation: Story = {
  render: () => <RealTimeChart />,
  parameters: {
    docs: {
      description: {
        story:
          'Simulates a live WebSocket data feed. A new candle appears every 3 seconds, and the current "live" candle updates its close/high/low every 300ms with random ticks.',
      },
    },
  },
}

/* ── Pump Suspected ───────────────────────────────────────────────────────── */
export const PumpSuspected: Story = {
  render: () => <PumpSuspectedChart />,
  parameters: {
    docs: {
      description: {
        story:
          'Pre-built dataset showing a classic pump-and-dump pattern: quiet accumulation → explosive pump → blow-off top → crash → dead cat bounce. All indicators enabled.',
      },
    },
  },
}

/* ── With Indicators (interactive toggles) ────────────────────────────────── */
export const WithIndicators: Story = {
  render: () => <InteractiveChart />,
  parameters: {
    docs: {
      description: {
        story:
          'Toggle SMA, Bollinger Bands, and Volume on/off interactively. 90 candles with positive drift for clear trend visibility.',
      },
    },
  },
}

/* ── Multi-Timeframe ──────────────────────────────────────────────────────── */
export const MultiTimeframe: Story = {
  render: () => <MultiTimeframeChart />,
  parameters: {
    docs: {
      description: {
        story:
          'Switch between 1W / 1M / 3M / 6M timeframes. Each timeframe has its own pre-generated dataset. Bollinger Bands auto-enable on larger timeframes.',
      },
    },
  },
}

/* ── Volume Only ──────────────────────────────────────────────────────────── */
export const VolumeOnly: Story = {
  args: {
    data: makeCandles(45),
    height: 380,
    showVolume: true,
    showSMA: false,
    showBollinger: false,
    showCrosshair: true,
  },
}

/* ── Minimal Clean ────────────────────────────────────────────────────────── */
export const MinimalClean: Story = {
  args: {
    data: makeCandles(30, { volatility: 2 }),
    height: 280,
    showVolume: false,
    showSMA: false,
    showBollinger: false,
    showCrosshair: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Clean candlestick chart with no overlays — suitable for embedding in small dashboard cards.',
      },
    },
  },
}

/* ── Empty State ──────────────────────────────────────────────────────────── */
export const Empty: Story = {
  args: { data: [], height: 300 },
}
