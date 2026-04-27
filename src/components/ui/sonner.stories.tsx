import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'

import { Toaster } from './sonner'
import { Button } from './button'

// Note: Toaster component is typically placed once in the app root.
// For Storybook, we place it in the render function alongside a trigger.

const meta: Meta<typeof Toaster> = {
  title: 'UI/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[200px] flex items-center justify-center">
        <Story />
        <Toaster position="bottom-right" />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Toaster>

export const Default: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
  ),
}

export const Success: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.success("Configuration saved successfully")}
    >
      Show Success Toasts
    </Button>
  ),
}

export const Error: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.error("Failed to save changes. Please try again.")}
    >
      Show Error Toast
    </Button>
  ),
}
