import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { CorrelationPage } from './CorrelationPage'

const meta: Meta<typeof CorrelationPage> = {
  title: 'Pages/Analytics/Correlation',
  component: CorrelationPage,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof CorrelationPage>

export const Default: Story = {}
