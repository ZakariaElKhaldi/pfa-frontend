import { Bell, LogOut, User, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useAlertStream } from '@/hooks/useAlertStream'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function Header({ title }) {
  const { user, logout }    = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { lastAlert }       = useAlertStream()
  const navigate         = useNavigate()
  const prevAlert        = useRef(null)

  /* Flash notification on new alert */
  useEffect(() => {
    if (lastAlert && lastAlert !== prevAlert.current) {
      prevAlert.current = lastAlert
    }
  }, [lastAlert])

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'CS'

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-surface-low bg-surface shrink-0">
      <h1 className="text-sm font-semibold text-primary-text tracking-wide">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-subtle hover:text-primary-text"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </Button>

        {/* Alerts bell */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/alerts')}
          className="relative text-subtle hover:text-primary-text"
        >
          <Bell size={18} />
          {lastAlert && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-signal-sell" />
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs bg-action-container text-action-hover">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-surface-low border-container">
            <div className="px-2 py-1.5 text-xs text-subtle">{user?.username}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-secondary cursor-pointer">
              <User size={14} /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="gap-2 text-error cursor-pointer focus:text-error"
            >
              <LogOut size={14} /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
