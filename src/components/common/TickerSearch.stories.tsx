import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import '../../index.css'
import { TickerSearch } from './TickerSearch'
import type { TickerResult } from './TickerSearch'

const MOCK_RESULTS: TickerResult[] = [
  { symbol: 'AAPL',  name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT',  name: 'Microsoft Corporation' },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.' },
  { symbol: 'NVDA',  name: 'NVIDIA Corporation' },
]

const meta: Meta<typeof TickerSearch> = {
  title: 'Common/TickerSearch',
  component: TickerSearch,
  tags: ['autodocs'],
  decorators: [Story => <div style={{ maxWidth: 400, padding: 16 }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof TickerSearch>

export const WithResults: Story = {
  render: () => {
    const [selected, setSelected] = useState<TickerResult | null>(null)
    return (
      <div className="stack stack-4">
        <TickerSearch
          results={MOCK_RESULTS}
          onSearch={() => {}}
          onSelect={r => setSelected(r)}
        />
        {selected && <p className="text-body-sm">Selected: <strong>{selected.symbol}</strong> — {selected.name}</p>}
      </div>
    )
  },
}

export const Loading: Story = {
  args: {
    loading:  true,
    results:  [],
    onSearch: () => {},
    onSelect: () => {},
  },
}

export const Empty: Story = {
  args: {
    results:  [],
    onSearch: () => {},
    onSelect: () => {},
  },
}
