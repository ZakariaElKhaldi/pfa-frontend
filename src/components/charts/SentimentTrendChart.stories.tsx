import type { Meta, StoryObj } from '@storybook/react-vite'
import { SentimentTrendChart } from './SentimentTrendChart'
import type { SentimentPoint } from './SentimentTrendChart'

const BULLISH_TREND: SentimentPoint[] = [
  { time: 'Day 1',  bullish: 0.20, bearish: -0.10, neutral:  0.05 },
  { time: 'Day 2',  bullish: 0.28, bearish: -0.12, neutral:  0.03 },
  { time: 'Day 3',  bullish: 0.35, bearish: -0.11, neutral:  0.06 },
  { time: 'Day 4',  bullish: 0.42, bearish: -0.09, neutral:  0.02 },
  { time: 'Day 5',  bullish: 0.50, bearish: -0.10, neutral:  0.04 },
  { time: 'Day 6',  bullish: 0.57, bearish: -0.08, neutral:  0.01 },
  { time: 'Day 7',  bullish: 0.63, bearish: -0.11, neutral:  0.05 },
  { time: 'Day 8',  bullish: 0.68, bearish: -0.09, neutral:  0.03 },
  { time: 'Day 9',  bullish: 0.73, bearish: -0.10, neutral:  0.02 },
  { time: 'Day 10', bullish: 0.80, bearish: -0.10, neutral:  0.04 },
]

const BEARISH_TREND: SentimentPoint[] = [
  { time: 'Day 1',  bullish: 0.10, bearish: -0.10, neutral:  0.02 },
  { time: 'Day 2',  bullish: 0.09, bearish: -0.18, neutral:  0.03 },
  { time: 'Day 3',  bullish: 0.11, bearish: -0.26, neutral:  0.01 },
  { time: 'Day 4',  bullish: 0.10, bearish: -0.34, neutral:  0.04 },
  { time: 'Day 5',  bullish: 0.08, bearish: -0.42, neutral:  0.02 },
  { time: 'Day 6',  bullish: 0.09, bearish: -0.50, neutral:  0.03 },
  { time: 'Day 7',  bullish: 0.10, bearish: -0.57, neutral:  0.01 },
  { time: 'Day 8',  bullish: 0.08, bearish: -0.63, neutral:  0.02 },
  { time: 'Day 9',  bullish: 0.09, bearish: -0.66, neutral:  0.04 },
  { time: 'Day 10', bullish: 0.10, bearish: -0.70, neutral:  0.01 },
]

const MIXED_TREND: SentimentPoint[] = [
  { time: 'Day 1',  bullish: 0.60, bearish: -0.15, neutral:  0.05 },
  { time: 'Day 2',  bullish: 0.20, bearish: -0.55, neutral:  0.03 },
  { time: 'Day 3',  bullish: 0.65, bearish: -0.10, neutral:  0.06 },
  { time: 'Day 4',  bullish: 0.15, bearish: -0.60, neutral:  0.02 },
  { time: 'Day 5',  bullish: 0.70, bearish: -0.12, neutral:  0.04 },
  { time: 'Day 6',  bullish: 0.18, bearish: -0.58, neutral:  0.03 },
  { time: 'Day 7',  bullish: 0.62, bearish: -0.14, neutral:  0.05 },
  { time: 'Day 8',  bullish: 0.22, bearish: -0.52, neutral:  0.02 },
]

const TWO_WEEKS: SentimentPoint[] = [
  { time: 'Apr 14', bullish: 0.30, bearish: -0.20, neutral:  0.05 },
  { time: 'Apr 15', bullish: 0.38, bearish: -0.18, neutral:  0.03 },
  { time: 'Apr 16', bullish: 0.35, bearish: -0.25, neutral:  0.06 },
  { time: 'Apr 17', bullish: 0.50, bearish: -0.15, neutral:  0.02 },
  { time: 'Apr 18', bullish: 0.45, bearish: -0.22, neutral:  0.04 },
  { time: 'Apr 21', bullish: 0.60, bearish: -0.10, neutral:  0.01 },
  { time: 'Apr 22', bullish: 0.55, bearish: -0.18, neutral:  0.05 },
  { time: 'Apr 23', bullish: 0.48, bearish: -0.30, neutral:  0.03 },
  { time: 'Apr 24', bullish: 0.62, bearish: -0.12, neutral:  0.02 },
  { time: 'Apr 25', bullish: 0.70, bearish: -0.08, neutral:  0.04 },
  { time: 'Apr 28', bullish: 0.65, bearish: -0.14, neutral:  0.03 },
  { time: 'Apr 29', bullish: 0.72, bearish: -0.09, neutral:  0.01 },
  { time: 'Apr 30', bullish: 0.68, bearish: -0.11, neutral:  0.05 },
  { time: 'May 1',  bullish: 0.75, bearish: -0.07, neutral:  0.02 },
]

const meta: Meta<typeof SentimentTrendChart> = {
  title: 'Charts/SentimentTrendChart',
  component: SentimentTrendChart,
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'number', min: 100, max: 400, step: 20 } },
  },
}
export default meta

type Story = StoryObj<typeof SentimentTrendChart>

export const TwoWeeks: Story = {
  args: { data: TWO_WEEKS },
}

export const BullishTrend: Story = {
  args: { data: BULLISH_TREND },
}

export const BearishTrend: Story = {
  args: { data: BEARISH_TREND },
}

export const Mixed: Story = {
  args: { data: MIXED_TREND },
}

export const SinglePoint: Story = {
  args: { data: [{ time: 'Day 1', bullish: 0.55, bearish: -0.20, neutral: 0.05 }] },
}

export const Empty: Story = {
  args: { data: [] },
}
