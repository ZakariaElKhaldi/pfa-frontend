import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { BacktestPagePreview } from './BacktestPage'

const meta: Meta<typeof BacktestPagePreview> = {
  title: 'Pages/Analytics/Backtest',
  component: BacktestPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof BacktestPagePreview>

export const Default: Story = {}
