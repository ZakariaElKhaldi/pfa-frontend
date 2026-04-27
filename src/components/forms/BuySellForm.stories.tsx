import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { BuySellForm } from './BuySellForm'

const meta: Meta<typeof BuySellForm> = {
  title: 'Forms/BuySellForm',
  component: BuySellForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Order entry form. Side toggle switches between buy (green) and sell (red). Live estimated total updates as qty × price. Calls `POST /api/portfolio/buy/` or `/sell/`.',
      },
    },
  },
  args: { onSubmit: fn() },
  decorators: [(Story) => <div style={{ width: 360, padding: 24, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)' }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof BuySellForm>

export const Buy: Story = {
  args: { defaultSide: 'buy' },
}

export const Sell: Story = {
  args: { defaultSide: 'sell' },
}

export const LockedTicker: Story = {
  parameters: { docs: { description: { story: 'When `symbol` is pre-populated the ticker field is read-only — used when opened from a ticker detail page.' } } },
  args: { symbol: 'AAPL', defaultSide: 'buy' },
}

export const Loading: Story = {
  args: { symbol: 'NVDA', loading: true },
}

export const WithError: Story = {
  args: { symbol: 'TSLA', error: 'Insufficient cash balance.' },
}
