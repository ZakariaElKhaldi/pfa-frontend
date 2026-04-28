import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlobalAccuracyCard } from './GlobalAccuracyCard'

const meta: Meta<typeof GlobalAccuracyCard> = {
  title: 'Admin/GlobalAccuracyCard',
  component: GlobalAccuracyCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Platform-wide signal accuracy summary. Maps to `GET /api/signals/accuracy/global/`. Shows overall 24-hour accuracy ring plus per-signal (BUY/SELL/HOLD) bar breakdown.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof GlobalAccuracyCard>

export const Default: Story = {
  args: {
    overallPct:     74.3,
    bySignal:       { BUY: 81.2, SELL: 68.0, HOLD: 71.5 },
    totalEvaluated: 320,
  },
}

export const HighAccuracy: Story = {
  args: {
    overallPct:     91.0,
    bySignal:       { BUY: 93.1, SELL: 88.7, HOLD: 90.5 },
    totalEvaluated: 1240,
  },
}

export const LowAccuracy: Story = {
  args: {
    overallPct:     51.2,
    bySignal:       { BUY: 55.0, SELL: 47.1, HOLD: 52.0 },
    totalEvaluated: 88,
  },
}

export const NoData: Story = {
  args: {
    overallPct:     null,
    bySignal:       {},
    totalEvaluated: 0,
  },
  parameters: { docs: { description: { story: 'Empty state — shown before any signals have been evaluated.' } } },
}

export const PartialSignals: Story = {
  args: {
    overallPct:     68.5,
    bySignal:       { BUY: 72.0 },
    totalEvaluated: 45,
  },
  parameters: { docs: { description: { story: 'Only BUY signals evaluated so far.' } } },
}
