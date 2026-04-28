import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icons } from '@/components/design-system'
import type { TriggerNodeData } from '../types'

export function TriggerNode({ data }: { data: TriggerNodeData }) {
  const [tickerInput, setTickerInput] = useState('')

  function handleAddTicker() {
    const sym = tickerInput.trim().toUpperCase()
    if (!sym) return
    data.onAddTicker(sym)
    setTickerInput('')
  }

  return (
    <div
      className="card card-elevated"
      style={{
        width: 320,
        padding: 'var(--space-4)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-container)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <div style={{ padding: 4, background: 'var(--primary-container)', color: 'var(--on-primary-container)', borderRadius: 'var(--radius-sm)' }}>
          <Icons.Zap size={16} />
        </div>
        <span className="text-title-md font-semibold text-primary">Strategy Trigger</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label>Name</Label>
          <Input
            value={data.name}
            onChange={(e) => data.onNameChange(e.target.value)}
            placeholder="e.g. Bullish momentum"
            className="nodrag"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Description</Label>
          <Textarea
            value={data.desc}
            onChange={(e) => data.onDescChange(e.target.value)}
            placeholder="What does this do?"
            rows={2}
            className="nodrag"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label>Tickers</Label>
          {data.tickers.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
              {data.tickers.map((t) => (
                <span
                  key={t}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-container-high)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-label-sm)',
                    color: 'var(--on-surface)',
                  }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => data.onRemoveTicker(t)}
                    aria-label={`Remove ${t}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--on-surface-muted)', lineHeight: 1 }}
                  >
                    <Icons.X size={10} aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Input
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTicker()
                }
              }}
              placeholder="AAPL"
              style={{ textTransform: 'uppercase', flex: 1 }}
              className="nodrag"
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddTicker}
              disabled={!tickerInput.trim()}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: 'var(--primary)' }} />
    </div>
  )
}
