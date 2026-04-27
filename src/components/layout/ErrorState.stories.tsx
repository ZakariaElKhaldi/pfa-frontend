import type { Meta, StoryObj } from '@storybook/react-vite'

import { ErrorState } from './ErrorState'

const meta: Meta<typeof ErrorState> = {
  title: 'Layout/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ErrorState>

export const Default: Story = {
  args: { message: 'Failed to load market data. Please try again.' },
}

export const WithRetry: Story = {
  args: {
    title:   'Connection failed',
    message: 'Unable to reach the API server. Check your network and try again.',
    onRetry: () => {},
  },
}
