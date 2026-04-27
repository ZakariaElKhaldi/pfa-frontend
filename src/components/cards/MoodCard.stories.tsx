import type { Meta, StoryObj } from '@storybook/react-vite'

import { MoodCard } from './MoodCard'
import type { Mood } from '@/components/design-system/MoodBadge'

const meta: Meta<typeof MoodCard> = {
  title: 'Cards/MoodCard',
  component: MoodCard,
  tags: ['autodocs'],
  argTypes: {
    mood: { control: 'radio', options: ['bullish', 'bearish', 'uncertain', 'euphoric', 'panic'] satisfies Mood[] },
    confidence: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
  },
}
export default meta

type Story = StoryObj<typeof MoodCard>

export const Bullish: Story = {
  args: { symbol: 'AAPL', mood: 'bullish', confidence: 0.82, windowStart: 'Apr 20', windowEnd: 'Apr 27' },
}

export const Bearish: Story = {
  args: { symbol: 'META', mood: 'bearish', confidence: 0.76, windowStart: 'Apr 20', windowEnd: 'Apr 27' },
}

export const Euphoric: Story = {
  args: { symbol: 'GME', mood: 'euphoric', confidence: 0.94, windowStart: 'Apr 25', windowEnd: 'Apr 27' },
}

export const Panic: Story = {
  args: { symbol: 'NVDA', mood: 'panic', confidence: 0.88, windowStart: 'Apr 24', windowEnd: 'Apr 27' },
}

export const Uncertain: Story = {
  args: { symbol: 'TSLA', mood: 'uncertain', confidence: 0.51, windowStart: 'Apr 20', windowEnd: 'Apr 27' },
}
