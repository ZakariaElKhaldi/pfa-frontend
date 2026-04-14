import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

/**
 * Badge / Tag component — Obsidian Lens
 * 
 * Design rationale (Hasan et al. 2024):
 * - rounded-md (6px) not rounded-full: structured, professional for finance
 * - px-2.5 py-1: sufficient breathing room so text never touches edges
 * - 11px text: readable at small sizes without looking cramped
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap font-semibold rounded-md px-2.5 py-1 text-[11px] leading-none tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-action-container text-action border border-action/20",
        secondary:
          "bg-container-high/50 text-secondary border border-ghost-strong",
        destructive:
          "bg-signal-sell-container text-signal-sell border border-signal-sell-border",
        outline:
          "bg-transparent text-subtle border border-ghost-strong",
        ghost:
          "bg-ghost text-subtle border-transparent",
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
