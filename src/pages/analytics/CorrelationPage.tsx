import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Icons, SectionLabel } from '@/components/design-system'
import { api } from '@/lib/api'
import { useData } from '@/hooks/useApi'

import { CorrelationMatrix } from '@/components/charts/CorrelationMatrix'
import { CorrelationPairsCard } from '@/components/cards/CorrelationPairsCard'

interface TickerItem { symbol: string; name: string }

interface CorrelationResult {
  symbols: string[]
  matrix:  number[][]
}

type ApiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: CorrelationResult }
  | { status: 'error'; message: string }

const WINDOWS = [
  { value: '7d',  label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]
const METRICS = [
  { value: 'price',     label: 'Price' },
  { value: 'sentiment', label: 'Sentiment' },
] as const

const PRESETS = [
  { label: 'Big Tech', symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'] },
  { label: 'EV & Auto', symbols: ['TSLA', 'RIVN', 'LCID', 'F', 'GM'] },
  { label: 'Crypto Proxies', symbols: ['COIN', 'MSTR', 'MARA', 'RIOT'] }
]

export function CorrelationPage() {
  const [symbols, setSymbols]           = useState<string[]>(['AAPL', 'TSLA', 'NVDA', 'MSFT'])
  const [inputValue, setInputValue]     = useState('')
  const [window, setWindow]             = useState('30d')
  const [metric, setMetric]             = useState<typeof METRICS[number]['value']>('price')
  const [state, setState]               = useState<ApiState>({ status: 'idle' })

  const { state: tickersState } = useData<TickerItem[]>('/api/tickers/')

  const fetchMatrix = useCallback(async (symsToFetch: string[] = symbols) => {
    if (symsToFetch.length < 2) {
      toast.error('Need at least 2 symbols')
      return
    }
    if (symsToFetch.length > 10) {
      toast.error('Maximum 10 symbols allowed')
      return
    }
    setState({ status: 'loading' })
    try {
      const data = await api.get<CorrelationResult>(
        `/api/analytics/correlation/?symbols=${symsToFetch.join(',')}&window=${window}&metric=${metric}`,
      )
      setState({ status: 'success', data })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to compute correlation'
      setState({ status: 'error', message: msg })
      toast.error(msg)
    }
  }, [symbols, window, metric])

  useEffect(() => { fetchMatrix() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSymbol = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return
    if ('key' in e) e.preventDefault()
    
    const newSyms = inputValue.split(/[,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean)
    if (newSyms.length === 0) return
    
    setSymbols(prev => {
      const combined = [...prev, ...newSyms]
      const unique = Array.from(new Set(combined))
      const limited = unique.slice(0, 10)
      if (unique.length > 10) toast.error('Maximum 10 symbols allowed')
      return limited
    })
    setInputValue('')
  }

  const handleRemoveSymbol = (sym: string) => {
    setSymbols(prev => prev.filter(s => s !== sym))
  }

  const handlePreset = (presetSymbols: string[]) => {
    setSymbols(presetSymbols)
    fetchMatrix(presetSymbols)
  }

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Correlation Matrix" subtitle="Analyze relationships between assets using rolling price or sentiment data." />

      {/* Controls */}
      <div className="card stack stack-5">
        <SectionLabel as="h2">Matrix Configuration</SectionLabel>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', alignItems: 'flex-end' }}>
          <div className="stack stack-1" style={{ flex: 2, minWidth: 280 }}>
            <label style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)' }}>
              Symbols (2–10)
            </label>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)',
              padding: 'var(--space-2)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
              minHeight: 42, alignItems: 'center'
            }}>
              {symbols.map(s => (
                <span key={s} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--surface-container-high)', padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-label-sm)',
                  fontFamily: 'var(--font-mono)', fontWeight: 600
                }}>
                  {s}
                  <button type="button" onClick={() => handleRemoveSymbol(s)} style={{
                    background: 'transparent', border: 'none', color: 'var(--on-surface-muted)',
                    cursor: 'pointer', display: 'flex', padding: 0
                  }}>
                    <Icons.X size={14} />
                  </button>
                </span>
              ))}
              <input
                list="tickers-list"
                value={inputValue}
                onChange={e => setInputValue(e.target.value.toUpperCase())}
                onKeyDown={handleAddSymbol}
                onBlur={handleAddSymbol}
                placeholder={symbols.length < 10 ? "Add ticker..." : ""}
                disabled={symbols.length >= 10 || state.status === 'loading'}
                style={{
                  flex: 1, minWidth: 100, background: 'transparent', border: 'none',
                  outline: 'none', color: 'var(--on-surface)', fontSize: 'var(--text-body-sm)'
                }}
              />
            </div>
            {tickersState.status === 'success' && (
              <datalist id="tickers-list">
                {tickersState.data.map(t => <option key={t.symbol} value={t.symbol}>{t.name}</option>)}
              </datalist>
            )}
          </div>
          
          <div className="stack stack-1">
            <label style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)' }}>Window</label>
            <select
              value={window}
              onChange={e => setWindow(e.target.value)}
              disabled={state.status === 'loading'}
              style={{
                padding: 'var(--space-2) var(--space-3)', height: 42,
                borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)',
                background: 'var(--surface-container-lowest)', color: 'var(--on-surface)',
                fontSize: 'var(--text-body-md)',
              }}
            >
              {WINDOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
          
          <div className="stack stack-1">
            <label style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: 'var(--on-surface-muted)' }}>Metric</label>
            <div className="cluster cluster-2" style={{ height: 42, alignItems: 'center' }}>
              {METRICS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMetric(m.value)}
                  className={`btn btn-sm ${metric === m.value ? 'btn-primary' : 'btn-ghost'}`}
                  disabled={state.status === 'loading'}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={() => fetchMatrix()} disabled={state.status === 'loading'} style={{ height: 42 }}>
            {state.status === 'loading' ? 'Computing…' : 'Compute Matrix'}
          </button>
        </div>

        {/* Presets */}
        <div className="cluster cluster-3" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>Presets:</span>
          {PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => handlePreset(p.symbols)}
              disabled={state.status === 'loading'}
              style={{ fontSize: 'var(--text-label-sm)' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Area */}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={() => fetchMatrix()} />}
      {(state.status === 'idle' || state.status === 'loading') && <Skeleton className="h-80 w-full" />}
      {state.status === 'success' && state.data.symbols.length === 0 && (
        <EmptyState title="No data" description="Try different symbols or a longer window." />
      )}
      
      {state.status === 'success' && state.data.symbols.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
          <CorrelationMatrix symbols={state.data.symbols} matrix={state.data.matrix} />
          <CorrelationPairsCard symbols={state.data.symbols} matrix={state.data.matrix} />
        </div>
      )}
    </div>
  )
}
