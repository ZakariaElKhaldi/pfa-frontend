import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { IntelligencePage } from './IntelligencePage'

const meta: Meta<typeof IntelligencePage> = {
  title: 'Pages/Intelligence',
  component: IntelligencePage,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof IntelligencePage>

export const Default: Story = {}
