import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { TickersPage } from './TickersPage'

const meta: Meta<typeof TickersPage> = {
  title: 'Pages/Tickers',
  component: TickersPage,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof TickersPage>

export const Default: Story = {}
