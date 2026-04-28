import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { ManipulationFlagCard } from './ManipulationFlagCard'
import type { PatternType } from './ManipulationFlagCard'

const meta: Meta<typeof ManipulationFlagCard> = {
  title: 'Admin/ManipulationFlagCard',
  component: ManipulationFlagCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Admin-only alert card for a detected manipulation pattern. `onMarkReviewed` wires to `PATCH /api/intelligence/flags/<pk>/review/`. Button is hidden once `reviewed=true`.',
      },
    },
  },
  args: { onMarkReviewed: fn() },
  argTypes: {
    patternType: { control: 'radio', options: ['pump_dump', 'bot_swarm', 'coordinated_spam'] satisfies PatternType[] },
    confidence:  { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    reviewed:    { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof ManipulationFlagCard>

export const PumpDump: Story = {
  args: { symbol: 'GME', patternType: 'pump_dump', confidence: 0.91, detectedAt: '14:32 UTC' },
}

export const BotSwarm: Story = {
  args: { symbol: 'DOGE', patternType: 'bot_swarm', confidence: 0.87, detectedAt: '09:15 UTC' },
}

export const CoordinatedSpam: Story = {
  args: { symbol: 'AMC', patternType: 'coordinated_spam', confidence: 0.78, detectedAt: '11:04 UTC' },
}

export const Reviewed: Story = {
  args: { symbol: 'GME', patternType: 'pump_dump', confidence: 0.91, detectedAt: '14:32 UTC', reviewed: true },
  parameters: { docs: { description: { story: 'Already reviewed — Review button is hidden.' } } },
}

export const NoCallback: Story = {
  args: { symbol: 'TSLA', patternType: 'bot_swarm', confidence: 0.74, detectedAt: '08:00 UTC', onMarkReviewed: undefined },
  parameters: { docs: { description: { story: 'Read-only view — no `onMarkReviewed` provided, button not rendered.' } } },
}
