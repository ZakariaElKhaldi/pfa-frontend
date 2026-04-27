import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { WatchlistStarButton } from './WatchlistStarButton'

const meta: Meta<typeof WatchlistStarButton> = {
  title: 'Common/WatchlistStarButton',
  component: WatchlistStarButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Star toggle for watchlist add/remove. Active state fills the star with the warning colour. Maps `POST /api/watchlist/` (add) and `DELETE /api/watchlist/:symbol/` (remove).',
      },
    },
  },
  args: { onToggle: fn() },
}
export default meta

type Story = StoryObj<typeof WatchlistStarButton>

export const Active: Story = {
  args: { active: true, symbol: 'AAPL', size: 'md' },
}

export const Inactive: Story = {
  args: { active: false, symbol: 'AAPL', size: 'md' },
}

export const Small: Story = {
  args: { active: true, symbol: 'NVDA', size: 'sm' },
}

export const Loading: Story = {
  args: { active: false, symbol: 'META', loading: true },
}

export const InContext: Story = {
  parameters: { docs: { description: { story: 'Star button alongside a ticker card heading — typical inline usage.' } } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 'var(--text-headline-sm)', color: 'var(--on-surface)' }}>
        AAPL
      </span>
      <WatchlistStarButton active symbol="AAPL" onToggle={() => {}} />
    </div>
  ),
}
