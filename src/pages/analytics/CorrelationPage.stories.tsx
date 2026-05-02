import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { CorrelationPagePreview } from './CorrelationPage'

const meta: Meta<typeof CorrelationPagePreview> = {
  title: 'Pages/Analytics/Correlation',
  component: CorrelationPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof CorrelationPagePreview>

export const Default: Story = {}
