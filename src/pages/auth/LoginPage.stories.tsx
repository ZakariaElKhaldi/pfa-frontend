import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoginPagePreview } from './LoginPage'

const meta: Meta<typeof LoginPagePreview> = {
  title: 'Pages/Auth/LoginPage',
  component: LoginPagePreview,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof LoginPagePreview>

export const Default: Story = {}

export const Loading: Story = {
  args: { loading: true },
}

export const WithError: Story = {
  args: { error: 'Invalid email or password.' },
}
