import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { TickersPagePreview } from './TickersPage'

const meta: Meta<typeof TickersPagePreview> = {
  title: 'Pages/Tickers',
  component: TickersPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof TickersPagePreview>

export const Default: Story = {}

export const NoneWatched: Story = {
  args: { watchlist: [] },
}

export const Empty: Story = {
  args: { tickers: [] },
}
