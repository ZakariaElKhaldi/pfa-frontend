import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center overflow-hidden",
    "rounded-lg border border-transparent",
    "bg-clip-padding text-sm font-medium whitespace-nowrap",
    "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
    "outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 focus-visible:ring-offset-1",
    "active:not-aria-[haspopup]:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-40",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ── Primary — gradient, consistent with .btn-primary CSS class ─── */
        default: [
          "[background:var(--gradient-primary)] text-white shadow-sm",
          "hover:brightness-105 hover:shadow-md",
        ].join(" "),

        /* ── Outline — glass-friendly bordered button ─────────────────── */
        outline: [
          "border-[rgba(148,163,184,0.50)] bg-[rgba(255,255,255,0.70)]",
          "text-[var(--on-surface)] backdrop-blur-sm",
          "hover:bg-[rgba(255,255,255,0.90)] hover:border-[rgba(148,163,184,0.70)]",
          "aria-expanded:bg-[rgba(255,255,255,0.90)]",
        ].join(" "),

        /* ── Secondary — muted glass surface ─────────────────────────── */
        secondary: [
          "bg-[var(--surface-container-high)] text-[var(--on-surface)]",
          "hover:bg-[var(--surface-bright)] hover:shadow-sm",
          "aria-expanded:bg-[var(--surface-bright)]",
        ].join(" "),

        /* ── Ghost — transparent, hover surface tint ─────────────────── */
        ghost: [
          "text-[var(--on-surface)]",
          "hover:bg-[var(--surface-container-high)]",
          "aria-expanded:bg-[var(--surface-container-high)]",
        ].join(" "),

        /* ── Destructive — muted red, on-glass friendly ───────────────── */
        destructive: [
          "bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]",
          "hover:bg-[var(--tertiary)] hover:text-white hover:shadow-sm",
          "focus-visible:ring-[var(--tertiary)]/30",
        ].join(" "),

        /* ── Link ────────────────────────────────────────────────────── */
        link: "text-[var(--primary)] underline-offset-4 hover:underline",

        /* ── Trading signal variants ─────────────────────────────────── */
        buy: [
          "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]",
          "border border-[color:var(--secondary)]/25",
          "hover:bg-[var(--secondary)] hover:text-white hover:shadow-sm",
          "focus-visible:ring-[color:var(--secondary)]/30",
        ].join(" "),
        sell: [
          "bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]",
          "border border-[color:var(--tertiary)]/25",
          "hover:bg-[var(--tertiary)] hover:text-white hover:shadow-sm",
          "focus-visible:ring-[color:var(--tertiary)]/30",
        ].join(" "),
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 text-[0.9375rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
