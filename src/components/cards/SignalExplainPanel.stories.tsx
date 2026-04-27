import type { Meta, StoryObj } from '@storybook/react-vite'
import { SignalExplainPanel } from './SignalExplainPanel'
import type { ScoringEntry } from './SignalExplainPanel'

const entries: ScoringEntry[] = [
  { feature: 'sentiment_score',    score:  0.7430, weight: 0.35 },
  { feature: 'time_decay_score',   score:  0.5210, weight: 0.15 },
  { feature: 'source_weighted',    score:  0.6180, weight: 0.20 },
  { feature: 'momentum',           score:  0.3870, weight: 0.15 },
  { feature: 'consistency',        score: -0.1240, weight: 0.10 },
  { feature: 'bullish_ratio',      score:  0.8100, weight: 0.05 },
]

const meta: Meta<typeof SignalExplainPanel> = {
  title: 'Signals/SignalExplainPanel',
  component: SignalExplainPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Scoring detail breakdown from `GET /api/tickers/:symbol/signal/explain/`. Features sorted by absolute contribution. Centre-origin bars make positive/negative contributions visually clear.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof SignalExplainPanel>

export const Bullish: Story = {
  args: {
    symbol: 'AAPL',
    entries,
    engineScore: 0.6234,
    inputSummary: '312 posts analysed over a 30-minute window. Dominant source: Reddit (42%). Alert flag: none. ML model v2.1.4.',
  },
}

export const Bearish: Story = {
  args: {
    symbol: 'META',
    entries: entries.map((e) => ({ ...e, score: -e.score * 0.8 })),
    engineScore: -0.4812,
  },
}

export const NoSummary: Story = {
  parameters: { docs: { description: { story: 'Without inputSummary — API may not always return it.' } } },
  args: {
    symbol: 'NVDA',
    entries: entries.slice(0, 3),
    engineScore: 0.33,
  },
}
