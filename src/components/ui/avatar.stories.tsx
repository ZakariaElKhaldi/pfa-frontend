import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check, Bell } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
}
export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/80?u=zakaria" alt="Zakaria" />
      <AvatarFallback>ZK</AvatarFallback>
    </Avatar>
  ),
}

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>MD</AvatarFallback></Avatar>
      <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
    </div>
  ),
}

export const WithBadge: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>ZK</AvatarFallback>
        <AvatarBadge><Check /></AvatarBadge>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://i.pravatar.cc/80?u=alerts" alt="Alerts" />
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge><Bell /></AvatarBadge>
      </Avatar>
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar><AvatarImage src="https://i.pravatar.cc/80?u=a" /><AvatarFallback>A</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/80?u=b" /><AvatarFallback>B</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/80?u=c" /><AvatarFallback>C</AvatarFallback></Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
}
