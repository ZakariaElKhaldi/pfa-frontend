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

export const Stocktwits: Story = {
  args: {
    source:     'stocktwits',
    sourceName: '@StockTwitsBull',
    time:       '3m ago',
    content:    'NVDA consolidating perfectly above the 800 level. Next leg up incoming — accumulating here.',
    label:      'bullish',
    score:      0.78,
  },
}

export const Feed: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
      <PostCard source="reddit"     sourceName="r/wallstreetbets" time="2m ago"  content="AAPL to the moon! Earnings beat by 12%."                       label="bullish" score={0.87} />
      <PostCard source="twitter"    sourceName="@MarketBear"      time="5m ago"  content="META ad revenue slowing. Short term pain ahead."               label="bearish" score={-0.73} />
      <PostCard source="stocktwits" sourceName="@StockTwitsBull"  time="8m ago"  content="NVDA consolidating above 800. Next leg up incoming."            label="bullish" score={0.78} />
      <PostCard source="news"       sourceName="Reuters"           time="1h ago"  content="Federal Reserve holds rates steady at 5.25%."                   label="neutral" score={0.02} />
    </div>
  ),
}
