import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
} from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/design-system'

import { TriggerNode } from './nodes/TriggerNode'
import { ConditionNode } from './nodes/ConditionNode'
import { ActionNode } from './nodes/ActionNode'
import type { StrategyCondition, StrategyAction } from '../StrategyForm'
import type {
  ConditionField,
  ConditionOperator,
  ActionType,
  StrategyAppNode,
} from './types'

// ── Types ───────────────────────────────────────────────────────────────────
// We re-export the interface expected by parents
export interface StrategyFlowBuilderValues {
  name: string
  desc: string
  tickers: string[]
  conditions: StrategyCondition[]
  actions: StrategyAction[]
}

export interface StrategyFlowBuilderProps {
  initial?: Partial<StrategyFlowBuilderValues>
  onSubmit: (values: StrategyFlowBuilderValues) => void
  loading?: boolean
  error?: string
}

// ── Layout Constants ─────────────────────────────────────────────────────────
const X_START = 100
const Y_START = 50
const Y_GAP = 220

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
}

// ── Component ───────────────────────────────────────────────────────────────
export function StrategyFlowBuilder({ initial = {}, onSubmit, loading, error }: StrategyFlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<StrategyAppNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [localError, setLocalError] = useState<string | null>(null)

  // Derived state to track values inside nodes without constantly re-rendering the whole graph
  // We'll update the node `data` directly when inputs change.
  const updateNodeData = useCallback((id: string, partialData: Record<string, any>) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, ...partialData } } as StrategyAppNode
      }
      return n
    }))
  }, [setNodes])

  const initNodesAndEdges = useCallback(() => {
    let currY = Y_START
    const newNodes: StrategyAppNode[] = []
    const newEdges: Edge[] = []
    let lastNodeId = 'trigger-1'

    // 1. Trigger Node
    newNodes.push({
      id: lastNodeId,
      type: 'trigger',
      position: { x: X_START, y: currY },
      data: {
        name: initial.name ?? '',
        desc: initial.desc ?? '',
        tickers: initial.tickers ?? [],
        onNameChange: (val: string) => updateNodeData('trigger-1', { name: val }),
        onDescChange: (val: string) => updateNodeData('trigger-1', { desc: val }),
        onAddTicker: (val: string) => setNodes((nds) => nds.map(n => n.id === 'trigger-1' && n.type === 'trigger' && !n.data.tickers.includes(val) ? { ...n, data: { ...n.data, tickers: [...n.data.tickers, val] } } : n)),
        onRemoveTicker: (val: string) => setNodes((nds) => nds.map(n => n.id === 'trigger-1' && n.type === 'trigger' ? { ...n, data: { ...n.data, tickers: n.data.tickers.filter((t: string) => t !== val) } } : n)),
      },
    })
    currY += Y_GAP

    // 2. Condition Nodes
    const initConditions = initial.conditions ?? []
    initConditions.forEach((cond) => {
      const id = `cond-${uuidv4()}`
      newNodes.push({
        id,
        type: 'condition',
        position: { x: X_START, y: currY },
        data: {
          field: cond.field,
          operator: cond.operator,
          value: cond.value,
          onFieldChange: (val: ConditionField) => updateNodeData(id, { field: val }),
          onOperatorChange: (val: ConditionOperator) => updateNodeData(id, { operator: val }),
          onValueChange: (val: string) => updateNodeData(id, { value: val }),
          onDelete: () => {
            setNodes((nds) => nds.filter((n) => n.id !== id))
            setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
          },
        },
      })
      newEdges.push({
        id: `e-${lastNodeId}-${id}`,
        source: lastNodeId,
        sourceHandle: 'out',
        targetHandle: 'in',
        target: id,
        type: 'smoothstep',
        animated: true,
      })
      lastNodeId = id
      currY += Y_GAP
    })

    // 3. Action Nodes
    const initActions = initial.actions ?? []
    initActions.forEach((act) => {
      const id = `act-${uuidv4()}`
      newNodes.push({
        id,
        type: 'action',
        position: { x: X_START, y: currY },
        data: {
          actionType: act.actionType,
          target: act.target,
          onActionTypeChange: (val: ActionType) => updateNodeData(id, { actionType: val }),
          onTargetChange: (val: string) => updateNodeData(id, { target: val }),
          onDelete: () => {
            setNodes((nds) => nds.filter((n) => n.id !== id))
            setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
          },
        },
      })
      newEdges.push({
        id: `e-${lastNodeId}-${id}`,
        source: lastNodeId,
        sourceHandle: 'out',
        targetHandle: 'in',
        target: id,
        type: 'smoothstep',
        animated: true,
      })
      lastNodeId = id
      currY += Y_GAP
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [initial, setNodes, setEdges])

  useEffect(() => {
    initNodesAndEdges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount to populate `initial`

  const nodeTypeById = useMemo(() => {
    const map = new Map<string, StrategyAppNode['type']>()
    for (const node of nodes) map.set(node.id, node.type)
    return map
  }, [nodes])

  const isValidConnection = useCallback((params: Connection | Edge) => {
    if (!params.source || !params.target) return false
    const sourceType = nodeTypeById.get(params.source)
    const targetType = nodeTypeById.get(params.target)
    if (!sourceType || !targetType) return false
    if (sourceType === 'action') return false
    if (params.source === params.target) return false
    return targetType === 'condition' || targetType === 'action'
  }, [nodeTypeById])

  const onConnect = useCallback((params: Connection) => {
    if (!isValidConnection(params)) return
    setEdges((eds) => addEdge(
      {
        ...params,
        sourceHandle: params.sourceHandle ?? 'out',
        targetHandle: params.targetHandle ?? 'in',
        animated: true,
        type: 'smoothstep',
      },
      eds,
    ))
  }, [isValidConnection, setEdges])

  const addConditionNode = useCallback(() => {
    const id = `cond-${uuidv4()}`
    const lastNode = nodes[nodes.length - 1]
    const y = (lastNode?.position.y ?? Y_START) + Y_GAP
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'condition',
        position: { x: X_START, y },
        data: {
          field: 'sentiment_score',
          operator: 'gt',
          value: '',
          onFieldChange: (val: ConditionField) => updateNodeData(id, { field: val }),
          onOperatorChange: (val: ConditionOperator) => updateNodeData(id, { operator: val }),
          onValueChange: (val: string) => updateNodeData(id, { value: val }),
          onDelete: () => {
            setNodes((n) => n.filter(x => x.id !== id))
            setEdges((eds) => eds.filter(e => e.source !== id && e.target !== id))
          },
        },
      },
    ])
    if (lastNode) {
      setEdges((eds) => [...eds, { id: `e-${lastNode.id}-${id}`, source: lastNode.id, sourceHandle: 'out', targetHandle: 'in', target: id, type: 'smoothstep', animated: true }])
    }
  }, [nodes, setNodes, setEdges])

  const addActionNode = useCallback(() => {
    const id = `act-${uuidv4()}`
    const lastNode = nodes[nodes.length - 1]
    const y = (lastNode?.position.y ?? Y_START) + Y_GAP
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'action',
        position: { x: X_START, y },
        data: {
          actionType: 'notify',
          target: '',
          onActionTypeChange: (val: ActionType) => updateNodeData(id, { actionType: val }),
          onTargetChange: (val: string) => updateNodeData(id, { target: val }),
          onDelete: () => {
            setNodes((n) => n.filter(x => x.id !== id))
            setEdges((eds) => eds.filter(e => e.source !== id && e.target !== id))
          },
        },
      },
    ])
    if (lastNode) {
      setEdges((eds) => [...eds, { id: `e-${lastNode.id}-${id}`, source: lastNode.id, sourceHandle: 'out', targetHandle: 'in', target: id, type: 'smoothstep', animated: true }])
    }
  }, [nodes, setNodes, setEdges])

  const handleSave = () => {
    setLocalError(null)
    // Traverse graph to build the ordered payload.
    const triggerNode = nodes.find(n => n.type === 'trigger')
    if (!triggerNode) return

    const conditions: StrategyCondition[] = []
    const actions: StrategyAction[] = []

    const outgoing = new Map<string, Edge[]>()
    for (const edge of edges) {
      if (!edge.source || !edge.target) continue
      const curr = outgoing.get(edge.source) ?? []
      curr.push(edge)
      outgoing.set(edge.source, curr)
    }

    let currentId: string | null = triggerNode.id
    const visited = new Set<string>()

    while (currentId) {
      if (visited.has(currentId)) {
        setLocalError('Invalid strategy topology: cycle detected.')
        return
      }
      visited.add(currentId)
      const node = nodes.find(n => n.id === currentId)
      if (node?.type === 'condition') {
        conditions.push({
          field: node.data.field as ConditionField,
          operator: node.data.operator as ConditionOperator,
          value: node.data.value as string,
        })
      } else if (node?.type === 'action') {
        actions.push({
          actionType: node.data.actionType as ActionType,
          target: (node.data.target as string) || undefined,
        })
      }

      // Find next node
      const out: Edge[] = outgoing.get(currentId) ?? []
      if (out.length > 1) {
        setLocalError('Invalid strategy topology: branching is not supported.')
        return
      }
      currentId = out.length === 1 ? out[0].target : null
    }

    const invalidEdges = edges.filter((e) => !isValidConnection({ source: e.source, sourceHandle: e.sourceHandle ?? null, target: e.target, targetHandle: e.targetHandle ?? null }))
    if (invalidEdges.length > 0) {
      setLocalError('Invalid strategy topology: one or more edges are not connectable.')
      return
    }

    onSubmit({
      name: triggerNode.data.name as string,
      desc: triggerNode.data.desc as string,
      tickers: triggerNode.data.tickers as string[],
      conditions,
      actions,
    })
  }

  return (
    <div className="flex flex-col gap-4" style={{ height: '700px', width: '100%', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface-container-lowest)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-neutral-50 dark:bg-neutral-900"
      >
        <Background color="var(--outline-variant)" gap={16} />
        <Controls />
        
        <Panel position="top-right" style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="outline" onClick={addConditionNode} disabled={loading}>
            <Icons.Filter size={16} />
            Add Condition
          </Button>
          <Button variant="outline" onClick={addActionNode} disabled={loading}>
            <Icons.Play size={16} />
            Add Action
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Icons.Save size={16} />
            Save Strategy
          </Button>
        </Panel>

        {(error || localError) && (
          <Panel position="bottom-center" style={{ width: '100%', maxWidth: 400 }}>
            <div role="alert" style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--tertiary-container)', color: 'var(--tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-body-sm)' }}>
              {localError ?? error}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
