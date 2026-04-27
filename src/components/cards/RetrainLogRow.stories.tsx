import type { Meta, StoryObj } from '@storybook/react-vite'
import { RetrainLogRow } from './RetrainLogRow'
import type { RetrainLogEntry } from './RetrainLogRow'

const entries: RetrainLogEntry[] = [
  {
    id: 1, ticker: 'AAPL', triggerReason: 'Win-rate dropped below 55% over 24h window.',
    oldAccuracy: 0.61, newAccuracy: 0.68, modelVersion: '2.1.5', trainingSamples: 4820,
    startedAt: '10m ago', completedAt: '8m ago', status: 'success',
  },
  {
    id: 2, ticker: 'NVDA', triggerReason: 'Manual trigger from admin.',
    oldAccuracy: 0.72, newAccuracy: 0.71, modelVersion: '2.1.4', trainingSamples: 2100,
    startedAt: '2h ago',  completedAt: '1h 48m ago', status: 'success',
  },
  {
    id: 3, ticker: undefined, triggerReason: 'Scheduled global retrain.',
    oldAccuracy: 0.65, newAccuracy: 0.65, modelVersion: '2.1.3', trainingSamples: 0,
    startedAt: '3m ago', status: 'running',
  },
  {
    id: 4, ticker: 'META', triggerReason: 'Win-rate dropped below threshold.',
    oldAccuracy: 0.58, newAccuracy: 0.55, modelVersion: '2.1.2', trainingSamples: 1200,
    startedAt: '1d ago',  completedAt: '23h ago', status: 'failed',
  },
]

const meta: Meta<typeof RetrainLogRow> = {
  title: 'Admin/RetrainLogRow',
  component: RetrainLogRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Intelligence model retrain log. Maps `intelligence.RetrainLog` model. Displays accuracy before/after delta in percentage points and colour-coded status badge.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof RetrainLogRow>

export const WithEntries: Story = { args: { entries } }
export const Empty:       Story = { args: { entries: [] } }
