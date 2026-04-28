import type { Meta, StoryObj } from '@storybook/react-vite'
import { SentimentPriceChart } from './SentimentPriceChart'
import type { SentimentPricePoint } from './SentimentPriceChart'

const meta: Meta<typeof SentimentPriceChart> = {
  title: 'Charts/SentimentPriceChart',
  component: SentimentPriceChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Dual-axis correlation chart. Left axis: sentiment score (composite NLP metric from `SignalSnapshot`). ' +
          'Right axis: closing price from `PriceSnapshot`. ' +
          'Split gradient fill: green above zero (bullish), red below (bearish). ' +
          'Signal markers overlay the price line: ▲ BUY, ▽ SELL, ● HOLD. ' +
          'Caller merges `/api/tickers/<symbol>/signal/history/` with `/api/tickers/<symbol>/prices/` on timestamp.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof SentimentPriceChart>

// ── data factory ─────────────────────────────────────────────────────────────

function makeSeries(
  n:    number,
  opts: {
    startPrice?:    number
    priceVolatility?: number
    sentBias?:      number
    sentAmplitude?: number
    correlated?:    boolean
    ticker?:        string
  } = {},
): SentimentPricePoint[] {
  const {
    startPrice      = 185,
    priceVolatility = 0.012,
    sentBias        = 0,
    sentAmplitude   = 0.6,
    correlated      = true,
  } = opts

  const signals: Array<'BUY' | 'SELL' | 'HOLD'> = ['BUY', 'SELL', 'HOLD']
  const base = Date.now() - n * 3_600_000
  let price  = startPrice

  return Array.from({ length: n }, (_, i) => {
    const sent  = Math.max(-1, Math.min(1, sentBias + sentAmplitude * Math.sin(i / 8) + (Math.random() - 0.5) * 0.3))
    const priceChange = correlated
      ? priceVolatility * sent + priceVolatility * (Math.random() - 0.5)
      : priceVolatility * (Math.random() - 0.5)
    price = Math.max(1, price * (1 + priceChange))

    const sig: 'BUY' | 'SELL' | 'HOLD' | undefined =
      i % 8 === 0 ? signals[Math.floor(Math.random() * 3)] : undefined

    return {
      time:           new Date(base + i * 3_600_000).toISOString(),
      price:          +price.toFixed(2),
      sentimentScore: +sent.toFixed(4),
      signal:         sig,
    }
  })
}

// ── stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    data:   makeSeries(72, { startPrice: 185, correlated: true }),
    ticker: 'AAPL',
  },
}

export const BullishRun: Story = {
  args: {
    data:   makeSeries(72, { startPrice: 320, sentBias: 0.45, sentAmplitude: 0.35, priceVolatility: 0.015, correlated: true }),
    ticker: 'NVDA',
  },
  parameters: {
    docs: { description: { story: 'Sustained bullish sentiment driving a price rally. Gradient stays in green territory.' } },
  },
}

export const BearishCorrection: Story = {
  args: {
    data:   makeSeries(72, { startPrice: 240, sentBias: -0.40, sentAmplitude: 0.30, priceVolatility: 0.014, correlated: true }),
    ticker: 'TSLA',
  },
  parameters: {
    docs: { description: { story: 'Negative sentiment leading a price decline — red gradient dominates.' } },
  },
}

export const Divergence: Story = {
  args: {
    data: (() => {
      // Sentiment rises but price keeps falling — potential contrarian signal
      const n    = 72
      const base = Date.now() - n * 3_600_000
      let price  = 95
      return Array.from({ length: n }, (_, i): SentimentPricePoint => {
        const sent = Math.min(0.9, -0.5 + (i / n) * 1.4 + (Math.random() - 0.5) * 0.2)
        price      = Math.max(1, price * (1 - 0.008 + (Math.random() - 0.5) * 0.010))
        return {
          time:           new Date(base + i * 3_600_000).toISOString(),
          price:          +price.toFixed(2),
          sentimentScore: +sent.toFixed(4),
          signal:         i % 10 === 0 ? (sent > 0.3 ? 'BUY' : 'HOLD') : undefined,
        }
      })
    })(),
    ticker: 'GME',
  },
  parameters: {
    docs: { description: { story: 'Classic divergence: social sentiment recovering while price continues to fall. Analyst alert case.' } },
  },
}

export const MixedSignals: Story = {
  args: {
    data:   makeSeries(48, { startPrice: 72, sentBias: 0, sentAmplitude: 0.8, priceVolatility: 0.018, correlated: false }),
    ticker: 'AMC',
  },
  parameters: {
    docs: { description: { story: 'Sentiment and price decorrelated — low signal reliability, wide oscillations.' } },
  },
}

export const NoSignals: Story = {
  args: {
    data:   makeSeries(48, { startPrice: 420 }).map(d => ({ ...d, signal: undefined })),
    ticker: 'MSFT',
  },
  parameters: {
    docs: { description: { story: 'No signal markers — pure sentiment vs price view.' } },
  },
}
