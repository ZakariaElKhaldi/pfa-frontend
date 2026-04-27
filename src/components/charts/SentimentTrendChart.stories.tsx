import type { Meta, StoryObj } from '@storybook/react-vite'

import { SentimentTrendChart } from './SentimentTrendChart'
import type { SentimentPoint } from './SentimentTrendChart'

function makeSentiment(n: number): SentimentPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    time:    `Day ${i + 1}`,
    bullish:  Math.random() * 0.8,
    bearish: -Math.random() * 0.5,
    neutral:  (Math.random() - 0.5) * 0.2,
  }))
}

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

export const Default: Story = {
  args: { data: makeSentiment(14) },
}

export const Empty: Story = {
  args: { data: [] },
}
