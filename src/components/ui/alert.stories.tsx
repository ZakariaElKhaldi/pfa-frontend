import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertTriangle, Terminal } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle, AlertAction } from './alert'
import { Button } from './button'

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>
        A new version of the application is ready to install.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">Install</Button>
      </AlertAction>
    </Alert>
  ),
}
