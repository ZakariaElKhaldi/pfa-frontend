import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { HeatmapPagePreview } from './HeatmapPage'

const meta: Meta<typeof HeatmapPagePreview> = {
  title: 'Pages/Analytics/Heatmap',
  component: HeatmapPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof HeatmapPagePreview>

export const Default: Story = {}
