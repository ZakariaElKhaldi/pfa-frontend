import type { Meta, StoryObj } from '@storybook/react'
import { Topbar } from './Topbar'

const meta: Meta<typeof Topbar> = {
  title: 'Layout/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'surface',
      values: [
        { name: 'surface', value: 'hsl(220, 25%, 93%)' },
        { name: 'dark',    value: 'hsl(220, 20%, 10%)' },
      ],
    },
  },
  argTypes: {
    wsStatus: { control: 'select', options: ['connected', 'connecting', 'disconnected'] },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { wsStatus: 'connected', hideSidebarTrigger: true },
}

export const WithBreadcrumb: Story = {
  args: {
    breadcrumb: [{ label: 'Strategies', href: '/strategies' }, { label: 'Momentum Alpha' }],
    wsStatus: 'connected',
    hideSidebarTrigger: true,
  },
}

export const DeepBreadcrumb: Story = {
  args: {
    breadcrumb: [
      { label: 'Analytics', href: '/analytics' },
      { label: 'Backtest', href: '/backtest' },
      { label: 'NVDA — 2025-Q1' },
    ],
    wsStatus: 'connecting',
    hideSidebarTrigger: true,
  },
}

export const Disconnected: Story = {
  args: { wsStatus: 'disconnected', hideSidebarTrigger: true },
}

export const NoBreadcrumb: Story = {
  args: { hideSidebarTrigger: true },
}
