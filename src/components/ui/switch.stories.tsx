import type { Meta, StoryObj } from '@storybook/react-vite'

import { Switch } from './switch'
import { Label } from './label'

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = { args: {} }
export const Checked: Story = { args: { defaultChecked: true } }

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <div className="flex items-center gap-3"><Switch size="sm" defaultChecked /> <span className="text-sm">Small</span></div>
      <div className="flex items-center gap-3"><Switch size="default" defaultChecked /> <span className="text-sm">Default</span></div>
      <div className="flex items-center gap-3"><Switch size="lg" defaultChecked /> <span className="text-sm">Large</span></div>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="grid gap-3 max-w-sm">
      <div className="flex items-center justify-between">
        <Label htmlFor="s-off">Off</Label>
        <Switch id="s-off" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="s-on">On</Label>
        <Switch id="s-on" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="s-disabled-off" className="opacity-50">Disabled, off</Label>
        <Switch id="s-disabled-off" disabled />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="s-disabled-on" className="opacity-50">Disabled, on</Label>
        <Switch id="s-disabled-on" disabled defaultChecked />
      </div>
    </div>
  ),
}

export const Settings: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-0.5">
          <Label htmlFor="alerts">Real-time alerts</Label>
          <p className="text-xs text-muted-foreground">Push notifications for new signals.</p>
        </div>
        <Switch id="alerts" defaultChecked />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-0.5">
          <Label htmlFor="dark">Dark mode</Label>
          <p className="text-xs text-muted-foreground">Use the Obsidian Lens dark theme.</p>
        </div>
        <Switch id="dark" />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-0.5">
          <Label htmlFor="auto">Auto-execute trades</Label>
          <p className="text-xs text-muted-foreground">Place orders without manual confirmation.</p>
        </div>
        <Switch id="auto" />
      </div>
    </div>
  ),
}
