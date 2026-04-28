import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from './checkbox'
import { Label } from './label'

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = { args: {} }

export const Checked: Story = { args: { defaultChecked: true } }

export const Indeterminate: Story = {
  args: { indeterminate: true, defaultChecked: true },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2.5"><Checkbox disabled /> <span className="text-sm text-muted-foreground">Disabled, unchecked</span></label>
      <label className="flex items-center gap-2.5"><Checkbox disabled defaultChecked /> <span className="text-sm text-muted-foreground">Disabled, checked</span></label>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <label className="inline-flex items-center gap-2.5 cursor-pointer">
      <Checkbox id="terms" />
      <Label htmlFor="terms">I agree to the terms of service</Label>
    </label>
  ),
}

export const InGroup: Story = {
  render: () => (
    <div className="grid gap-3">
      <p className="text-sm font-medium">Notifications</p>
      <label className="inline-flex items-center gap-2.5 cursor-pointer"><Checkbox defaultChecked /> <span className="text-sm">Email me when a signal fires</span></label>
      <label className="inline-flex items-center gap-2.5 cursor-pointer"><Checkbox /> <span className="text-sm">Email me daily portfolio summary</span></label>
      <label className="inline-flex items-center gap-2.5 cursor-pointer"><Checkbox defaultChecked /> <span className="text-sm">Email me when a price alert triggers</span></label>
    </div>
  ),
}

export const Invalid: Story = {
  render: () => (
    <label className="inline-flex items-center gap-2.5 cursor-pointer">
      <Checkbox aria-invalid="true" />
      <span className="text-sm text-destructive">You must accept to continue</span>
    </label>
  ),
}
