import SignalBadge from '@/components/signals/SignalBadge'

export default {
  title: 'Signals/SignalBadge',
  component: SignalBadge,
  tags: ['autodocs'],
  argTypes: {
    signal: {
      control: 'select',
      options: ['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

const Template = (args) => (
  <div className="flex flex-wrap gap-3 items-center">
    <SignalBadge {...args} signal="STRONG_BUY" />
    <SignalBadge {...args} signal="BUY" />
    <SignalBadge {...args} signal="HOLD" />
    <SignalBadge {...args} signal="SELL" />
    <SignalBadge {...args} signal="STRONG_SELL" />
  </div>
)

export const AllSignals = {
  name: 'All Signals — Default Size',
  render: Template,
  args: { size: 'md' },
}

export const Small = {
  name: 'All Signals — Small',
  render: Template,
  args: { size: 'sm' },
}

export const Large = {
  name: 'All Signals — Large',
  render: Template,
  args: { size: 'lg' },
}

export const Standalone = {
  args: { signal: 'BUY', size: 'md' },
}
