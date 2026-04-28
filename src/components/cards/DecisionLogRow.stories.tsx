import type { Meta, StoryObj } from '@storybook/react-vite'

import { DecisionLogRow } from './DecisionLogRow'

const meta: Meta<typeof DecisionLogRow> = {
  title: 'Cards/DecisionLogRow',
  component: DecisionLogRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Collapsible audit row for a single DecisionLog entry. Maps to `GET /api/audit/decisions/` (admin only). Click to expand scoring + engine output JSON.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof DecisionLogRow>

const baseArgs = {
  id: 1,
  ticker: 'AAPL',
  timestamp: '2026-04-28 14:32:07',
  inputSummary: 'bullish_ratio=0.72, normalized_index=0.618, rsi=58.3, post_count=142',
  scoringDetail: {
    sentiment_weight: 0.4,
    momentum_weight: 0.3,
    consistency_weight: 0.2,
    source_diversity_weight: 0.1,
    raw_scores: { sentiment: 0.72, momentum: 0.61, consistency: 0.55, source_diversity: 0.8 },
    weighted_total: 0.662,
  },
  engineOutput: {
    signal: 'buy',
    prediction_method: 'ml',
    prediction_confidence: 0.84,
    model_version: 'v2.3.1',
    threshold_used: 0.6,
  },
  alertsTriggered: [],
}

export const Default: Story = {
  args: baseArgs,
  parameters: {
    docs: { description: { story: 'Collapsed state — shows ticker, timestamp, and truncated input summary.' } },
  },
}

export const WithAlerts: Story = {
  args: {
    ...baseArgs,
    id: 2,
    ticker: 'GME',
    inputSummary: 'bullish_ratio=0.91, normalized_index=0.95, volume_change=+340%',
    alertsTriggered: ['pump_suspected', 'extreme_sentiment'],
    engineOutput: {
      signal: 'sell',
      prediction_method: 'rule_based',
      prediction_confidence: 0.91,
      override_reason: 'manipulation_flag_active',
    },
  },
  parameters: {
    docs: { description: { story: 'Row with two alerts triggered — badge shows count in red.' } },
  },
}

export const BearishDecision: Story = {
  args: {
    ...baseArgs,
    id: 3,
    ticker: 'TSLA',
    timestamp: '2026-04-28 09:01:45',
    inputSummary: 'bullish_ratio=0.31, normalized_index=0.22, sentiment=bearish, post_count=89',
    scoringDetail: {
      weighted_total: 0.29,
      raw_scores: { sentiment: 0.31, momentum: 0.25, consistency: 0.28, source_diversity: 0.6 },
    },
    engineOutput: { signal: 'sell', prediction_method: 'ml', prediction_confidence: 0.76 },
    alertsTriggered: ['divergence'],
  },
}

export const MultipleRows: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <DecisionLogRow {...baseArgs as any} />
      <DecisionLogRow
        id={2}
        ticker="GME"
        timestamp="2026-04-28 13:15:22"
        inputSummary="bullish_ratio=0.91, extreme momentum, volume spike"
        scoringDetail={{ weighted_total: 0.91 }}
        engineOutput={{ signal: 'hold', prediction_confidence: 0.55 }}
        alertsTriggered={['pump_suspected', 'extreme_sentiment']}
      />
      <DecisionLogRow
        id={3}
        ticker="TSLA"
        timestamp="2026-04-28 09:01:45"
        inputSummary="bullish_ratio=0.31, bearish divergence"
        scoringDetail={{ weighted_total: 0.29 }}
        engineOutput={{ signal: 'sell', prediction_confidence: 0.76 }}
        alertsTriggered={['divergence']}
      />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'Typical audit list — multiple rows, each independently collapsible.' } },
  },
}
