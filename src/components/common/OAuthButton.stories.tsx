import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { OAuthButton } from './OAuthButton'

const meta: Meta<typeof OAuthButton> = {
  title: 'Common/OAuthButton',
  component: OAuthButton,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
  },
  decorators: [Story => <div style={{ maxWidth: 360, padding: 16 }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof OAuthButton>

export const Default: Story = {
  args: { provider: 'google' },
}

export const Loading: Story = {
  args: { provider: 'google', loading: true },
}
