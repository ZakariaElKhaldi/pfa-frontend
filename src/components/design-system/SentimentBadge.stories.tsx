import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { SentimentBadge } from './SentimentBadge'

const meta: Meta<typeof SentimentBadge> = {
  title: 'Design System/SentimentBadge',
  component: SentimentBadge,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'radio', options: ['bullish', 'bearish', 'neutral'] },
  },
}
export default meta

type Story = StoryObj<typeof SentimentBadge>

export const Bullish: Story = { args: { label: 'bullish' } }
export const Bearish: Story = { args: { label: 'bearish' } }
export const Neutral: Story = { args: { label: 'neutral' } }

export const AllLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <SentimentBadge label="bullish" />
      <SentimentBadge label="bearish" />
      <SentimentBadge label="neutral" />
    </div>
  ),
}
