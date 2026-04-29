import type { Meta, StoryObj } from '@storybook/react-vite'
import { RegisterPagePreview } from './RegisterPage'

const meta: Meta<typeof RegisterPagePreview> = {
  title: 'Pages/Auth/RegisterPage',
  component: RegisterPagePreview,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof RegisterPagePreview>

export const Default: Story = {}

export const Loading: Story = {
  args: { loading: true },
}

export const WithError: Story = {
  args: { error: 'A user with that email already exists.' },
}
