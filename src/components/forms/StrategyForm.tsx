// Re-export the new visual flow builder under the old name for backward compatibility
// This avoids breaking any imports in the rest of the application
export * from './StrategyFlow'
export { StrategyFlowBuilder as StrategyForm } from './StrategyFlow'
export type { StrategyFlowBuilderProps as StrategyFormProps, StrategyFlowBuilderValues as StrategyFormValues } from './StrategyFlow'
export type { StrategyCondition, StrategyAction } from './StrategyFlow/types'

// Re-defining StrategyCondition and StrategyAction interfaces here so the export matches what parents expect
import type { ConditionField, ConditionOperator, ActionType } from './StrategyFlow/types'

export interface StrategyCondition {
  field:    ConditionField
  operator: ConditionOperator
  value:    string | number
}

export interface StrategyAction {
  actionType: ActionType
  target?:    string
}
