import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { MoodBadge } from './MoodBadge'
import type { Mood } from './MoodBadge'

const meta: Meta<typeof MoodBadge> = {
  title: 'Design System/MoodBadge',
  component: MoodBadge,
  tags: ['autodocs'],
  argTypes: {
    mood: { control: 'radio', options: ['bullish', 'bearish', 'uncertain', 'euphoric', 'panic'] satisfies Mood[] },
  },
}
export default meta

type Story = StoryObj<typeof MoodBadge>

export const Bullish:   Story = { args: { mood: 'bullish'   } }
export const Bearish:   Story = { args: { mood: 'bearish'   } }
export const Uncertain: Story = { args: { mood: 'uncertain' } }
export const Euphoric:  Story = { args: { mood: 'euphoric'  } }
export const Panic:     Story = { args: { mood: 'panic'     } }

export const AllMoods: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['bullish', 'bearish', 'uncertain', 'euphoric', 'panic'] as Mood[]).map(m => (
        <MoodBadge key={m} mood={m} />
      ))}
    </div>
  ),
}
