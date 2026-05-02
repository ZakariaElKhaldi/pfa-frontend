import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { ExportPagePreview } from './ExportPage'

const meta: Meta<typeof ExportPagePreview> = {
  title: 'Pages/Export',
  component: ExportPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof ExportPagePreview>

export const Default: Story = {}
export const Loading: Story = { args: { loading: true } }
