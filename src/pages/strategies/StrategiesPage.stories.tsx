import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { StrategiesPagePreview } from './StrategiesPage'

const meta: Meta<typeof StrategiesPagePreview> = {
  title: 'Pages/Strategies',
  component: StrategiesPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof StrategiesPagePreview>

export const Default: Story = {}
