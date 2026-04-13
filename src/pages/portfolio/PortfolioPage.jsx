import { usePortfolio, usePortfolioSummary, useTrades } from '@/hooks/usePortfolio'
import HoldingsTable from '@/components/portfolio/HoldingsTable'
import PnLCard from '@/components/portfolio/PnLCard'
import TradeForm from '@/components/portfolio/TradeForm'
import SectionCard from '@/components/shared/SectionCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase } from 'lucide-react'

function TradeHistoryTable({ trades }) {
  if (!trades?.length) return (
    <EmptyState icon={Briefcase} title="No trades yet" description="Buy or sell a position above." />
  )
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[--color-surface-low] hover:bg-transparent">
          {['Symbol', 'Side', 'Qty', 'Price', 'When'].map((h) => (
            <TableHead key={h} className="text-[10px] font-medium text-[--color-muted] uppercase tracking-wider">{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((t, i) => (
          <TableRow key={t.id ?? i} className="border-[--color-surface-low] hover:bg-[--color-surface-low]">
            <TableCell className="font-mono font-semibold text-sm text-[--color-max-text]">{t.symbol}</TableCell>
            <TableCell className={t.side === 'buy' ? 'text-xs text-[--color-signal-buy]' : 'text-xs text-[--color-signal-sell]'}>
              {t.side.toUpperCase()}
            </TableCell>
            <TableCell className="font-data text-xs text-[--color-secondary]">{t.quantity}</TableCell>
            <TableCell className="font-data text-xs text-[--color-secondary]">${formatPrice(t.price)}</TableCell>
            <TableCell className="text-[10px] text-[--color-muted]">
              {t.executed_at ? formatDistanceToNow(new Date(t.executed_at), { addSuffix: true }) : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function PortfolioPage() {
  const { data: summary, isLoading: summaryLoading } = usePortfolioSummary()
  const { data: portfolio }                          = usePortfolio()
  const { data: trades }                             = useTrades()

  if (summaryLoading) return (
    <div className="flex justify-center py-20"><LoadingSpinner size={24} /></div>
  )

  return (
    <div className="flex flex-col gap-4">
      <SectionCard>
        <PnLCard
          totalValue={summary?.total_value}
          totalPnl={summary?.total_pnl}
          totalPnlPct={summary?.total_pnl_pct}
          cash={summary?.cash}
        />
      </SectionCard>

      <SectionCard title="Trade">
        <TradeForm />
      </SectionCard>

      <SectionCard title="Positions">
        <HoldingsTable positions={portfolio?.positions ?? []} />
      </SectionCard>

      <SectionCard title="Trade History">
        <TradeHistoryTable trades={trades} />
      </SectionCard>
    </div>
  )
}
