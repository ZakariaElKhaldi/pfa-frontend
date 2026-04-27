import type { Meta, StoryObj } from '@storybook/react-vite'
import { RuleConditionRow } from './RuleConditionRow'
import { fn } from 'storybook/test'

const meta: Meta<typeof RuleConditionRow> = {
  title: 'Strategies/RuleConditionRow',
  component: RuleConditionRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Read-only condition display row for a strategy rule. Matches the `RuleCondition` model — field, operator, value triplet. Add `onRemove` to enable edit mode.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
  argTypes: {
    field:    { control: 'select', options: ['sentiment_score','signal','rsi','sma_20','ema_50','volume_change','bollinger_position','macd_signal','alert_type','mood','price'] },
    operator: { control: 'select', options: ['gt','lt','gte','lte','eq','neq','contains','crosses_above','crosses_below'] },
  },
}
export default meta

type Story = StoryObj<typeof RuleConditionRow>

export const SentimentGt: Story = {
  args: { field: 'sentiment_score', operator: 'gt', value: 0.6 },
}

export const RsiLt: Story = {
  args: { field: 'rsi', operator: 'lt', value: 30 },
}

export const SignalEq: Story = {
  args: { field: 'signal', operator: 'eq', value: 'BUY' },
}

export const WithRemove: Story = {
  parameters: { docs: { description: { story: 'Edit mode — shows a remove button on the right.' } } },
  args: { field: 'mood', operator: 'eq', value: 'bullish', onRemove: fn() },
}

export const ConditionList: Story = {
  parameters: { docs: { description: { story: 'Multiple conditions as rendered in the strategy builder.' } } },
  render: () => (
    <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <RuleConditionRow field="sentiment_score" operator="gt"  value={0.6}     onRemove={() => {}} />
      <RuleConditionRow field="rsi"             operator="lt"  value={30}       onRemove={() => {}} />
      <RuleConditionRow field="signal"          operator="eq"  value="BUY"     onRemove={() => {}} />
      <RuleConditionRow field="mood"            operator="neq" value="bearish"  onRemove={() => {}} />
    </div>
  ),
}
