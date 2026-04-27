import type { ReactNode } from 'react'

export interface Column<T> {
  key:       string
  header:    string
  render:    (row: T) => ReactNode
  width?:    number | string
  align?:    'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns:    Column<T>[]
  data:       T[]
  keyFn:      (row: T) => string
  loading?:   boolean
  emptyText?: string
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <div style={{ height: 14, borderRadius: 'var(--radius-xs)', background: 'var(--surface-container-high)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </td>
      ))}
    </tr>
  )
}

export function DataTable<T>({ columns, data, keyFn, loading, emptyText = 'No data' }: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-body-sm)' }}>
        <thead>
          <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding:     'var(--space-3) var(--space-4)',
                  textAlign:   col.align ?? 'left',
                  fontWeight:  600,
                  fontSize:    'var(--text-label-md)',
                  color:       'var(--on-surface-variant)',
                  whiteSpace:  'nowrap',
                  width:       col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: 'var(--space-12) var(--space-4)', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: 'var(--text-body-sm)' }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyFn(row)}
                style={{ borderBottom: idx < data.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{ padding: 'var(--space-3) var(--space-4)', textAlign: col.align ?? 'left', verticalAlign: 'middle' }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
