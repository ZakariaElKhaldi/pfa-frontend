import type { Meta, StoryObj } from '@storybook/react-vite'
import { RuleActionRow } from './RuleActionRow'
import { fn } from 'storybook/test'

const meta: Meta<typeof RuleActionRow> = {
  title: 'Strategies/RuleActionRow',
  component: RuleActionRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Display row for a single strategy action. Colour-coded per `action_type` from the `RuleAction` model. Pass `onRemove` to enable removal in edit mode.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
  argTypes: {
    actionType: { control: 'select', options: ['notify','email','webhook','log','auto_trade'] },
  },
}
export default meta

type Story = StoryObj<typeof RuleActionRow>

export const Notify:    Story = { args: { actionType: 'notify' } }
export const Email:     Story = { args: { actionType: 'email',   target: 'user@crowdsignal.dev' } }
export const Webhook:   Story = { args: { actionType: 'webhook', target: 'https://hooks.slack.com/T0123' } }
export const Log:       Story = { args: { actionType: 'log' } }
export const AutoTrade: Story = { args: { actionType: 'auto_trade' } }

export const WithRemove: Story = {
  args: { actionType: 'notify', onRemove: fn() },
}

export const ActionList: Story = {
  parameters: { docs: { description: { story: 'Two actions stacked — typical strategy configuration.' } } },
  render: () => (
    <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <RuleActionRow actionType="notify"  onRemove={() => {}} />
      <RuleActionRow actionType="webhook" target="https://hooks.slack.com/T0123" onRemove={() => {}} />
    </div>
  ),
}
