import SystemStats from '@/components/admin/SystemStats'
import UserTable from '@/components/admin/UserTable'
import { useAdminUsers } from '@/hooks/useAdmin'
import { Card } from '@/components/ui/card'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function AdminPage() {
  const { data: users, isLoading } = useAdminUsers()

  return (
    <div className="flex flex-col gap-6">
      <SystemStats />

      <Card className="bg-container border-0 p-4">
        <h2 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-4">
          Users
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner size={20} /></div>
        ) : (
          <UserTable users={users ?? []} />
        )}
      </Card>
    </div>
  )
}
