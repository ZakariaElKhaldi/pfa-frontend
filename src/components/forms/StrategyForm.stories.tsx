import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { StrategyForm } from './StrategyForm'

const meta: Meta<typeof StrategyForm> = {
  title: 'Forms/StrategyForm',
  component: StrategyForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Create or edit a trading strategy. Pairs with `POST /api/strategies/` and `PATCH /api/strategies/<pk>/`. Pure presentation — caller wires `onSubmit`, `loading`, and `error`.',
      },
    },
  },
  args: { onSubmit: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof StrategyForm>

export const Default: Story = {
  parameters: {
    docs: { description: { story: 'Blank form for creating a new strategy.' } },
  },
}

export const Loading: Story = {
  args: { loading: true },
}

export const WithError: Story = {
  args: { error: 'Strategy name already exists.' },
}

export const EditMode: Story = {
  args: {
    initial: {
      name: 'Bullish momentum play',
      desc: 'Fire when sentiment score and RSI both confirm upward pressure.',
      tickers: ['AAPL', 'NVDA'],
      conditions: [
        { field: 'sentiment_score', operator: 'gt', value: 0.65 },
        { field: 'rsi', operator: 'lt', value: 70 },
      ],
      actions: [
        { actionType: 'notify', target: undefined },
        { actionType: 'log', target: undefined },
      ],
    },
  },
  parameters: {
    docs: { description: { story: 'Pre-populated form for editing an existing strategy. Submit button reads "Update strategy".' } },
  },
}
