import type { Meta, StoryObj } from '@storybook/react-vite'

import { PostCard } from './PostCard'

const meta: Meta<typeof PostCard> = {
  title: 'Cards/PostCard',
  component: PostCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A single social post in the sentiment feed. Renders source attribution, timestamp, body text, sentiment label, and a normalised score in [-1, 1]. Used in the Feed surface and embedded in ticker drill-downs.',
      },
    },
  },
  argTypes: {
    source: {
      description: 'Platform identifier. Drives the avatar initial and the per-source tint.',
      control: 'select',
      options: ['reddit', 'twitter', 'stocktwits', 'news'],
      table: { type: { summary: 'string' } },
    },
    sourceName: {
      description: 'Display handle as it appears on the source platform.',
      control: 'text',
    },
    time: {
      description: 'Relative timestamp string. Pre-formatted by the caller.',
      control: 'text',
    },
    content: {
      description: 'Post body. Single paragraph; long content wraps.',
      control: 'text',
    },
    label: {
      description: 'Categorical sentiment classification.',
      control: 'inline-radio',
      options: ['bullish', 'bearish', 'neutral'],
    },
    score: {
      description: 'Sentiment score in [-1, 1]. Sign indicates direction, magnitude indicates confidence.',
      control: { type: 'range', min: -1, max: 1, step: 0.01 },
    },
  },
}
export default meta

type Story = StoryObj<typeof PostCard>

export const Bullish: Story = {
  parameters: { docs: { description: { story: 'High-confidence positive sentiment from a retail community source.' } } },
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
  parameters: { docs: { description: { story: 'Negative score renders without the leading `+` and pairs with the bearish badge.' } } },
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
  parameters: { docs: { description: { story: 'Near-zero score from a wire-service source. Useful for verifying the neutral badge styling.' } } },
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
  parameters: { docs: { description: { story: 'Multi-character source key (`stocktwits`) — the avatar collapses to the initial so the circle never overflows.' } } },
  args: {
    source:     'stocktwits',
    sourceName: '@StockTwitsBull',
    time:       '3m ago',
    content:    'NVDA consolidating perfectly above the 800 level. Next leg up incoming — accumulating here.',
    label:      'bullish',
    score:      0.78,
  },
}

export const LongContent: Story = {
  parameters: { docs: { description: { story: 'Verifies wrapping behaviour when post body spans multiple lines.' } } },
  args: {
    source:     'reddit',
    sourceName: 'r/investing',
    time:       '12m ago',
    content:    'Long-form take on the semis cycle: capacity additions in Arizona and Texas come online over the next 18 months, but front-end demand from data-center build-outs is already absorbing forecasted supply. Watch lead times — they are the real signal.',
    label:      'bullish',
    score:      0.41,
  },
}

export const Feed: Story = {
  parameters: { docs: { description: { story: 'Cards stack vertically with consistent gutter. This is the canonical layout used in the Feed surface.' } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
      <PostCard source="reddit"     sourceName="r/wallstreetbets" time="2m ago"  content="AAPL to the moon! Earnings beat by 12%."             label="bullish" score={0.87} />
      <PostCard source="twitter"    sourceName="@MarketBear"      time="5m ago"  content="META ad revenue slowing. Short term pain ahead."     label="bearish" score={-0.73} />
      <PostCard source="stocktwits" sourceName="@StockTwitsBull"  time="8m ago"  content="NVDA consolidating above 800. Next leg up incoming." label="bullish" score={0.78} />
      <PostCard source="news"       sourceName="Reuters"          time="1h ago"  content="Federal Reserve holds rates steady at 5.25%."        label="neutral" score={0.02} />
    </div>
  ),
}
