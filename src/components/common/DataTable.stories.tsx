import type { Meta, StoryObj } from '@storybook/react-vite'

import { DataTable } from './DataTable'
import type { Column } from './DataTable'
import { SignalBadge } from '@/components/design-system'
import type { Signal } from '@/design-system/tokens'

interface TickerRow {
  symbol: string
  name:   string
  price:  string
  change: string
  signal: Signal
}

const COLUMNS: Column<TickerRow>[] = [
  { key: 'symbol', header: 'Symbol', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.symbol}</span>, width: 80 },
  { key: 'name',   header: 'Name',   render: r => <span className="text-body-sm">{r.name}</span> },
  { key: 'price',  header: 'Price',  render: r => <span className="text-mono-sm">${r.price}</span>, align: 'right', width: 90 },
  { key: 'change', header: 'Change', render: r => <span className={`text-mono-sm ${r.change.startsWith('+') ? 'text-bullish' : 'text-bearish'}`}>{r.change}</span>, align: 'right', width: 90 },
  { key: 'signal', header: 'Signal', render: r => <SignalBadge signal={r.signal} size="sm" />, align: 'center', width: 80 },
]

const DATA: TickerRow[] = [
  { symbol: 'AAPL',  name: 'Apple Inc.',          price: '189.42', change: '+2.31', signal: 'BUY'  },
  { symbol: 'META',  name: 'Meta Platforms',       price: '482.10', change: '-8.90', signal: 'SELL' },
  { symbol: 'MSFT',  name: 'Microsoft Corp.',      price: '424.55', change: '+0.12', signal: 'HOLD' },
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',   price: '910.23', change: '+22.1', signal: 'BUY'  },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',        price: '175.68', change: '-1.44', signal: 'HOLD' },
]

const meta: Meta<typeof DataTable<TickerRow>> = {
  title: 'Common/DataTable',
  component: DataTable,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof DataTable<TickerRow>>

export const Default: Story = {
  render: () => <DataTable columns={COLUMNS} data={DATA} keyFn={r => r.symbol} />,
}

export const Loading: Story = {
  render: () => <DataTable columns={COLUMNS} data={[]} keyFn={r => r.symbol} loading />,
}

export const Empty: Story = {
  render: () => <DataTable columns={COLUMNS} data={[]} keyFn={r => r.symbol} emptyText="No tickers found" />,
}
