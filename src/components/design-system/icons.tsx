/**
 * CrowdSignal icon set — thin wrapper over lucide-react.
 * Re-export only the icons used by the design system so downstream files
 * import from one path and we can swap libraries in one place later.
 */
import {
  LayoutGrid,
  BarChart3,
  TrendingUp,
  Star,
  Briefcase,
  Zap,
  Download,
  Settings,
  Bell,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Flame,
  Activity,
  Check,
  Mail,
  Link,
  FileText,
  Bot,
  Minus,
} from 'lucide-react'

export const Icons = {
  Grid:          LayoutGrid,
  BarChart:      BarChart3,
  TrendingUp:    TrendingUp,
  Star:          Star,
  Briefcase:     Briefcase,
  Zap:           Zap,
  Download:      Download,
  Settings:      Settings,
  Bell:          Bell,
  Search:        Search,
  X:             X,
  ArrowUp:       ArrowUp,
  ArrowDown:     ArrowDown,
  AlertTriangle: AlertTriangle,
  Flame:         Flame,
  Logo:          Activity,
  Check:         Check,
  Mail:          Mail,
  Link:          Link,
  FileText:      FileText,
  Bot:           Bot,
  Minus:         Minus,
} as const

export type IconName = keyof typeof Icons
