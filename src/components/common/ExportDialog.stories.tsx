import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ExportDialog } from './ExportDialog'

const meta: Meta<typeof ExportDialog> = {
  title: 'Common/ExportDialog',
  component: ExportDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Data export configurator. Maps `GET /api/export/:symbol/`, `/api/export/signals/`, `/api/export/portfolio/`. Format toggle (JSON/CSV), include checkboxes, date-range picker. Rate-limited 5/min on the backend.',
      },
    },
  },
  args: { onExport: fn(), onCancel: fn() },
}
export default meta

type Story = StoryObj<typeof ExportDialog>

export const Default: Story = {}

export const LockedTicker: Story = {
  parameters: { docs: { description: { story: 'Pre-populated ticker — used from a ticker detail page.' } } },
  args: { symbol: 'AAPL' },
}

export const Loading: Story = {
  args: { symbol: 'NVDA', loading: true },
}
