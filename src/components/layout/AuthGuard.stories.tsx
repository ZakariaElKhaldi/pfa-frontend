import type { Meta, StoryObj } from '@storybook/react-vite'
import { AuthGuard } from './AuthGuard'

const meta: Meta<typeof AuthGuard> = {
  title: 'Layout/AuthGuard',
  component: AuthGuard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AuthGuard>

export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
    children: <span className="badge badge-success">Authenticated content</span>,
    fallback: <span className="badge">Login required</span>,
  },
}

export const Unauthenticated: Story = {
  args: {
    isAuthenticated: false,
    children: <span className="badge badge-success">Authenticated content</span>,
    fallback: <span className="badge">Login required</span>,
  },
}

export const UnauthenticatedNoFallback: Story = {
  args: {
    isAuthenticated: false,
    children: <span className="badge badge-success">Authenticated content</span>,
  },
}
