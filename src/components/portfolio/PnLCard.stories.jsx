import PnLCard from '@/components/portfolio/PnLCard'

export default {
  title: 'Portfolio/PnLCard',
  component: PnLCard,
  tags: ['autodocs'],
}

export const Profitable = {
  args: {
    totalValue:  842591.12,
    totalPnl:    14203.45,
    totalPnlPct: 1.71,
    cash:        25_000,
  },
}

export const Loss = {
  args: {
    totalValue:  78_500,
    totalPnl:   -4_200.50,
    totalPnlPct: -5.08,
    cash:        5_000,
  },
}

export const Loading = {
  args: {
    totalValue:  undefined,
    totalPnl:    undefined,
    totalPnlPct: undefined,
    cash:        undefined,
  },
}
