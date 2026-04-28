import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        /* ── Generic UI variants ─────────────────────────────────────── */
        default:
          "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",

        /* ── Trading signal variants (exclusive — NEVER decorative) ─── */
        buy: [
          "font-mono text-[0.65rem] font-semibold tracking-widest uppercase",
          "bg-[var(--secondary-container)] text-[var(--on-secondary-container)] border-[color:var(--secondary)]/30",
        ].join(" "),
        sell: [
          "font-mono text-[0.65rem] font-semibold tracking-widest uppercase",
          "bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] border-[color:var(--tertiary)]/30",
        ].join(" "),
        hold: [
          "font-mono text-[0.65rem] font-semibold tracking-widest uppercase",
          "bg-[var(--warning-container)] text-[var(--on-warning-container)] border-[color:var(--warning)]/30",
        ].join(" "),

        /* ── Semantic UI variants (decoupled from signal colors) ────── */
        success: [
          "bg-teal-500/10 text-teal-700 border border-teal-500/25",
          "dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20",
        ].join(" "),
        warning: [
          "bg-orange-500/10 text-orange-700 border border-orange-500/25",
          "dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
        ].join(" "),
        info: [
          "bg-sky-500/10 text-sky-700 border border-sky-500/25",
          "dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
        ].join(" "),
        error: [
          "bg-pink-500/10 text-pink-700 border border-pink-500/25",
          "dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/20",
        ].join(" "),
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
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
