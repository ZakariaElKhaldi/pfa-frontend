import type { Meta, StoryObj } from '@storybook/react-vite'

import { AccuracyTrendChart } from './AccuracyTrendChart'
import type { AccuracyPoint } from './AccuracyTrendChart'

const WEEKLY: AccuracyPoint[] = [
  { label: 'W1', accuracy: 0.64 },
  { label: 'W2', accuracy: 0.71 },
  { label: 'W3', accuracy: 0.58 },
  { label: 'W4', accuracy: 0.79 },
  { label: 'W5', accuracy: 0.82 },
  { label: 'W6', accuracy: 0.45 },
  { label: 'W7', accuracy: 0.74 },
]

const meta: Meta<typeof AccuracyTrendChart> = {
  title: 'Charts/AccuracyTrendChart',
  component: AccuracyTrendChart,
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'number', min: 100, max: 400, step: 20 } },
  },
}
export default meta

type Story = StoryObj<typeof AccuracyTrendChart>

export const Weekly: Story = {
  args: { data: WEEKLY },
}

export const Empty: Story = {
  args: { data: [] },
}
