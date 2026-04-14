import EmptyState from '@/components/shared/EmptyState'
import { Eye, Bell, History, Star, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}

export const Watchlist = {
  args: {
    icon:        Eye,
    title:       'Your watchlist is empty',
    description: 'Search for a ticker above and add it to your watchlist.',
  },
}

export const NoAlerts = {
  args: {
    icon:        Bell,
    title:       'No active alerts',
    description: 'All caught up — no unresolved alerts.',
  },
}

export const NoTrades = {
  args: {
    icon:        History,
    title:       'No trades yet',
    description: 'Execute a buy or sell order to see your trade history here.',
  },
}

export const WithAction = {
  args: {
    icon:        Star,
    title:       'No signals yet',
    description: 'CrowdSignal will display trading signals here as they are generated.',
    action:      <Button size="sm" className="bg-action text-white mt-2">View Signals</Button>,
  },
}
