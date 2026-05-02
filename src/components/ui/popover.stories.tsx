import type { Meta, StoryObj } from '@storybook/react-vite'
import { Settings } from 'lucide-react'
import {
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription,
} from './popover'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Popover> = {
  title: 'UI/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Quick info</PopoverTitle>
          <PopoverDescription>Brief contextual content lives here.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
}

export const SettingsForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="icon"><Settings /></Button>} />
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Display settings</PopoverTitle>
          <PopoverDescription>Configure dashboard preferences.</PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="density">Density</Label>
            <Input id="density" defaultValue="Comfortable" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="refresh">Refresh interval (s)</Label>
            <Input id="refresh" type="number" defaultValue="30" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-12 p-12">
      {(['top', 'right', 'bottom', 'left'] as const).map(side => (
        <Popover key={side}>
          <PopoverTrigger render={<Button variant="outline">{side}</Button>} />
          <PopoverContent side={side}>
            <PopoverHeader><PopoverTitle>side="{side}"</PopoverTitle></PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
}
