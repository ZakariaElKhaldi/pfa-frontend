import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { WSStatusDot } from './WSStatusDot'
import type { WSStatus } from './WSStatusDot'

const meta: Meta<typeof WSStatusDot> = {
  title: 'Common/WSStatusDot',
  component: WSStatusDot,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'radio', options: ['connected', 'connecting', 'disconnected'] satisfies WSStatus[] },
  },
}
export default meta

type Story = StoryObj<typeof WSStatusDot>

export const Connected:    Story = { args: { status: 'connected'    } }
export const Connecting:   Story = { args: { status: 'connecting'   } }
export const Disconnected: Story = { args: { status: 'disconnected' } }

export const AllStates: Story = {
  render: () => (
    <div className="stack stack-3" style={{ maxWidth: 160 }}>
      <WSStatusDot status="connected" />
      <WSStatusDot status="connecting" />
      <WSStatusDot status="disconnected" />
    </div>
  ),
}
