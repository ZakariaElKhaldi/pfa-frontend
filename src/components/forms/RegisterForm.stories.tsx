import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { RegisterForm } from './RegisterForm'

const meta: Meta<typeof RegisterForm> = {
  title: 'Forms/RegisterForm',
  component: RegisterForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Account registration form. Performs inline password-match validation; defers all server-side validation to the backend via `error`.',
      },
    },
  },
  args: {
    onSubmit: fn(),
    onOAuth: fn(),
    onSwitchToLogin: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof RegisterForm>

export const Default: Story = {}

export const Loading: Story = {
  args: { loading: true },
}

export const WithError: Story = {
  args: { error: 'A user with that email already exists.' },
}
