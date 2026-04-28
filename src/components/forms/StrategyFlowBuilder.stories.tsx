import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { StrategyFlowBuilder } from './StrategyFlow'

const meta: Meta<typeof StrategyFlowBuilder> = {
  title: 'Forms/StrategyFlowBuilder',
  component: StrategyFlowBuilder,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Visual node-based logic builder for trading strategies using React Flow. Replaces the old linear form.',
      },
    },
  },
  args: { onSubmit: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', minWidth: 800 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof StrategyFlowBuilder>

export const Empty: Story = {
  parameters: {
    docs: { description: { story: 'Blank flow canvas. The Trigger node is always present as the root.' } },
  },
}

export const SimpleStrategy: Story = {
  args: {
    initial: {
      name: 'RSI Reversal',
      desc: 'Buy when RSI drops below 30',
      tickers: ['AAPL', 'MSFT'],
      conditions: [
        { field: 'rsi', operator: 'lt', value: '30' },
      ],
      actions: [
        { actionType: 'notify', target: undefined },
      ],
    },
  },
}

export const ComplexStrategy: Story = {
  args: {
    initial: {
      name: 'Bullish Momentum Confirmation',
      desc: 'Requires strong sentiment AND upward price action.',
      tickers: ['NVDA', 'TSLA', 'AMD'],
      conditions: [
        { field: 'sentiment_score', operator: 'gt', value: '0.65' },
        { field: 'sma_20', operator: 'crosses_above', value: 'ema_50' },
        { field: 'volume_change', operator: 'gt', value: '1.5' },
      ],
      actions: [
        { actionType: 'webhook', target: 'https://api.example.com/trade' },
        { actionType: 'notify', target: 'trader@example.com' },
      ],
    },
  },
  parameters: {
    docs: { description: { story: 'A complex strategy demonstrating linear serialization of multiple conditions and actions.' } },
  },
}

export const WithError: Story = {
  args: {
    error: 'Failed to save strategy: Network error',
    initial: {
      name: 'Test',
      desc: '',
      tickers: ['BTC'],
      conditions: [{ field: 'price', operator: 'gt', value: '100000' }],
      actions: [{ actionType: 'log' }],
    },
  },
}
