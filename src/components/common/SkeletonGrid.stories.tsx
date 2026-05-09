import type { Meta, StoryObj } from '@storybook/react'
import { SkeletonGrid } from './SkeletonGrid'

const meta: Meta<typeof SkeletonGrid> = {
  title: 'Common/SkeletonGrid',
  component: SkeletonGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    count:    { control: { type: 'number', min: 1, max: 12 } },
    minWidth: { control: 'text' },
    height:   { control: 'text' },
    gap:      { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const WatchlistGrid: Story = {
  args: { count: 8, minWidth: '180px', height: '96px' },
}

export const AlertGrid: Story = {
  args: { count: 6, minWidth: '280px', height: '112px' },
}

export const MetricStrip: Story = {
  args: { count: 4, minWidth: '180px', height: '88px' },
}

export const TwoItems: Story = {
  args: { count: 2, minWidth: '300px', height: '160px', gap: 'var(--space-5)' },
}
