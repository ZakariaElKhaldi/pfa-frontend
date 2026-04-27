import { useState, useRef, useEffect } from 'react'
import { Icons } from '@/components/design-system'

export interface TickerResult {
  symbol: string
  name: string
}

interface TickerSearchProps {
  results?: TickerResult[]
  loading?: boolean
  onSearch: (q: string) => void
  onSelect: (ticker: TickerResult) => void
  placeholder?: string
}

export function TickerSearch({
  results = [],
  loading,
  onSearch,
  onSelect,
  placeholder = 'Search ticker…',
}: TickerSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    onSearch(v)
    setOpen(v.length > 0)
  }

  function handleSelect(ticker: TickerResult) {
    setQuery(ticker.symbol)
    setOpen(false)
    onSelect(ticker)
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div className="input-wrapper" style={{ position: 'relative' }}>
        <Icons.Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-muted)', pointerEvents: 'none' }} />
        <input
          className="input"
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          style={{ paddingLeft: 'var(--space-8)' }}
        />
        {loading && (
          <span className="spinner spinner-sm" aria-hidden="true" style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)' }} />
        )}
      </div>
      {open && results.length > 0 && (
        <ul
          role="listbox"
          aria-label="Ticker results"
          style={{
            position:   'absolute',
            top:        'calc(100% + var(--space-1))',
            left:       0,
            right:      0,
            background: 'var(--surface-container-lowest)',
            border:     '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-md)',
            boxShadow:  'var(--shadow-md)',
            zIndex:     'var(--z-dropdown)' as never,
            listStyle:  'none',
            margin:     0,
            padding:    'var(--space-1) 0',
            maxHeight:  240,
            overflowY:  'auto',
          }}
        >
          {results.map(r => (
            <li key={r.symbol}>
              <button
                role="option"
                className="ticker-search-option"
                onClick={() => handleSelect(r)}
                style={{
                  display:     'flex',
                  width:       '100%',
                  gap:         'var(--space-3)',
                  padding:     'var(--space-2) var(--space-4)',
                  background:  'transparent',
                  border:      'none',
                  cursor:      'pointer',
                  textAlign:   'left',
                  alignItems:  'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span className="text-title-md" style={{ fontFamily: 'var(--font-mono)', minWidth: 60 }}>{r.symbol}</span>
                <span className="text-body-sm text-muted truncate">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
