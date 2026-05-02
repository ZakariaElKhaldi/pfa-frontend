import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { StrategyDetailPagePreview } from './StrategyDetailPage'

const meta: Meta<typeof StrategyDetailPagePreview> = {
  title: 'Pages/StrategyDetail',
  component: StrategyDetailPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof StrategyDetailPagePreview>

export const Default: Story = {}
export const AltStrategy: Story = { args: { id: '2' } }
