import AlertCard from '@/components/alerts/AlertCard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext } from '@/context/AuthContext'

export default {
  title: 'Alerts/AlertCard',
  component: AlertCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {/* Provide a mock auth context so AlertCard can read isAdmin */}
        <AuthContext.Provider value={{ user: { username: 'trader' }, isAdmin: false, login: () => {}, logout: () => {} }}>
          <div className="max-w-xl">
            <Story />
          </div>
        </AuthContext.Provider>
      </QueryClientProvider>
    ),
  ],
}

const divergenceAlert = {
  id: 1,
  ticker_symbol: 'AAPL',
  type: 'divergence',
  sentiment:   0.81,
  momentum:   -0.42,
  consistency: 0.30,
  resolved:    false,
  created_at:  new Date(Date.now() - 5 * 60_000).toISOString(),
}

const extremeAlert = {
  id: 2,
  ticker_symbol: 'GME',
  type: 'extreme_sentiment',
  sentiment:   0.99,
  momentum:    0.88,
  consistency: 0.95,
  resolved:    false,
  created_at:  new Date(Date.now() - 30 * 60_000).toISOString(),
}

const resolvedAlert = {
  id: 3,
  ticker_symbol: 'TSLA',
  type: 'divergence',
  sentiment:   -0.7,
  momentum:    -0.6,
  consistency:  0.8,
  resolved:    true,
  created_at:  new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
}

export const Divergence = {
  args: { alert: divergenceAlert },
}

export const ExtremeSentiment = {
  args: { alert: extremeAlert },
}

export const Resolved = {
  args: { alert: resolvedAlert },
}

export const AdminView = {
  name: 'Admin View (with resolve button)',
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AuthContext.Provider value={{ user: { username: 'admin' }, isAdmin: true, login: () => {}, logout: () => {} }}>
          <div className="max-w-xl">
            <Story />
          </div>
        </AuthContext.Provider>
      </QueryClientProvider>
    ),
  ],
  args: { alert: divergenceAlert },
}
