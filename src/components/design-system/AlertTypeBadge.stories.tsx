import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { AlertTypeBadge } from './AlertTypeBadge'
import type { AlertType } from './AlertTypeBadge'

const ALL_TYPES: AlertType[] = ['divergence', 'extreme_sentiment', 'hype_fade', 'pump_suspected']

const meta: Meta<typeof AlertTypeBadge> = {
  title: 'Design System/AlertTypeBadge',
  component: AlertTypeBadge,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'radio', options: ALL_TYPES },
  },
}
export default meta

type Story = StoryObj<typeof AlertTypeBadge>

export const Divergence:       Story = { args: { type: 'divergence'        } }
export const ExtremeSentiment: Story = { args: { type: 'extreme_sentiment' } }
export const HypeFade:         Story = { args: { type: 'hype_fade'         } }
export const PumpSuspected:    Story = { args: { type: 'pump_suspected'    } }

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {ALL_TYPES.map(t => <AlertTypeBadge key={t} type={t} />)}
    </div>
  ),
}
