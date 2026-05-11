import { useMemo, useState } from 'react'
import {
  QueryBuilder,
  type Field,
  type RuleGroupType,
  type RuleType,
} from 'react-querybuilder'
import 'react-querybuilder/dist/query-builder.css'

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
const ACTION_TYPES: ActionType[] = ['notify', 'email', 'webhook', 'log']
const NUMERIC_FIELDS: ConditionField[] = ['sentiment_score', 'rsi', 'sma_20', 'ema_50', 'volume_change', 'bollinger_position', 'price']
const ENUM_VALUES: Partial<Record<ConditionField, { name: string; label: string }[]>> = {
  signal: [
    { name: 'BUY', label: 'BUY' },
    { name: 'SELL', label: 'SELL' },
    { name: 'HOLD', label: 'HOLD' },
  ],
  alert_type: [
    { name: 'divergence', label: 'Divergence' },
    { name: 'extreme_sentiment', label: 'Extreme sentiment' },
    { name: 'hype_fade', label: 'Hype fade' },
    { name: 'pump_suspected', label: 'Pump suspected' },
  ],
  mood: [
    { name: 'bullish', label: 'Bullish' },
    { name: 'bearish', label: 'Bearish' },
    { name: 'uncertain', label: 'Uncertain' },
    { name: 'euphoric', label: 'Euphoric' },
    { name: 'panic', label: 'Panic' },
  ],
  macd_signal: [
    { name: 'bullish', label: 'Bullish' },
    { name: 'bearish', label: 'Bearish' },
    { name: 'neutral', label: 'Neutral' },
  ],
}
const NUMERIC_OPERATORS = ['gt', 'gte', 'lt', 'lte', 'eq', 'neq'] as ConditionOperator[]
const ENUM_OPERATORS = ['eq', 'neq'] as ConditionOperator[]
type LocalValidation = true | { valid: boolean; reasons?: string[] }

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

function conditionsToQuery(conditions: StrategyCondition[]): RuleGroupType {
  const combinator = conditions.some(condition => condition.logical_op === 'OR') ? 'or' : 'and'
  return {
    combinator,
    rules: conditions.length > 0
      ? conditions.map(condition => ({
          field: condition.field,
          operator: condition.operator,
          value: String(condition.value ?? ''),
        }))
      : [{ field: 'sentiment_score', operator: 'gt', value: '' }],
  }
}

function isRule(rule: RuleGroupType['rules'][number]): rule is RuleType {
  return typeof rule === 'object' && rule !== null && 'field' in rule
}

function queryToConditions(query: RuleGroupType): StrategyCondition[] {
  return query.rules
    .filter(isRule)
    .map(rule => ({
      field: rule.field as ConditionField,
      operator: rule.operator as ConditionOperator,
      value: String(rule.value ?? ''),
      logical_op: query.combinator === 'or' ? 'OR' : 'AND',
    }))
}

function validateRule(rule: RuleType): LocalValidation {
  const field = rule.field as ConditionField
  const operator = rule.operator as ConditionOperator
  const value = String(rule.value ?? '').trim()
  if (!value) return { valid: false, reasons: ['Enter a value.'] }
  if (NUMERIC_FIELDS.includes(field) && !NUMERIC_OPERATORS.includes(operator)) {
    return { valid: false, reasons: [`${OPERATOR_LABELS[operator]} is not valid for ${FIELD_LABELS[field]}.`] }
  }
  if (NUMERIC_FIELDS.includes(field) && Number.isNaN(Number(value))) {
    return { valid: false, reasons: [`${FIELD_LABELS[field]} needs a number.`] }
  }
  const enumValues = ENUM_VALUES[field]
  if (enumValues) {
    if (!ENUM_OPERATORS.includes(operator)) {
      return { valid: false, reasons: [`${FIELD_LABELS[field]} only supports equals or does not equal.`] }
    }
    if (!enumValues.some(option => option.name === value)) {
      return { valid: false, reasons: [`Choose a valid ${FIELD_LABELS[field]} value.`] }
    }
  }
  if (operator === 'crosses_above' || operator === 'crosses_below') {
    return { valid: false, reasons: ['Crossing rules need prior-value support and are disabled for now.'] }
  }
  return true
}

function validateQuery(query: RuleGroupType): LocalValidation {
  if (!query.combinator) return { valid: false, reasons: ['Choose whether rules match all or any conditions.'] }
  if (query.rules.length === 0) return { valid: false, reasons: ['Add at least one condition.'] }
  if (query.rules.some(rule => !isRule(rule))) {
    return { valid: false, reasons: ['Nested groups are not supported by the current strategy engine.'] }
  }
  for (const rule of query.rules) {
    const result = validateRule(rule as RuleType)
    if (result !== true && result.valid === false) return result
  }
  return true
}

function validationMessage(result: LocalValidation): string | null {
  if (result === true || result.valid) return null
  return result.reasons?.[0] ?? 'Fix the highlighted strategy rule.'
}

const QUERY_FIELDS: Field[] = CONDITION_FIELDS.map(field => ({
  name: field,
  label: FIELD_LABELS[field],
}))

export function GuidedStrategyForm({ initial = {}, tickerOptions, onSubmit, loading, error }: GuidedStrategyFormProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(initial.name ?? '')
  const [desc, setDesc] = useState(initial.desc ?? '')
  const [selectedTickers, setSelectedTickers] = useState<number[]>(initial.tickers ?? [])
  const [tickerQuery, setTickerQuery] = useState('')
  const [conditions, setConditions] = useState<StrategyCondition[]>(
    initial.conditions && initial.conditions.length > 0 ? initial.conditions : [defaultCondition()],
  )
  const [query, setQuery] = useState<RuleGroupType>(() => conditionsToQuery(initial.conditions && initial.conditions.length > 0 ? initial.conditions : [defaultCondition()]))
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
      const ruleError = validationMessage(validateQuery(query))
      if (ruleError) return ruleError
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
    const finalConditions = queryToConditions(query)
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
      conditions: finalConditions,
      actions,
    })
  }

  const updateAction = (index: number, patch: Partial<StrategyAction>) => {
    setActions(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  const toggleTicker = (id: number) => {
    setSelectedTickers(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id])
  }

  const selectVisibleTickers = () => {
    setSelectedTickers(items => Array.from(new Set([...items, ...filteredTickers.map(ticker => ticker.id)])))
  }

  const clearSelectedTickers = () => {
    setSelectedTickers([])
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
        <div className="strategy-ticker-step">
          <div className="strategy-ticker-toolbar">
            <label className="stack stack-2" style={{ flex: 1, minWidth: 260 }}>
              <span className="text-label">Search tickers</span>
              <input className="input" value={tickerQuery} onChange={event => setTickerQuery(event.target.value)} placeholder="AAPL, Tesla, SPY" />
            </label>
            <div className="cluster cluster-2" style={{ alignSelf: 'end' }}>
              <button type="button" className="btn btn-sm btn-secondary" onClick={selectVisibleTickers} disabled={filteredTickers.length === 0}>
                Select visible
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={clearSelectedTickers} disabled={selectedTickers.length === 0}>
                Clear
              </button>
            </div>
          </div>

          <div className="strategy-selection-panel">
            <div className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
              <span className="text-label">
                {selectedTickers.length === 0 ? 'Applies to all tickers' : `${selectedTickers.length} selected`}
              </span>
              {selectedTickers.length === 0 && <span className="text-body-sm text-muted">Leave empty to watch the full universe.</span>}
            </div>
            {selectedTickerLabels.length > 0 && (
              <div className="cluster cluster-2" style={{ flexWrap: 'wrap' }}>
                {selectedTickerLabels.map(symbol => <span key={symbol} className="tag">{symbol}</span>)}
              </div>
            )}
          </div>

          <div className="strategy-ticker-list">
            {filteredTickers.map(ticker => (
              <label key={ticker.id} className={selectedTickers.includes(ticker.id) ? 'strategy-ticker-row is-selected' : 'strategy-ticker-row'}>
                <span className="strategy-ticker-symbol">
                  <span>{ticker.symbol}</span>
                  <span className="text-body-sm text-muted">{ticker.name}</span>
                </span>
                <input type="checkbox" checked={selectedTickers.includes(ticker.id)} onChange={() => toggleTicker(ticker.id)} aria-label={`Select ${ticker.symbol}`} />
              </label>
            ))}
            {filteredTickers.length === 0 && <div className="text-body-sm text-muted" style={{ padding: 'var(--space-3)' }}>No tickers found.</div>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack stack-4">
          <div className="strategy-query-builder">
            <QueryBuilder
              fields={QUERY_FIELDS}
              query={query}
              onQueryChange={(nextQuery) => {
                setQuery(nextQuery)
                setConditions(queryToConditions(nextQuery))
              }}
              operators={Object.entries(OPERATOR_LABELS).map(([name, label]) => ({ name, label }))}
              getOperators={(field) => {
                const typedField = field as ConditionField
                const allowed = ENUM_VALUES[typedField] ? ENUM_OPERATORS : NUMERIC_OPERATORS
                return allowed.map(operator => ({ name: operator, label: OPERATOR_LABELS[operator] }))
              }}
              getValueEditorType={(field) => ENUM_VALUES[field as ConditionField] ? 'select' : 'text'}
              getInputType={(field) => NUMERIC_FIELDS.includes(field as ConditionField) ? 'number' : 'text'}
              getValues={(field) => ENUM_VALUES[field as ConditionField] ?? []}
              validator={validateQuery as never}
              controlElements={{ addGroupAction: () => null }}
              translations={{
                addRule: { label: 'Add condition', title: 'Add condition' },
                removeRule: { label: 'Remove', title: 'Remove condition' },
                combinators: { title: 'Match mode' },
                fields: { title: 'Metric' },
                operators: { title: 'Operator' },
                value: { title: 'Value' },
              }}
            />
          </div>
          {validationMessage(validateQuery(query)) && (
            <div className="text-body-sm" style={{ color: 'var(--tertiary)' }}>
              {validationMessage(validateQuery(query))}
            </div>
          )}
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
            <div className="text-body-sm"><strong>Rules:</strong> {conditions.map(conditionSummary).join(query.combinator === 'or' ? ' OR ' : ' AND ')}</div>
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
