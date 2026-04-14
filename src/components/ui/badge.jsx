import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

/**
 * Badge / Tag component.
 * 
 * Obsidian Lens design rules:
 * - Pill-shaped (fully rounded)
 * - Signal badges use opaque dark containers (#003D1A / #3D0000 / #3D2800)
 *   with bright text + subtle border
 * - UI badges use ghost/transparent backgrounds
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[--color-action-container] text-[--color-action] border border-[--color-action]/20 rounded-full px-3 py-1 text-[10px] tracking-wider uppercase",
        secondary:
          "bg-[--color-container] text-[--color-subtle] border border-[--color-ghost] rounded-full px-3 py-1 text-[10px] tracking-wider uppercase",
        destructive:
          "bg-[--color-signal-sell-container] text-[--color-signal-sell] border border-[--color-signal-sell-border] rounded-full px-3 py-1 text-[10px] tracking-wider uppercase",
        outline:
          "bg-transparent text-[--color-subtle] border border-[--color-ghost-strong] rounded-full px-3 py-1 text-[10px] tracking-wider uppercase",
        ghost:
          "bg-[--color-ghost] text-[--color-subtle] border-none rounded-full px-3 py-1 text-[10px] tracking-wider uppercase",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  ...props
}) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
