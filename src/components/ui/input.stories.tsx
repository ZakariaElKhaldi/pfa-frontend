import type { Meta, StoryObj } from '@storybook/react-vite'
import { Search, Mail, Lock, DollarSign, AtSign, Eye } from 'lucide-react'

import { Input } from './input'
import { Label } from './label'
import { Button } from './button'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    sizing: { control: 'select', options: ['xs', 'sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'date'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { type: 'text', placeholder: 'Email address' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-sm">
      <Input sizing="xs"      placeholder="Extra small (h-7)" />
      <Input sizing="sm"      placeholder="Small (h-8)" />
      <Input sizing="default" placeholder="Default (h-10)" />
      <Input sizing="lg"      placeholder="Large (h-12)" />
    </div>
  ),
}

export const WithStartIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-sm">
      <Input startIcon={<Search />}    placeholder="Search markets..." />
      <Input startIcon={<Mail />}      type="email" placeholder="you@example.com" />
      <Input startIcon={<Lock />}      type="password" placeholder="Password" />
      <Input startIcon={<DollarSign />} type="number" placeholder="0.00" />
    </div>
  ),
}

export const WithEndIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-sm">
      <Input endIcon={<AtSign />} placeholder="Mention a user" />
      <Input type="password" endIcon={<Eye />} placeholder="Password" />
    </div>
  ),
}

export const WithEndAdornment: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-sm">
      <Input
        type="number"
        startIcon={<DollarSign />}
        endAdornment={
          <Button size="xs" variant="ghost" className="font-mono uppercase">Max</Button>
        }
        placeholder="0.00"
      />
      <Input
        startIcon={<Search />}
        endAdornment={
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        }
        placeholder="Search anything..."
      />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="email" required>Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" startIcon={<Mail />} />
      <p className="text-xs text-muted-foreground">We'll never share your email.</p>
    </div>
  ),
}

export const Optional: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="bio" optional>Bio</Label>
      <Input id="bio" placeholder="Tell us about yourself" />
    </div>
  ),
}

export const Invalid: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="email-invalid" required>Email</Label>
      <Input
        id="email-invalid"
        type="email"
        startIcon={<Mail />}
        defaultValue="not-an-email"
        aria-invalid="true"
      />
      <p className="text-xs text-destructive">Enter a valid email address.</p>
    </div>
  ),
}

export const Disabled: Story = {
  args: { type: 'text', placeholder: 'Disabled', disabled: true, defaultValue: 'Locked field' },
}

export const NumericTradingInput: Story = {
  name: 'Trading: numeric quantity',
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="qty" required>Quantity</Label>
      <Input
        id="qty"
        type="number"
        sizing="lg"
        startIcon={<DollarSign />}
        endAdornment={
          <Button size="sm" variant="ghost" className="font-mono uppercase tracking-wider">Max</Button>
        }
        placeholder="0.00"
        className="font-mono tabular-nums"
      />
    </div>
  ),
}

export const FullForm: Story = {
  render: () => (
    <form className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name" required>Full name</Label>
        <Input id="name" placeholder="Jane Doe" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="form-email" required>Email</Label>
        <Input id="form-email" type="email" startIcon={<Mail />} placeholder="you@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pwd" required>Password</Label>
        <Input id="pwd" type="password" startIcon={<Lock />} endIcon={<Eye />} placeholder="••••••••" />
      </div>
      <Button type="submit" className="mt-2 w-full">Create account</Button>
    </form>
  ),
}
