import { Icons } from '@/components/design-system'

interface TopbarProps {
  title: string
  search: string
  onSearchChange: (v: string) => void
}

export function Topbar({ title, search, onSearchChange }: TopbarProps) {
  return (
    <header className="topbar" role="banner">
      <div>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-actions">
        <div className="input-search-wrapper" style={{ width: 220 }}>
          <span className="input-search-icon"><Icons.Search size={16} /></span>
          <input
            className="input"
            type="search"
            placeholder="Search tickers…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search tickers"
            style={{ height: 36, fontSize: 'var(--text-body-sm)' }}
          />
        </div>
        <button className="btn-icon btn btn-secondary" aria-label="Notifications">
          <Icons.Bell size={18} />
        </button>
        <div className="avatar avatar-md" aria-label="User: ZK">ZK</div>
      </div>
    </header>
  )
}
