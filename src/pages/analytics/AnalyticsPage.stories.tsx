import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { AnalyticsPagePreview } from './AnalyticsPage'

const meta: Meta<typeof AnalyticsPagePreview> = {
  title: 'Pages/Analytics',
  component: AnalyticsPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AnalyticsPagePreview>

export const Default: Story = {}
