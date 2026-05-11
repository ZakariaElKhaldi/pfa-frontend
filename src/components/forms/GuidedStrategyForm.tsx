import { useMemo, useState } from 'react'

import type { ActionType, ConditionField, ConditionOperator, StrategyAction, StrategyCondition } from './StrategyFlow/types'

export interface StrategyTickerOption {
  id: number
  symbol: string
  name: string
}

export interface GuidedStrategyFormValues {
  name: string
  desc: string
  tickers: number[]
  conditions: StrategyCondition[]
  actions: StrategyAction[]
}

interface GuidedStrategyFormProps {
  initial?: Partial<GuidedStrategyFormValues>
  tickerOptions: StrategyTickerOption[]
  onSubmit: (values: GuidedStrategyFormValues) => void
  loading?: boolean
  error?: string
}

const STEPS = ['Basics', 'Tickers', 'Rules', 'Actions + Review'] as const

const FIELD_LABELS: Record<ConditionField, string> = {
  sentiment_score: 'Sentiment score',
  signal: 'Signal',
  rsi: 'RSI',
  sma_20: 'SMA 20',
  ema_50: 'EMA 50',
  volume_change: 'Volume change',
  bollinger_position: 'Bollinger position',
  macd_signal: 'MACD signal',
  alert_type: 'Alert type',
  mood: 'Market mood',
  price: 'Price',
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  gt: 'greater than',
  lt: 'less than',
  gte: 'greater than or equal to',
  lte: 'less than or equal to',
  eq: 'equals',
  neq: 'does not equal',
  contains: 'contains',
  crosses_above: 'crosses above',
  crosses_below: 'crosses below',
}

const ACTION_LABELS: Record<ActionType, string> = {
  notify: 'In-app notification',
  email: 'Email',
  webhook: 'Webhook',
  log: 'Log',
  auto_trade: 'Auto trade',
}

const CONDITION_FIELDS = Object.keys(FIELD_LABELS) as ConditionField[]
const CONDITION_OPERATORS = Object.keys(OPERATOR_LABELS) as ConditionOperator[]
const ACTION_TYPES: ActionType[] = ['notify', 'email', 'webhook', 'log']

function defaultCondition(): StrategyCondition {
  return { field: 'sentiment_score', operator: 'gt', value: '' }
}

function defaultAction(): StrategyAction {
  return { actionType: 'notify', target: '' }
}

function conditionSummary(condition: StrategyCondition) {
  return `${FIELD_LABELS[condition.field]} ${OPERATOR_LABELS[condition.operator]} ${condition.value || '[value]'}`
}

function actionSummary(action: StrategyAction) {
  const target = action.target ? ` to ${action.target}` : ''
  return `${ACTION_LABELS[action.actionType]}${target}`
}

export function GuidedStrategyForm({ initial = {}, tickerOptions, onSubmit, loading, error }: GuidedStrategyFormProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(initial.name ?? '')
  const [desc, setDesc] = useState(initial.desc ?? '')
  const [selectedTickers, setSelectedTickers] = useState<number[]>(initial.tickers ?? [])
  const [tickerQuery, setTickerQuery] = useState('')
  const [conditions, setConditions] = useState<StrategyCondition[]>(
    initial.conditions && initial.conditions.length > 0 ? initial.conditions : [defaultCondition()],
  )
  const [actions, setActions] = useState<StrategyAction[]>(
    initial.actions && initial.actions.length > 0 ? initial.actions : [defaultAction()],
  )
  const [localError, setLocalError] = useState<string | null>(null)

  const tickerById = useMemo(() => new Map(tickerOptions.map(ticker => [ticker.id, ticker])), [tickerOptions])
  const filteredTickers = useMemo(() => {
    const query = tickerQuery.trim().toLowerCase()
    if (!query) return tickerOptions.slice(0, 80)
    return tickerOptions
      .filter(ticker => `${ticker.symbol} ${ticker.name}`.toLowerCase().includes(query))
      .slice(0, 80)
  }, [tickerOptions, tickerQuery])

  const selectedTickerLabels = selectedTickers
    .map(id => tickerById.get(id)?.symbol)
    .filter((symbol): symbol is string => Boolean(symbol))

  const validateStep = (targetStep = step): string | null => {
    if (targetStep === 0 && !name.trim()) return 'Name is required.'
    if (targetStep === 2) {
      if (conditions.length === 0) return 'Add at least one condition.'
      if (conditions.some(condition => !String(condition.value).trim())) return 'Each condition needs a value.'
    }
    if (targetStep === 3) {
      const ruleError: string | null = validateStep(2)
      if (ruleError) return ruleError
      if (actions.length === 0) return 'Add at least one action.'
    }
    return null
  }

  const goNext = () => {
    const message = validateStep()
    if (message) {
      setLocalError(message)
      return
    }
    setLocalError(null)
    setStep(current => Math.min(current + 1, STEPS.length - 1))
  }

  const handleSubmit = () => {
    const basicsError = validateStep(0)
    const rulesError = validateStep(2)
    const reviewError = validateStep(3)
    const message = basicsError ?? rulesError ?? reviewError
    if (message) {
      setLocalError(message)
      return
    }
    setLocalError(null)
    onSubmit({
      name: name.trim(),
      desc: desc.trim(),
      tickers: selectedTickers,
      conditions,
      actions,
    })
  }

  const updateCondition = (index: number, patch: Partial<StrategyCondition>) => {
    setConditions(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  const updateAction = (index: number, patch: Partial<StrategyAction>) => {
    setActions(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  const toggleTicker = (id: number) => {
    setSelectedTickers(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id])
  }

  return (
    <div className="stack stack-5">
      <div className="cluster cluster-2" style={{ flexWrap: 'wrap' }}>
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`btn btn-sm ${step === index ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              if (index <= step) setStep(index)
            }}
            disabled={index > step}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {(error || localError) && (
        <div role="alert" className="text-body-sm" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--tertiary-container)', color: 'var(--tertiary)' }}>
          {localError ?? error}
        </div>
      )}

      {step === 0 && (
        <div className="stack stack-4">
          <label className="stack stack-2">
            <span className="text-label">Strategy name</span>
            <input className="input" value={name} onChange={event => setName(event.target.value)} placeholder="Bullish momentum alert" />
          </label>
          <label className="stack stack-2">
            <span className="text-label">Description</span>
            <textarea className="input" value={desc} onChange={event => setDesc(event.target.value)} rows={4} placeholder="What this strategy watches for" />
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="stack stack-4">
          <label className="stack stack-2">
            <span className="text-label">Search tickers</span>
            <input className="input" value={tickerQuery} onChange={event => setTickerQuery(event.target.value)} placeholder="AAPL, Tesla, SPY" />
          </label>
          <div className="text-body-sm text-muted">
            {selectedTickers.length === 0 ? 'No tickers selected. This strategy will apply to all tickers.' : `${selectedTickers.length} ticker${selectedTickers.length === 1 ? '' : 's'} selected.`}
          </div>
          <div className="cluster cluster-2" style={{ flexWrap: 'wrap' }}>
            {selectedTickerLabels.map(symbol => <span key={symbol} className="tag">{symbol}</span>)}
          </div>
          <div className="stack stack-2" style={{ maxHeight: 280, overflow: 'auto', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)' }}>
            {filteredTickers.map(ticker => (
              <label key={ticker.id} className="cluster cluster-3" style={{ justifyContent: 'space-between', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)' }}>
                <span className="stack stack-1">
                  <span className="text-label">{ticker.symbol}</span>
                  <span className="text-body-sm text-muted">{ticker.name}</span>
                </span>
                <input type="checkbox" checked={selectedTickers.includes(ticker.id)} onChange={() => toggleTicker(ticker.id)} />
              </label>
            ))}
            {filteredTickers.length === 0 && <div className="text-body-sm text-muted" style={{ padding: 'var(--space-3)' }}>No tickers found.</div>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack stack-4">
          {conditions.map((condition, index) => (
            <div key={index} className="stack stack-3" style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
              <div className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
                <span className="text-label">Condition {index + 1}</span>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConditions(items => items.filter((_, itemIndex) => itemIndex !== index))} disabled={conditions.length === 1}>
                  Remove
                </button>
              </div>
              <div className="cluster cluster-3" style={{ alignItems: 'end' }}>
                <label className="stack stack-1" style={{ flex: 1, minWidth: 180 }}>
                  <span className="text-label">Field</span>
                  <select className="input" value={condition.field} onChange={event => updateCondition(index, { field: event.target.value as ConditionField })}>
                    {CONDITION_FIELDS.map(field => <option key={field} value={field}>{FIELD_LABELS[field]}</option>)}
                  </select>
                </label>
                <label className="stack stack-1" style={{ flex: 1, minWidth: 180 }}>
                  <span className="text-label">Operator</span>
                  <select className="input" value={condition.operator} onChange={event => updateCondition(index, { operator: event.target.value as ConditionOperator })}>
                    {CONDITION_OPERATORS.map(operator => <option key={operator} value={operator}>{OPERATOR_LABELS[operator]}</option>)}
                  </select>
                </label>
                <label className="stack stack-1" style={{ flex: 1, minWidth: 160 }}>
                  <span className="text-label">Value</span>
                  <input className="input" value={condition.value} onChange={event => updateCondition(index, { value: event.target.value })} />
                </label>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setConditions(items => [...items, defaultCondition()])}>
            Add Condition
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="stack stack-5">
          <div className="stack stack-4">
            {actions.map((action, index) => (
              <div key={index} className="stack stack-3" style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                <div className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
                  <span className="text-label">Action {index + 1}</span>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setActions(items => items.filter((_, itemIndex) => itemIndex !== index))} disabled={actions.length === 1}>
                    Remove
                  </button>
                </div>
                <div className="cluster cluster-3" style={{ alignItems: 'end' }}>
                  <label className="stack stack-1" style={{ flex: 1, minWidth: 180 }}>
                    <span className="text-label">Action</span>
                    <select className="input" value={action.actionType} onChange={event => updateAction(index, { actionType: event.target.value as ActionType })}>
                      {ACTION_TYPES.map(actionType => <option key={actionType} value={actionType}>{ACTION_LABELS[actionType]}</option>)}
                    </select>
                  </label>
                  <label className="stack stack-1" style={{ flex: 2, minWidth: 220 }}>
                    <span className="text-label">Target</span>
                    <input className="input" value={action.target ?? ''} onChange={event => updateAction(index, { target: event.target.value })} placeholder="Optional destination" />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setActions(items => [...items, defaultAction()])}>
              Add Action
            </button>
          </div>

          <div className="stack stack-3" style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            <span className="text-headline-sm">Review</span>
            <div className="text-body-sm"><strong>Name:</strong> {name || 'Untitled strategy'}</div>
            <div className="text-body-sm"><strong>Tickers:</strong> {selectedTickerLabels.length > 0 ? selectedTickerLabels.join(', ') : 'All tickers'}</div>
            <div className="text-body-sm"><strong>Rules:</strong> {conditions.map(conditionSummary).join(' AND ')}</div>
            <div className="text-body-sm"><strong>Actions:</strong> {actions.map(actionSummary).join(', ')}</div>
            <div className="text-body-sm text-muted">Strategies are saved inactive. Activate after reviewing the strategy card.</div>
          </div>
        </div>
      )}

      <div className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setLocalError(null); setStep(current => Math.max(current - 1, 0)) }} disabled={step === 0 || loading}>
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn-sm btn-primary" onClick={goNext} disabled={loading}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn btn-sm btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Strategy'}
          </button>
        )}
      </div>
    </div>
  )
}
