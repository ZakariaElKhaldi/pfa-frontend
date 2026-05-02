import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ConfirmDialog } from './ConfirmDialog'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Common/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof ConfirmDialog>

function Harness(args: Partial<React.ComponentProps<typeof ConfirmDialog>>) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <ConfirmDialog
        open={open}
        title={args.title ?? 'Confirm action'}
        description={args.description}
        confirmText={args.confirmText}
        cancelText={args.cancelText}
        destructive={args.destructive}
        loading={args.loading}
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}

export const Default: Story = {
  render: () => <Harness title="Save changes?" description="Your edits will be applied immediately." />,
}

export const Destructive: Story = {
  render: () => (
    <Harness
      title="Delete strategy?"
      description="This will permanently delete the strategy and all execution history. This action cannot be undone."
      confirmText="Delete"
      destructive
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <Harness
      title="Closing position…"
      description="Submitting sell order to the broker."
      confirmText="Close"
      loading
    />
  ),
}

export const SellTrade: Story = {
  render: () => (
    <Harness
      title="Sell 50 shares of AAPL?"
      description="Estimated proceeds: $9,471.00 at $189.42 / share."
      confirmText="Sell"
      destructive
    />
  ),
}
