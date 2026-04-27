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

const ALL_GREEN: AccuracyPoint[] = [
  { label: 'W1', accuracy: 0.70 },
  { label: 'W2', accuracy: 0.74 },
  { label: 'W3', accuracy: 0.78 },
  { label: 'W4', accuracy: 0.82 },
  { label: 'W5', accuracy: 0.85 },
  { label: 'W6', accuracy: 0.80 },
  { label: 'W7', accuracy: 0.76 },
]

const ALL_RED: AccuracyPoint[] = [
  { label: 'W1', accuracy: 0.49 },
  { label: 'W2', accuracy: 0.44 },
  { label: 'W3', accuracy: 0.38 },
  { label: 'W4', accuracy: 0.41 },
  { label: 'W5', accuracy: 0.35 },
  { label: 'W6', accuracy: 0.47 },
  { label: 'W7', accuracy: 0.42 },
]

const MONTHLY: AccuracyPoint[] = [
  { label: 'Jan', accuracy: 0.62 },
  { label: 'Feb', accuracy: 0.68 },
  { label: 'Mar', accuracy: 0.55 },
  { label: 'Apr', accuracy: 0.74 },
  { label: 'May', accuracy: 0.79 },
  { label: 'Jun', accuracy: 0.83 },
  { label: 'Jul', accuracy: 0.71 },
  { label: 'Aug', accuracy: 0.66 },
  { label: 'Sep', accuracy: 0.58 },
  { label: 'Oct', accuracy: 0.77 },
  { label: 'Nov', accuracy: 0.81 },
  { label: 'Dec', accuracy: 0.85 },
]

export const Weekly: Story = {
  args: { data: WEEKLY },
}

export const AllGreen: Story = {
  args: { data: ALL_GREEN },
}

export const AllRed: Story = {
  args: { data: ALL_RED },
}

export const Monthly: Story = {
  args: { data: MONTHLY },
}

export const SinglePoint: Story = {
  args: { data: [{ label: 'W1', accuracy: 0.72 }] },
}

export const Empty: Story = {
  args: { data: [] },
}
