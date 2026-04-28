import type { Meta, StoryObj } from '@storybook/react-vite'

import { PredictionMethodBadge } from './PredictionMethodBadge'
import type { PredictionMethod } from './PredictionMethodBadge'

const meta: Meta<typeof PredictionMethodBadge> = {
  title: 'Design System/PredictionMethodBadge',
  component: PredictionMethodBadge,
  tags: ['autodocs'],
  argTypes: {
    method: { control: 'radio', options: ['ml', 'rule_based'] satisfies PredictionMethod[] },
  },
}
export default meta

type Story = StoryObj<typeof PredictionMethodBadge>

export const ML:        Story = { args: { method: 'ml'   } }
export const RuleBased: Story = { args: { method: 'rule_based' } }

export const Both: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <PredictionMethodBadge method="ml" />
      <PredictionMethodBadge method="rule_based" />
    </div>
  ),
}
