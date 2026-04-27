import type { Meta, StoryObj } from '@storybook/react-vite'
import { PortfolioSummaryCard } from './PortfolioSummaryCard'

const meta: Meta<typeof PortfolioSummaryCard> = {
  title: 'Portfolio/PortfolioSummaryCard',
  component: PortfolioSummaryCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Top-level portfolio KPI card. Maps `GET /api/portfolio/summary/` — `cash`, `total_value`, `pnl`. Positions count comes from a separate positions fetch.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof PortfolioSummaryCard>

export const Profitable: Story = {
  args: {
    cash: 24_350.00,
    totalValue: 128_450.00,
    pnl: 28_450.00,
    pnlPct: 28.45,
    positionCount: 7,
  },
}

export const Loss: Story = {
  args: {
    cash: 80_000.00,
    totalValue: 91_200.00,
    pnl: -8_800.00,
    pnlPct: -8.8,
    positionCount: 3,
  },
}

export const Flat: Story = {
  args: {
    cash: 100_000,
    totalValue: 100_000,
    pnl: 0,
    pnlPct: 0,
    positionCount: 0,
  },
}
