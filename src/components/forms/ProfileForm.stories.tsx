import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { ProfileForm } from './ProfileForm'

const meta: Meta<typeof ProfileForm> = {
  title: 'Forms/ProfileForm',
  component: ProfileForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Edit-in-place profile form. Submit + Reset are disabled until the form is dirty. Pair with PATCH `/api/auth/user/`.',
      },
    },
  },
  args: { onSubmit: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ProfileForm>

const baseInitial = {
  username: 'zakaria',
  email: 'zakaria@crowdsignal.dev',
  firstName: 'Zakaria',
  lastName: 'El Khaldi',
}

export const Default: Story = {
  args: { initial: baseInitial },
}

export const Empty: Story = {
  args: { initial: { username: '', email: '', firstName: '', lastName: '' } },
}

export const Loading: Story = {
  args: { initial: baseInitial, loading: true },
}

export const Saved: Story = {
  args: { initial: baseInitial, success: 'Profile updated.' },
}

export const WithError: Story = {
  args: { initial: baseInitial, error: 'Email is already in use.' },
}
