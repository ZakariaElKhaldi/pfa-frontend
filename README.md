# CrowdSignal — Frontend

React 18 + Vite client for the CrowdSignal trading signals platform. Displays real-time social sentiment, BUY/SELL/HOLD signals, live prices, portfolio management, and admin tooling.

**Status:** Scaffolded — stack defined, implementation starting.

---

## Tech Stack

| Layer | Library | Version | Purpose |
|---|---|---|---|
| Framework | React | 18 | UI rendering |
| Build | Vite | 5 | Dev server, HMR, bundling |
| Routing | React Router DOM | 6 | Client-side routing |
| Server State | TanStack Query | v4 | Fetching, caching, background sync |
| HTTP | Axios | 1.x | REST API calls |
| Styling | Tailwind CSS | v4 | Utility-first, zero runtime |
| Components | shadcn/ui | latest | Radix UI primitives + Tailwind, copy-paste |
| Animations | React Bits | latest | 110+ animated components, copy-paste |
| Financial charts | lightweight-charts (TradingView) | latest | Canvas-based, 45KB, candlestick + real-time |
| Analytics charts | Recharts (via shadcn Chart) | 4.x | Area, bar, line — sentiment & accuracy |
| Real-time | Native WebSocket | — | Django Channels live price + signal stream |

---

## Design System

### Philosophy

Built on three scientific frameworks:

1. **Gestalt Laws** — Group related data visually (proximity + enclosure), use consistent signal colors everywhere (similarity), keep chart axes directionally consistent (continuity).
2. **Visual Hierarchy** — Size > Color > Position. The most important datum on any screen (current signal, portfolio value) is the largest and most contrasted element.
3. **Fintech Dark Theme** — Dark navy/slate backgrounds reduce eye strain during extended trading sessions. Color is used with semantic precision, never decoratively.

### Color Tokens

```
Background:    #0f172a  (slate-950)  — page background, NOT pure black
Surface:       #1e293b  (slate-800)  — cards, panels
Elevated:      #334155  (slate-700)  — dropdowns, tooltips, hover states

Text primary:  #f1f5f9  (slate-100)  — main text, NOT pure white
Text secondary:#94a3b8  (slate-400)  — labels, timestamps, metadata
Text muted:    #64748b  (slate-500)  — disabled, hints

Accent:        #3b82f6  (blue-500)   — primary actions, links, focus rings

BUY:           #22c55e  (green-500)  — signal badge, profit, positive delta
BUY bg:        #052e16  (green-950)  — badge background
SELL:          #ef4444  (red-500)    — signal badge, loss, negative delta
SELL bg:       #450a0a  (red-950)    — badge background
HOLD:          #f59e0b  (amber-500)  — neutral signal, caution
```

**Rule:** Signal colors (green/red/amber) are NEVER used for decoration. They always mean BUY/SELL/HOLD.

### Typography

- **Prices & numbers** — `font-mono` — digits align vertically in tables
- **Headings** — `font-bold`, slate-100
- **Labels** — `text-xs uppercase tracking-wide`, slate-400
- **Body** — `text-sm`, slate-200

### Accessibility

- WCAG AA minimum 4.5:1 contrast ratio enforced
- All interactive elements keyboard-navigable (Radix UI handles this via shadcn)
- Color is never the sole signal differentiator — always paired with icon or text label

---

## App Layout

**Persistent sidebar** — fixed left nav with icon + label, main content to the right.

```
┌──────────────────────────────────────────────────────┐
│  Header: Logo | Notifications | User avatar           │
├──────────┬───────────────────────────────────────────┤
│  Sidebar │  Main Content Area                        │
│          │                                           │
│  📊 Dashboard       (default landing)                │
│  🔭 Watchlist       (user tickers)                   │
│  ⚡ Signals         (BUY/SELL/HOLD feed)              │
│  💼 Portfolio       (holdings + buy/sell)             │
│  🔔 Alerts          (signal alerts)                  │
│  📈 Market          (price charts + indicators)      │
│  🗣 Social          (Reddit/StockTwits posts)        │
│  📤 Export          (CSV/JSON download)              │
│  ⚙️  Admin           (admin role only)               │
└──────────┴───────────────────────────────────────────┘
```

---

## Component Map

### Pages (`src/pages/`)

| Page | Route | Description |
|---|---|---|
| `DashboardPage` | `/` | Overview: signal summary, watchlist mini-cards, portfolio snapshot, recent alerts |
| `WatchlistPage` | `/watchlist` | Ticker search + add, watchlist table with latest signal badge |
| `SignalsPage` | `/signals` | Paginated signal feed, filter by ticker/direction, signal explanation modal |
| `PortfolioPage` | `/portfolio` | Holdings table, buy/sell form, trade history, P&L |
| `AlertsPage` | `/alerts` | Alert feed, mark-read (admin: resolve), filter by ticker |
| `MarketPage` | `/market/:symbol` | Candlestick chart (lightweight-charts), SMA/RSI panel, live price ticker |
| `SocialPage` | `/social` | Social post feed, sentiment score badge, filter by ticker/source |
| `ExportPage` | `/export` | Form: ticker, date range, fields, format (CSV/JSON), download |
| `AdminPage` | `/admin` | Decision log, signal accuracy table, user list (admin only) |
| `LoginPage` | `/login` | JWT login form + GitHub/Google OAuth buttons |
| `NotFoundPage` | `*` | 404 |

### Layout (`src/components/layout/`)

| Component | Description |
|---|---|
| `AppShell` | Root layout: sidebar + header + outlet |
| `Sidebar` | Fixed left nav, active link highlighting, admin-gated item |
| `Header` | Logo, notification bell (alert count badge), user avatar + dropdown |
| `ProtectedRoute` | Redirects to `/login` if no valid JWT |
| `AdminRoute` | Renders 403 or redirects if role !== admin |

### Shared Components (`src/components/ui/`)

All from **shadcn/ui** (copy-paste into `src/components/ui/`):

`Button` `Badge` `Card` `CardHeader` `CardContent` `Table` `Dialog` `Sheet` `Select` `Input` `Tabs` `Skeleton` `Tooltip` `Popover` `DropdownMenu` `Avatar` `Separator` `Spinner` `Alert` `Progress` `Chart`

### Domain Components (`src/components/`)

| Component | Location | Description |
|---|---|---|
| `SignalBadge` | `signals/` | BUY/SELL/HOLD pill with color + icon |
| `SignalCard` | `signals/` | Signal snapshot: ticker, direction, score, timestamp |
| `SignalExplanationModal` | `signals/` | Dialog showing sentiment/momentum/consistency breakdown |
| `TickerSearch` | `tickers/` | Debounced search input → add to watchlist |
| `WatchlistTable` | `tickers/` | Sortable table of watchlist tickers + latest signal |
| `CandlestickChart` | `market/` | TradingView lightweight-charts wrapper, real-time via WebSocket |
| `PriceTickerBanner` | `market/` | Live scrolling price ticker (horizontal) |
| `IndicatorPanel` | `market/` | SMA / RSI charts below candlestick |
| `SocialPostCard` | `social/` | Post card: source icon, content, sentiment score badge |
| `SentimentBar` | `social/` | Visual bar: positive/neutral/negative proportion |
| `PortfolioSummary` | `portfolio/` | Total value, cash, P&L, % return |
| `HoldingsTable` | `portfolio/` | Position rows: ticker, qty, avg price, current, P&L |
| `TradeForm` | `portfolio/` | Buy/sell form with validation, submits to API |
| `TradeHistory` | `portfolio/` | Paginated trade log table |
| `AlertFeed` | `alerts/` | List of alert cards with severity + resolve button |
| `AlertBadge` | `alerts/` | Notification count pill used in Header |
| `AccuracyTable` | `admin/` | Signal accuracy per ticker (admin) |
| `DecisionLogTable` | `admin/` | Audit trail of engine decisions (admin) |
| `ExportForm` | `export/` | Controlled form for data export with field checkboxes |
| `StatCard` | `shared/` | Generic metric card: label + value + optional delta |
| `EmptyState` | `shared/` | Illustrated empty state for empty tables/feeds |
| `ErrorBoundary` | `shared/` | Catches render errors, shows fallback UI |

### Hooks (`src/hooks/`)

| Hook | Description |
|---|---|
| `useAuth` | JWT token read/write, user role, login/logout actions |
| `useSignals` | TanStack Query: paginated signal feed |
| `useWatchlist` | TanStack Query: watchlist tickers + add/remove mutations |
| `usePortfolio` | TanStack Query: portfolio + positions |
| `useTrades` | TanStack Query: trade history + buy/sell mutations |
| `useAlerts` | TanStack Query: alert feed + resolve mutation |
| `useSocialPosts` | TanStack Query: social post feed with filters |
| `useMarketData` | TanStack Query: price snapshots + indicators |
| `useLivePrice` | WebSocket hook: subscribes to Django Channels price stream |
| `useSignalStream` | WebSocket hook: subscribes to live signal events |

### API (`src/api/`)

| File | Covers |
|---|---|
| `client.js` | Axios instance with base URL + JWT interceptor (attach + refresh) |
| `auth.js` | login, refresh, logout, me |
| `tickers.js` | list, create, watchlist CRUD |
| `signals.js` | list, detail, explain |
| `portfolio.js` | portfolio, positions, buy, sell |
| `trades.js` | trade history |
| `alerts.js` | list, resolve |
| `social.js` | list posts |
| `market.js` | price snapshots, indicators |
| `export.js` | export request |
| `admin.js` | decision log, accuracy, user list |

### State (`src/store/`)

Minimal global state — kept in React Context, not Redux:

| Context | What it holds |
|---|---|
| `AuthContext` | `user`, `role`, `tokens`, `login()`, `logout()` |
| `ThemeContext` | `theme` (dark/light), `toggleTheme()` — dark default |

TanStack Query manages all server state. Context holds only truly global UI state.

---

## Installation

> The frontend is already scaffolded with React + Vite. This adds the full stack on top.

```bash
cd frontend

# 1. Install new dependencies
npm install \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  tailwindcss \
  @tailwindcss/vite \
  lightweight-charts \
  clsx \
  tailwind-merge \
  class-variance-authority \
  @radix-ui/react-slot \
  lucide-react

# 2. shadcn/ui init (installs components on demand)
npx shadcn@latest init

# 3. React Bits (install individual components)
# e.g.: npx jsrepo add @react-bits/BlurText
```

### Tailwind v4 config

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://localhost:8000', '/ws': { target: 'ws://localhost:8000', ws: true } } }
})
```

`src/index.css`:
```css
@import "tailwindcss";
```

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/               # Axios API layer
│   │   ├── client.js      # Base instance + interceptors
│   │   ├── auth.js
│   │   ├── tickers.js
│   │   ├── signals.js
│   │   ├── portfolio.js
│   │   ├── trades.js
│   │   ├── alerts.js
│   │   ├── social.js
│   │   ├── market.js
│   │   ├── export.js
│   │   └── admin.js
│   ├── components/
│   │   ├── ui/            # shadcn/ui components (generated)
│   │   ├── layout/        # AppShell, Sidebar, Header, route guards
│   │   ├── signals/       # SignalBadge, SignalCard, SignalExplanationModal
│   │   ├── tickers/       # TickerSearch, WatchlistTable
│   │   ├── market/        # CandlestickChart, PriceTickerBanner, IndicatorPanel
│   │   ├── portfolio/     # PortfolioSummary, HoldingsTable, TradeForm, TradeHistory
│   │   ├── alerts/        # AlertFeed, AlertBadge
│   │   ├── social/        # SocialPostCard, SentimentBar
│   │   ├── admin/         # AccuracyTable, DecisionLogTable
│   │   ├── export/        # ExportForm
│   │   └── shared/        # StatCard, EmptyState, ErrorBoundary
│   ├── hooks/             # Custom hooks (data + WebSocket)
│   ├── pages/             # One file per route
│   ├── store/             # AuthContext, ThemeContext
│   ├── lib/
│   │   └── utils.js       # cn() helper (clsx + tailwind-merge)
│   ├── App.jsx            # Router + QueryClientProvider + AuthProvider
│   ├── main.jsx           # ReactDOM.createRoot
│   └── index.css          # @import "tailwindcss" + CSS vars
├── index.html
├── vite.config.js
├── package.json
├── .eslintrc.cjs
└── .prettierrc
```

---

## Running

```bash
# From project root — start backend services first
docker-compose up -d db redis

# Start backend (in backend/)
uv run daphne config.asgi:application

# Start frontend
cd frontend
npm run dev           # http://localhost:5173
```

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

---

## Key Patterns

### Data fetching

```jsx
// Always via TanStack Query — never raw useEffect for REST
const { data, isLoading } = useQuery({
  queryKey: ['signals', { ticker, page }],
  queryFn: () => api.signals.list({ ticker, page }),
})
```

### Real-time (WebSocket)

```jsx
// useLivePrice connects on mount, cleans up on unmount
const { price, change } = useLivePrice(symbol)
```

### Signal colors

```jsx
// Centralized — never inline color logic
const SIGNAL_STYLES = {
  BUY:  'bg-green-950 text-green-500 border-green-800',
  SELL: 'bg-red-950 text-red-500 border-red-800',
  HOLD: 'bg-amber-950 text-amber-500 border-amber-800',
}
```

### Skeleton loading

All data-heavy components show `<Skeleton>` from shadcn while `isLoading` is true — never blank screens.

---

## References

- [shadcn/ui docs](https://ui.shadcn.com/docs)
- [React Bits](https://www.reactbits.dev)
- [TanStack Query v4](https://tanstack.com/query/v4)
- [TradingView lightweight-charts](https://tradingview.github.io/lightweight-charts/docs)
- [Tailwind CSS v4 + Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Recharts](https://recharts.org)
- [React Hooks reference](https://react.dev/reference/react/hooks)
