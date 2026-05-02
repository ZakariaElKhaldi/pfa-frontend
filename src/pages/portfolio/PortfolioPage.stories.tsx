import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { PortfolioPagePreview } from './PortfolioPage'

const meta: Meta<typeof PortfolioPagePreview> = {
  title: 'Pages/Portfolio',
  component: PortfolioPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof PortfolioPagePreview>

export const Default: Story = {}
