import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  [
    "group/alert relative grid w-full gap-0.5 rounded-lg px-3 py-2.5 text-left text-sm",
    "has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18",
    "has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5",
    "*:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:shrink-0 *:[svg:not([class*='size-'])]:size-4",
    /* left accent stripe via inset shadow — no 1px border */
    "shadow-[inset_3px_0_0_currentColor]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ── default: neutral surface ─────────────────────────────── */
        default:
          "bg-muted text-foreground [--tw-shadow-color:var(--outline)] *:[svg]:text-muted-foreground",

        /* ── destructive: bearish red (semantic UI, not signal red) ─ */
        destructive: [
          "bg-pink-500/8 text-pink-800 dark:text-pink-200",
          "[--tw-shadow-color:theme(colors.pink.500)]",
          "*:data-[slot=alert-description]:text-pink-700 dark:*:data-[slot=alert-description]:text-pink-300",
          "*:[svg]:text-pink-500",
        ].join(" "),

        /* ── success: teal (NOT signal green — decoupled) ─────────── */
        success: [
          "bg-teal-500/8 text-teal-800 dark:text-teal-200",
          "[--tw-shadow-color:theme(colors.teal.500)]",
          "*:data-[slot=alert-description]:text-teal-700 dark:*:data-[slot=alert-description]:text-teal-300",
          "*:[svg]:text-teal-500",
        ].join(" "),

        /* ── warning: orange (NOT signal amber — decoupled) ────────── */
        warning: [
          "bg-orange-500/8 text-orange-800 dark:text-orange-200",
          "[--tw-shadow-color:theme(colors.orange.500)]",
          "*:data-[slot=alert-description]:text-orange-700 dark:*:data-[slot=alert-description]:text-orange-300",
          "*:[svg]:text-orange-500",
        ].join(" "),

        /* ── info: sky blue ─────────────────────────────────────────── */
        info: [
          "bg-sky-500/8 text-sky-800 dark:text-sky-200",
          "[--tw-shadow-color:theme(colors.sky.500)]",
          "*:data-[slot=alert-description]:text-sky-700 dark:*:data-[slot=alert-description]:text-sky-300",
          "*:[svg]:text-sky-500",
        ].join(" "),

        /* ── buy: signal green (ONLY for trading context) ─────────── */
        buy: [
          "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]",
          "[--tw-shadow-color:var(--secondary)]",
          "*:data-[slot=alert-description]:opacity-80",
          "*:[svg]:text-[var(--secondary)]",
        ].join(" "),

        /* ── sell: signal red (ONLY for trading context) ───────────── */
        sell: [
          "bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]",
          "[--tw-shadow-color:var(--tertiary)]",
          "*:data-[slot=alert-description]:opacity-80",
          "*:[svg]:text-[var(--tertiary)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold leading-snug group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:opacity-80",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance opacity-85 group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:opacity-80 [&_p:not(:last-child)]:mb-3",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
