import type { Meta, StoryObj } from '@storybook/react-vite'

import { PostCard } from './PostCard'

const meta: Meta<typeof PostCard> = {
  title: 'Cards/PostCard',
  component: PostCard,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof PostCard>

export const Bullish: Story = {
  args: {
    source:     'reddit',
    sourceName: 'r/wallstreetbets',
    time:       '2m ago',
    content:    'AAPL to the moon! Earnings beat expectations by 12%. Options chain going wild.',
    label:      'bullish',
    score:      0.87,
  },
}

export const Bearish: Story = {
  args: {
    source:     'twitter',
    sourceName: '@MarketBear',
    time:       '5m ago',
    content:    'META ad revenue growth slowing. Competition from TikTok intensifying. Short term pain ahead.',
    label:      'bearish',
    score:      -0.73,
  },
}

export const Neutral: Story = {
  args: {
    source:     'news',
    sourceName: 'Reuters',
    time:       '1h ago',
    content:    'Federal Reserve holds rates steady at 5.25%. Next meeting scheduled in six weeks.',
    label:      'neutral',
    score:      0.02,
  },
}
