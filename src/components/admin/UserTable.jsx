import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDeleteUser, useUpdateUser } from '@/hooks/useAdmin'
import { Trash2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UserTable({ users = [] }) {
  const deleteUser = useDeleteUser()
  const updateUser = useUpdateUser()

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-surface-low hover:bg-transparent">
          {['Username', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
            <TableHead key={h} className="text-[10px] text-muted uppercase tracking-wider">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id} className="border-surface-low hover:bg-surface-low">
            <TableCell className="text-sm font-medium text-primary-text">{u.username}</TableCell>
            <TableCell className="text-xs text-subtle">{u.email}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-1.5 py-0 border',
                  u.role === 'admin'
                    ? 'text-signal-hold border-signal-hold-border'
                    : 'text-subtle border-container'
                )}
              >
                {u.role}
              </Badge>
            </TableCell>
            <TableCell className="text-xs text-muted">
              {new Date(u.date_joined).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-subtle hover:text-signal-hold"
                  onClick={() => updateUser.mutate({ id: u.id, role: u.role === 'admin' ? 'user' : 'admin' })}
                >
                  <ShieldCheck size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-subtle hover:text-signal-sell"
                  onClick={() => deleteUser.mutate(u.id)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
