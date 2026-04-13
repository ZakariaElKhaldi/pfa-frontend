import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BarChart2 } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[--color-void] flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        <BarChart2 size={40} className="text-[--color-container]" />
        <div>
          <p className="font-data text-5xl font-bold text-[--color-container]">404</p>
          <p className="text-sm text-[--color-subtle] mt-2">Page not found</p>
        </div>
        <Button
          onClick={() => navigate('/')}
          className="bg-[--color-action] hover:bg-[--color-action-hover] text-white"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
