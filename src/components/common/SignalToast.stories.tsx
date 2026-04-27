import type { Meta, StoryObj } from '@storybook/react-vite'

import { SignalToast } from './SignalToast'
import type { Signal } from '@/design-system/tokens'

const meta: Meta<typeof SignalToast> = {
  title: 'Common/SignalToast',
  component: SignalToast,
  tags: ['autodocs'],
  argTypes: {
    signal: { control: 'radio', options: ['BUY', 'SELL', 'HOLD'] satisfies Signal[] },
  },
  decorators: [Story => <div style={{ padding: 16 }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof SignalToast>

export const Buy: Story = {
  args: { symbol: 'AAPL', signal: 'BUY', price: '189.42', timestamp: 'Today 14:32 UTC' },
}

export const Sell: Story = {
  args: { symbol: 'META', signal: 'SELL', price: '482.10', timestamp: 'Today 14:35 UTC' },
}

export const Hold: Story = {
  args: { symbol: 'MSFT', signal: 'HOLD', price: '424.55', timestamp: 'Today 14:40 UTC' },
}

export const AllSignals: Story = {
  render: () => (
    <div className="stack stack-3">
      <SignalToast symbol="AAPL" signal="BUY"  price="189.42" timestamp="Today 14:32 UTC" />
      <SignalToast symbol="META" signal="SELL" price="482.10" timestamp="Today 14:35 UTC" />
      <SignalToast symbol="MSFT" signal="HOLD" price="424.55" timestamp="Today 14:40 UTC" />
    </div>
  ),
}
