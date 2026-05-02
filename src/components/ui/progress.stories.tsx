import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress, ProgressLabel, ProgressValue } from './progress'

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    color: { control: 'select', options: ['default', 'buy', 'sell', 'hold', 'success', 'info', 'muted'] },
  },
}
export default meta
type Story = StoryObj<typeof Progress>

export const Default: Story = {
  args: { value: 65 },
  render: (args) => <div className="w-80"><Progress {...args} /></div>,
}

export const WithLabelAndValue: Story = {
  render: () => (
    <div className="w-80">
      <Progress value={72}>
        <ProgressLabel>Signal accuracy</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  ),
}

export const SignalColors: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Progress value={84} color="buy"><ProgressLabel>BUY</ProgressLabel><ProgressValue /></Progress>
      <Progress value={32} color="sell"><ProgressLabel>SELL</ProgressLabel><ProgressValue /></Progress>
      <Progress value={50} color="hold"><ProgressLabel>HOLD</ProgressLabel><ProgressValue /></Progress>
    </div>
  ),
}

export const SemanticColors: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Progress value={92} color="success"><ProgressLabel>Success</ProgressLabel><ProgressValue /></Progress>
      <Progress value={45} color="info"><ProgressLabel>Info</ProgressLabel><ProgressValue /></Progress>
      <Progress value={20} color="muted"><ProgressLabel>Muted</ProgressLabel><ProgressValue /></Progress>
    </div>
  ),
}

export const Empty:    Story = { render: () => <div className="w-80"><Progress value={0} /></div> }
export const Complete: Story = { render: () => <div className="w-80"><Progress value={100} color="success" /></div> }
