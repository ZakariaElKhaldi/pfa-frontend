import type { Meta, StoryObj } from '@storybook/react-vite'

import { RadioGroup, RadioGroupItem } from './radio-group'
import { Label } from './label'

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <label className="inline-flex items-center gap-2.5 cursor-pointer">
        <RadioGroupItem value="default" /> <span className="text-sm">Default</span>
      </label>
      <label className="inline-flex items-center gap-2.5 cursor-pointer">
        <RadioGroupItem value="comfortable" /> <span className="text-sm">Comfortable</span>
      </label>
      <label className="inline-flex items-center gap-2.5 cursor-pointer">
        <RadioGroupItem value="compact" /> <span className="text-sm">Compact</span>
      </label>
    </RadioGroup>
  ),
}

export const WithLabels: Story = {
  render: () => (
    <div className="grid gap-3 max-w-sm">
      <Label>Risk profile</Label>
      <RadioGroup defaultValue="moderate">
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <RadioGroupItem value="conservative" /> <span className="text-sm">Conservative — capital preservation</span>
        </label>
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <RadioGroupItem value="moderate" /> <span className="text-sm">Moderate — balanced growth</span>
        </label>
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <RadioGroupItem value="aggressive" /> <span className="text-sm">Aggressive — high growth</span>
        </label>
      </RadioGroup>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="b">
      <label className="inline-flex items-center gap-2.5 cursor-not-allowed">
        <RadioGroupItem value="a" disabled /> <span className="text-sm text-muted-foreground">Disabled, unselected</span>
      </label>
      <label className="inline-flex items-center gap-2.5 cursor-not-allowed">
        <RadioGroupItem value="b" disabled /> <span className="text-sm text-muted-foreground">Disabled, selected</span>
      </label>
    </RadioGroup>
  ),
}
