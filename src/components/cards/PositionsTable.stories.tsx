import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { PositionsTable } from './PositionsTable'

const positions = [
  { symbol: 'AAPL', name: 'Apple Inc.',           quantity: 50,  avgPrice: 175.20, lastPrice: 189.84 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.',          quantity: 20,  avgPrice: 720.00, lastPrice: 875.30 },
  { symbol: 'META', name: 'Meta Platforms Inc.',   quantity: 15,  avgPrice: 490.50, lastPrice: 472.15 },
  { symbol: 'TSLA', name: 'Tesla Inc.',            quantity: 30,  avgPrice: 220.00, lastPrice: 178.40 },
]

const meta: Meta<typeof PositionsTable> = {
  title: 'Portfolio/PositionsTable',
  component: PositionsTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Open positions table. Derives market value and P&L on the fly from `quantity × (lastPrice - avgPrice)`. Data from `GET /api/portfolio/`. Optional `onSell` wires up the Sell CTA per row.',
      },
    },
  },
  args: { onSell: fn() },
}
export default meta

type Story = StoryObj<typeof PositionsTable>

export const WithPositions: Story = {
  args: { positions },
}

export const WithSell: Story = {
  parameters: { docs: { description: { story: 'With per-row Sell button.' } } },
  args: { positions, onSell: fn() },
}

export const Empty: Story = {
  args: { positions: [] },
}
