import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { AnalyticsPage } from './AnalyticsPage'

const meta: Meta<typeof AnalyticsPage> = {
  title: 'Pages/Analytics',
  component: AnalyticsPage,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AnalyticsPage>

export const Default: Story = {}
