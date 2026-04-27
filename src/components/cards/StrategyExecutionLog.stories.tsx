import type { Meta, StoryObj } from '@storybook/react-vite'
import { StrategyExecutionLog } from './StrategyExecutionLog'
import type { StrategyExecution } from './StrategyExecutionLog'

const executions: StrategyExecution[] = [
  { id: 1, executedAt: '2m ago',   ticker: 'AAPL', triggered: true,  actionsTaken: ['notify', 'log'],       notes: 'Sentiment threshold crossed.' },
  { id: 2, executedAt: '17m ago',  ticker: 'NVDA', triggered: false, actionsTaken: [],                      notes: 'Conditions not met.' },
  { id: 3, executedAt: '32m ago',  ticker: 'META', triggered: true,  actionsTaken: ['notify', 'webhook'],   notes: 'RSI < 30 and sentiment > 0.6.' },
  { id: 4, executedAt: '1h ago',   ticker: 'TSLA', triggered: true,  actionsTaken: ['log'],                 notes: undefined },
]

const meta: Meta<typeof StrategyExecutionLog> = {
  title: 'Strategies/StrategyExecutionLog',
  component: StrategyExecutionLog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Strategy execution history table. Maps `GET /api/strategies/:pk/executions/`. Shows whether each evaluation triggered the strategy and which actions were taken.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof StrategyExecutionLog>

export const WithExecutions: Story = { args: { executions } }
export const Empty:          Story = { args: { executions: [] } }
