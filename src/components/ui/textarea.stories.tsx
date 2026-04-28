import type { Meta, StoryObj } from '@storybook/react-vite'

import { Textarea } from './textarea'
import { Label } from './label'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    sizing: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: { placeholder: 'Type your message…' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-md">
      <Textarea sizing="sm"      placeholder="Small textarea (min-h-20)" />
      <Textarea sizing="default" placeholder="Default textarea (min-h-24)" />
      <Textarea sizing="lg"      placeholder="Large textarea (min-h-32)" />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="bio" optional>Bio</Label>
      <Textarea id="bio" placeholder="A short paragraph about yourself…" />
      <p className="text-xs text-muted-foreground">Markdown is supported.</p>
    </div>
  ),
}

export const Invalid: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="msg" required>Message</Label>
      <Textarea id="msg" defaultValue="" aria-invalid="true" />
      <p className="text-xs text-destructive">Message is required.</p>
    </div>
  ),
}

export const Disabled: Story = {
  args: { defaultValue: 'Locked content', disabled: true },
}
