import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption,
} from './table'

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Table>

const POSITIONS = [
  { sym: 'AAPL', qty: 50,  avg: 165.30, last: 189.42, pnl:  +1206.00 },
  { sym: 'NVDA', qty: 20,  avg: 412.10, last: 824.55, pnl:  +8249.00 },
  { sym: 'META', qty: 10,  avg: 510.00, last: 482.10, pnl:   -279.00 },
  { sym: 'MSFT', qty: 30,  avg: 380.00, last: 424.55, pnl:  +1336.50 },
]

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const Positions: Story = {
  render: () => (
    <Table>
      <TableCaption>Current open positions in your paper portfolio.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Avg Cost</TableHead>
          <TableHead className="text-right">Last</TableHead>
          <TableHead className="text-right">Unrealized P&L</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {POSITIONS.map(p => (
          <TableRow key={p.sym}>
            <TableCell className="font-mono font-medium">{p.sym}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{p.qty}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">${fmt(p.avg)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">${fmt(p.last)}</TableCell>
            <TableCell className={`text-right font-mono tabular-nums ${p.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {p.pnl >= 0 ? '+' : ''}${fmt(p.pnl)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Total unrealized</TableCell>
          <TableCell className="text-right font-mono tabular-nums text-emerald-500">
            +${fmt(POSITIONS.reduce((s, p) => s + p.pnl, 0))}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const SelectedRow: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Signal</TableHead>
          <TableHead className="text-right">Confidence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono">AAPL</TableCell>
          <TableCell className="text-emerald-500">BUY</TableCell>
          <TableCell className="text-right font-mono">87%</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell className="font-mono">NVDA</TableCell>
          <TableCell className="text-emerald-500">BUY</TableCell>
          <TableCell className="text-right font-mono">94%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono">META</TableCell>
          <TableCell className="text-rose-500">SELL</TableCell>
          <TableCell className="text-right font-mono">71%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Signal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
            No data yet — pipeline has not run.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
