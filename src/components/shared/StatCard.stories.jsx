import StatCard from '@/components/shared/StatCard'
import { Briefcase, Target, Eye, Bell, TrendingUp } from 'lucide-react'

export default {
  title: 'Shared/StatCard',
  component: StatCard,
  tags: ['autodocs'],
}

export const PortfolioValue = {
  args: {
    label: 'Portfolio Value',
    value: '$842,591',
    sub:   '+1.71% today',
    trend: 1.71,
    icon:  Briefcase,
  },
}

export const SignalAccuracy = {
  args: {
    label: 'Signal Accuracy',
    value: '81.4%',
    sub:   'last 30d',
    icon:  Target,
  },
}

export const WatchlistCount = {
  args: {
    label: 'Watchlist',
    value: '12',
    sub:   'tickers tracked',
    icon:  Eye,
  },
}

export const ActiveAlertsBad = {
  name: 'Active Alerts (unresolved)',
  args: {
    label: 'Active Alerts',
    value: '5',
    sub:   'unresolved',
    trend: -1,
    icon:  Bell,
  },
}

export const GreenTrend = {
  args: {
    label: '24H Alpha',
    value: '+4.28%',
    sub:   'signal-driven',
    trend: 4.28,
    icon:  TrendingUp,
  },
}

export const LoadingState = {
  args: {
    label: 'Portfolio Value',
    value: '—',
    icon:  Briefcase,
  },
}
