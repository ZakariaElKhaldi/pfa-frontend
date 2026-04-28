import type { Meta, StoryObj } from '@storybook/react-vite'
import { SignalAccuracyChart } from './SignalAccuracyChart'
import type { AccuracyRecord }  from './SignalAccuracyChart'

const meta: Meta<typeof SignalAccuracyChart> = {
  title: 'Charts/SignalAccuracyChart',
  component: SignalAccuracyChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Dual-line rolling accuracy chart for `GET /api/tickers/<symbol>/signal/accuracy/`. ' +
          'Computes a sliding-window proportion for 1h and 24h horizons. ' +
          'Confidence bands use the Wilson score interval (90% CI) — scientifically valid for binomial proportions at small n. ' +
          'Dashed 50% baseline marks the random-classifier threshold.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720, padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof SignalAccuracyChart>

// ── data factories ────────────────────────────────────────────────────────────

function makeRecords(
  n: number,
  opts: { baseAcc1h?: number; baseAcc24h?: number; noise?: number; startDays?: number } = {},
): AccuracyRecord[] {
  const {
    baseAcc1h  = 0.68,
    baseAcc24h = 0.61,
    noise      = 0.20,
    startDays  = 30,
  } = opts

  const signals: Array<'BUY' | 'SELL' | 'HOLD'>     = ['BUY', 'SELL', 'HOLD']
  const directions: Array<'UP' | 'DOWN' | 'FLAT'>   = ['UP', 'DOWN', 'FLAT']
  const base = Date.now() - startDays * 86_400_000

  return Array.from({ length: n }, (_, i) => {
    const p1h  = Math.min(1, Math.max(0, baseAcc1h  + (Math.random() - 0.5) * noise))
    const p24h = Math.min(1, Math.max(0, baseAcc24h + (Math.random() - 0.5) * noise))
    return {
      evaluatedAt:     new Date(base + i * 3_600_000).toISOString(),
      predicted:       signals[Math.floor(Math.random() * 3)],
      actualDirection: directions[Math.floor(Math.random() * 3)],
      accuracy1h:      Math.random() < p1h,
      accuracy24h:     Math.random() < p24h,
    }
  })
}

// ── stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    data: makeRecords(80, { baseAcc1h: 0.68, baseAcc24h: 0.61 }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Typical ML model performance — 1h accuracy ~68%, 24h ~61%. Shaded bands show Wilson 90% CI.',
      },
    },
  },
}

export const HighAccuracy: Story = {
  args: {
    data: makeRecords(80, { baseAcc1h: 0.82, baseAcc24h: 0.76, noise: 0.10 }),
  },
  parameters: {
    docs: { description: { story: 'Strong model — narrow CI bands reflect high consistency at >80% accuracy.' } },
  },
}

export const LowAccuracy: Story = {
  args: {
    data: makeRecords(80, { baseAcc1h: 0.44, baseAcc24h: 0.40, noise: 0.25 }),
  },
  parameters: {
    docs: { description: { story: 'Underperforming model — both lines hover below the 50% random baseline.' } },
  },
}

export const ModelDrift: Story = {
  args: {
    data: (() => {
      const early = makeRecords(40, { baseAcc1h: 0.75, baseAcc24h: 0.70, noise: 0.12 })
      const late  = makeRecords(40, { baseAcc1h: 0.52, baseAcc24h: 0.48, noise: 0.18, startDays: 10 })
      return [...early, ...late]
    })(),
  },
  parameters: {
    docs: { description: { story: 'Accuracy degrades over time — detectable as model drift. Signal to trigger re-train.' } },
  },
}

export const InsufficientData: Story = {
  args: {
    data: makeRecords(6, { baseAcc1h: 0.65, baseAcc24h: 0.60 }),
    rollWindow: 12,
  },
  parameters: {
    docs: { description: { story: 'Fewer than `rollWindow` records — no line rendered until ≥3 points are available.' } },
  },
}

export const WithNulls: Story = {
  args: {
    data: makeRecords(60, { baseAcc1h: 0.70, baseAcc24h: 0.63 }).map((d, i) => ({
      ...d,
      accuracy24h: i % 5 === 0 ? null : d.accuracy24h,
    })),
  },
  parameters: {
    docs: { description: { story: 'Some 24h records not yet evaluated (null). The 24h rolling average skips nulls.' } },
  },
}
