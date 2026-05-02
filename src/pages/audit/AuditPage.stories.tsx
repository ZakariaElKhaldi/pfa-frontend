import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { AuditPagePreview } from './AuditPage'

const meta: Meta<typeof AuditPagePreview> = {
  title: 'Pages/Audit',
  component: AuditPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AuditPagePreview>

export const Default: Story = {}
