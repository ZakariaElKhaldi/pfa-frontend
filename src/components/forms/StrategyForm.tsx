// Re-export the new visual flow builder under the old name for backward compatibility
// This avoids breaking any imports in the rest of the application
export * from './StrategyFlow'
export { StrategyFlowBuilder as StrategyForm } from './StrategyFlow'
export type { StrategyFlowBuilderProps as StrategyFormProps, StrategyFlowBuilderValues as StrategyFormValues } from './StrategyFlow'
export type { StrategyCondition, StrategyAction } from './StrategyFlow/types'
