import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { AccuracyRing } from './AccuracyRing'

const meta: Meta<typeof AccuracyRing> = {
  title: 'Design System/AccuracyRing',
  component: AccuracyRing,
  tags: ['autodocs'],
  argTypes: {
    pct:   { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size:  { control: { type: 'number', min: 48, max: 200, step: 4 } },
    color: { control: 'color' },
  },
}
export default meta

type Story = StoryObj<typeof AccuracyRing>

export const Default:  Story = { args: { pct: 72 } }
export const Bullish:  Story = { args: { pct: 74, color: 'var(--secondary)' } }
export const Bearish:  Story = { args: { pct: 35, color: 'var(--tertiary)'  } }
export const Hold:     Story = { args: { pct: 55, color: 'var(--warning)'   } }

export const SignalGauges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <AccuracyRing pct={74} color="var(--secondary)" />
      <AccuracyRing pct={68} color="var(--tertiary)"  />
      <AccuracyRing pct={71} color="var(--warning)"   />
    </div>
  ),
}
