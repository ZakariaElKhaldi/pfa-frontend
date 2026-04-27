import type { Meta, StoryObj } from '@storybook/react-vite'
import { SentimentSummaryCard } from './SentimentSummaryCard'

const meta: Meta<typeof SentimentSummaryCard> = {
  title: 'Social/SentimentSummaryCard',
  component: SentimentSummaryCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Per-ticker aggregate sentiment card. Maps `GET /api/tickers/:symbol/social/sentiment/`. Segmented bar visualises bull/neutral/bear post distribution.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 340 }}><Story /></div>],
  argTypes: {
    score: { control: { type: 'range', min: -1, max: 1, step: 0.001 } },
    label: { control: 'inline-radio', options: ['bullish', 'bearish', 'neutral'] },
  },
}
export default meta

type Story = StoryObj<typeof SentimentSummaryCard>

export const Bullish: Story = {
  args: {
    symbol: 'AAPL', label: 'bullish', score: 0.743,
    postCount: 1820, bullishCount: 1310, neutralCount: 340, bearishCount: 170,
  },
}

export const Bearish: Story = {
  args: {
    symbol: 'META', label: 'bearish', score: -0.562,
    postCount: 940, bullishCount: 150, neutralCount: 220, bearishCount: 570,
  },
}

export const Neutral: Story = {
  args: {
    symbol: 'GOOG', label: 'neutral', score: 0.04,
    postCount: 430, bullishCount: 195, neutralCount: 150, bearishCount: 85,
  },
}
