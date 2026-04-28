import type { Meta, StoryObj } from '@storybook/react-vite'
import { SignalDistributionChart } from './SignalDistributionChart'
import type { SignalDistPoint }     from './SignalDistributionChart'

const meta: Meta<typeof SignalDistributionChart> = {
  title: 'Charts/SignalDistributionChart',
  component: SignalDistributionChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Stacked bar chart showing BUY / HOLD / SELL signal counts per time bucket. ' +
          'Toggle between absolute count (#) and proportional (%) view. ' +
          'Caller groups `SignalSnapshot[]` from `GET /api/tickers/<symbol>/signal/history/` into time buckets before passing.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 680, padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof SignalDistributionChart>

// ── data helpers ──────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

function balanced(): SignalDistPoint[] {
  return MONTHS.map(m => ({
    label: m,
    buy:   Math.round(12 + Math.random() * 8),
    hold:  Math.round(8  + Math.random() * 6),
    sell:  Math.round(6  + Math.random() * 8),
  }))
}

function buyHeavy(): SignalDistPoint[] {
  return MONTHS.map(m => ({
    label: m,
    buy:   Math.round(20 + Math.random() * 10),
    hold:  Math.round(5  + Math.random() * 4),
    sell:  Math.round(3  + Math.random() * 4),
  }))
}

function bearMarket(): SignalDistPoint[] {
  return MONTHS.map(m => ({
    label: m,
    buy:   Math.round(4  + Math.random() * 4),
    hold:  Math.round(7  + Math.random() * 5),
    sell:  Math.round(18 + Math.random() * 10),
  }))
}

function sideways(): SignalDistPoint[] {
  return MONTHS.map(m => ({
    label: m,
    buy:   Math.round(8 + Math.random() * 4),
    hold:  Math.round(18 + Math.random() * 8),
    sell:  Math.round(7  + Math.random() * 4),
  }))
}

// ── stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { data: balanced() },
  parameters: {
    docs: { description: { story: 'Balanced market — roughly equal BUY/HOLD/SELL distribution.' } },
  },
}

export const BullMarket: Story = {
  args: { data: buyHeavy() },
  parameters: {
    docs: { description: { story: 'Strong bull market — BUY signals dominate. Stack top is mostly green.' } },
  },
}

export const BearMarket: Story = {
  args: { data: bearMarket() },
  parameters: {
    docs: { description: { story: 'Bear market — SELL signals dominate. Stack is mostly red.' } },
  },
}

export const SidewaysMarket: Story = {
  args: { data: sideways() },
  parameters: {
    docs: { description: { story: 'Range-bound market — HOLD signals dominate (indecisive model output).' } },
  },
}

export const PercentView: Story = {
  args: { data: balanced(), defaultMode: 'percent' },
  parameters: {
    docs: { description: { story: 'Proportional view — each bar sums to 100%, making signal-mix comparison easier across periods.' } },
  },
}

export const Empty: Story = {
  args: { data: [] },
  parameters: {
    docs: { description: { story: 'Empty state when no signal history is available.' } },
  },
}
