import type { Meta, StoryObj } from '@storybook/react-vite'

import { IndicatorChip } from './IndicatorChip'

const meta: Meta<typeof IndicatorChip> = {
  title: 'Cards/IndicatorChip',
  component: IndicatorChip,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof IndicatorChip>

export const Default: Story = {
  args: { label: 'RSI', value: '72.4' },
}

export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <IndicatorChip label="RSI"    value="72.4" />
      <IndicatorChip label="MACD"   value="+0.32" />
      <IndicatorChip label="Vol"    value="24.1M" />
      <IndicatorChip label="P/E"    value="28.4" />
      <IndicatorChip label="52w Hi" value="$198" />
    </div>
  ),
}
