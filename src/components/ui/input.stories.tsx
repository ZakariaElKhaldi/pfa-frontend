import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Email address',
  },
}

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Email address',
    disabled: true,
  },
}

export const File: Story = {
  args: {
    type: 'file',
  },
}

export const WithLabelAndValidation: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Email
      </label>
      <Input type="email" id="email" placeholder="Email" />
      <p className="text-[0.8rem] text-muted-foreground">
        Enter your email address to continue.
      </p>
    </div>
  ),
}
