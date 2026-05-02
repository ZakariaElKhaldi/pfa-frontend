import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { IntelligencePagePreview } from './IntelligencePage'

const meta: Meta<typeof IntelligencePagePreview> = {
  title: 'Pages/Intelligence',
  component: IntelligencePagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof IntelligencePagePreview>

export const Default: Story = {}
