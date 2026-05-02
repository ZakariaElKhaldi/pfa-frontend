import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { TickerDetailPagePreview } from './TickerDetailPage'

const meta: Meta<typeof TickerDetailPagePreview> = {
  title: 'Pages/TickerDetail',
  component: TickerDetailPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof TickerDetailPagePreview>

export const AAPL: Story = { args: { symbol: 'AAPL' } }
export const TSLA: Story = { args: { symbol: 'TSLA' } }
