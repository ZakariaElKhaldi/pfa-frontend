import type { Node } from '@xyflow/react'

export type ConditionField =
  | 'sentiment_score'
  | 'signal'
  | 'rsi'
  | 'sma_20'
  | 'ema_50'
  | 'volume_change'
  | 'bollinger_position'
  | 'macd_signal'
  | 'alert_type'
  | 'mood'
  | 'price'

export type ConditionOperator =
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'eq'
  | 'neq'
  | 'contains'
  | 'crosses_above'
  | 'crosses_below'

export type ActionType = 'notify' | 'email' | 'webhook' | 'log' | 'auto_trade'

export const CONDITION_FIELDS: ConditionField[] = [
  'sentiment_score', 'signal', 'rsi', 'sma_20', 'ema_50',
  'volume_change', 'bollinger_position', 'macd_signal', 'alert_type', 'mood', 'price',
]

export const CONDITION_OPERATORS: ConditionOperator[] = [
  'gt', 'lt', 'gte', 'lte', 'eq', 'neq', 'contains', 'crosses_above', 'crosses_below',
]

export const OP_LABELS: Record<ConditionOperator, string> = {
  gt: '>', lt: '<', gte: '≥', lte: '≤', eq: '=', neq: '≠',
  contains: '∋', crosses_above: '↑ crosses', crosses_below: '↓ crosses',
}

export const ACTION_TYPES: ActionType[] = ['notify', 'email', 'webhook', 'log', 'auto_trade']

export const ACTION_LABELS: Record<ActionType, string> = {
  notify: 'Notify', email: 'Email', webhook: 'Webhook', log: 'Log', auto_trade: 'Auto-Trade (post-MVP)',
}

export interface StrategyCondition {
  field: ConditionField
  operator: ConditionOperator
  value: string | number
}

export interface StrategyAction {
  actionType: ActionType
  target?: string
}

// ── Node Data Types ─────────────────────────────────────────────────────────

export interface TriggerNodeData extends Record<string, unknown> {
  name: string
  desc: string
  tickers: string[]
  onNameChange: (val: string) => void
  onDescChange: (val: string) => void
  onAddTicker: (val: string) => void
  onRemoveTicker: (val: string) => void
}

export interface ConditionNodeData extends Record<string, unknown> {
  field: ConditionField
  operator: ConditionOperator
  value: string | number
  onFieldChange: (val: ConditionField) => void
  onOperatorChange: (val: ConditionOperator) => void
  onValueChange: (val: string) => void
  onDelete: () => void
}

export interface ActionNodeData extends Record<string, unknown> {
  actionType: ActionType
  target?: string
  onActionTypeChange: (val: ActionType) => void
  onTargetChange: (val: string) => void
  onDelete: () => void
}

// React Flow strongly typed nodes
export type TriggerAppNode = Node<TriggerNodeData, 'trigger'>
export type ConditionAppNode = Node<ConditionNodeData, 'condition'>
export type ActionAppNode = Node<ActionNodeData, 'action'>

export type StrategyAppNode = TriggerAppNode | ConditionAppNode | ActionAppNode
