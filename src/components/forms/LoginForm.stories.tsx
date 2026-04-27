import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { LoginForm } from './LoginForm'

const meta: Meta<typeof LoginForm> = {
  title: 'Forms/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Email + password login with optional OAuth (Google / GitHub). Pure presentation — caller wires `onSubmit`, `onOAuth`, `loading`, and `error` to the auth API.',
      },
    },
  },
  args: {
    onSubmit: fn(),
    onOAuth: fn(),
    onForgotPassword: fn(),
    onSwitchToRegister: fn(),
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

type Story = StoryObj<typeof LoginForm>

export const Default: Story = {}

export const WithoutOAuth: Story = {
  args: { onOAuth: undefined },
}

export const Loading: Story = {
  args: { loading: true },
}

export const WithError: Story = {
  args: { error: 'Invalid email or password.' },
}
