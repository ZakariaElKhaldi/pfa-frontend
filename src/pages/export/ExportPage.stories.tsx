import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { ExportPage } from './ExportPage'

const meta: Meta<typeof ExportPage> = {
  title: 'Pages/Export',
  component: ExportPage,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof ExportPage>

export const Default: Story = {}
