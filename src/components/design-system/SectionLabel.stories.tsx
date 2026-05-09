import type { Meta, StoryObj } from '@storybook/react'
import { SectionLabel } from './SectionLabel'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof SectionLabel> = {
  title: 'Design System/SectionLabel',
  component: SectionLabel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    children: { control: 'text' },
    as: {
      control: 'select',
      options: ['div', 'h2', 'h3'],
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Active Alerts' },
}

export const WithAction: Story = {
  args: {
    children: 'Recent Signals',
    action: <Button variant="ghost" size="sm">View all</Button>,
  },
}

export const AsHeading: Story = {
  args: { children: 'Trending', as: 'h2' },
}

export const LongLabel: Story = {
  args: {
    children: 'Intelligence & Model Accuracy',
    action: <Button variant="outline" size="sm">Retrain now</Button>,
  },
}
