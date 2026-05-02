import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { AlertsPagePreview } from './AlertsPage'

const meta: Meta<typeof AlertsPagePreview> = {
  title: 'Pages/Alerts',
  component: AlertsPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AlertsPagePreview>

export const Default: Story = {}

export const AllActive: Story = {
  args: {
    alerts: [
      { id: 1, ticker_symbol: 'TSLA', type: 'divergence',        sentiment: -0.71, momentum: 0.12, consistency: 0.18, resolved: false },
      { id: 2, ticker_symbol: 'NVDA', type: 'extreme_sentiment', sentiment: 0.88,  momentum: 0.74, consistency: 0.22, resolved: false },
      { id: 3, ticker_symbol: 'AMC',  type: 'pump_suspected',    sentiment: 0.95,  momentum: 0.91, consistency: 0.05, resolved: false },
    ],
  },
}

export const AllClear: Story = {
  args: { alerts: [] },
}
