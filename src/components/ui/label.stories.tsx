import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'
import { Input } from './input'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
    optional: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: { children: 'Email address' },
}

export const Required: Story = {
  args: { children: 'Email address', required: true },
}

export const Optional: Story = {
  args: { children: 'Bio', optional: true },
}

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="ticker-symbol" required>Ticker symbol</Label>
      <Input id="ticker-symbol" placeholder="AAPL" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="group grid w-full max-w-sm gap-2" data-disabled="true">
      <Label htmlFor="locked">Locked field</Label>
      <Input id="locked" disabled defaultValue="read only" />
    </div>
  ),
}
