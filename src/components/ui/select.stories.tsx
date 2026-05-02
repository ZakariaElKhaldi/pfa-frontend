import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator,
} from './select'
import { Label } from './label'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: () => (
    <Select defaultValue="AAPL">
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Pick a ticker" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="AAPL">AAPL — Apple</SelectItem>
        <SelectItem value="MSFT">MSFT — Microsoft</SelectItem>
        <SelectItem value="NVDA">NVDA — NVIDIA</SelectItem>
        <SelectItem value="META">META — Meta</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(['sm', 'default', 'lg'] as const).map(s => (
        <Select key={s}>
          <SelectTrigger size={s} className="w-40">
            <SelectValue placeholder={`Size: ${s}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option one</SelectItem>
            <SelectItem value="2">Option two</SelectItem>
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
}

export const Grouped: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Pick a sector" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tech</SelectLabel>
          <SelectItem value="aapl">AAPL — Apple</SelectItem>
          <SelectItem value="msft">MSFT — Microsoft</SelectItem>
          <SelectItem value="nvda">NVDA — NVIDIA</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Finance</SelectLabel>
          <SelectItem value="jpm">JPM — JPMorgan</SelectItem>
          <SelectItem value="gs">GS — Goldman Sachs</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-64 gap-2">
      <Label htmlFor="timeframe" required>Timeframe</Label>
      <Select defaultValue="1D">
        <SelectTrigger id="timeframe" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1H">1 hour</SelectItem>
          <SelectItem value="1D">1 day</SelectItem>
          <SelectItem value="1W">1 week</SelectItem>
          <SelectItem value="1M">1 month</SelectItem>
          <SelectItem value="3M">3 months</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="AAPL">
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="AAPL">AAPL — Apple</SelectItem>
      </SelectContent>
    </Select>
  ),
}
