import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    /* layout */
    "flex w-full min-w-0 items-center",
    /* shape */
    "rounded-lg",
    /* base surface — filled style for clear input affordance */
    "bg-background",
    /* visible border that hugs the design system */
    "border border-input",
    /* typography */
    "text-foreground placeholder:text-muted-foreground",
    "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    /* motion */
    "transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)]",
    /* idle outline tone */
    "outline-none",
    /* hover — outline darkens subtly */
    "hover:border-foreground/35",
    /* focus — primary 2px outline + soft glow */
    "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[color:var(--primary)]/20",
    /* disabled */
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-65",
    /* invalid — tertiary glow */
    "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
  ].join(" "),
  {
    variants: {
      sizing: {
        xs:      "h-7  px-3   text-xs",
        sm:      "h-8  px-3.5 text-[13px]",
        default: "h-10 px-4   text-sm",
        lg:      "h-12 px-5   text-[15px]",
      },
    },
    defaultVariants: { sizing: "default" },
  }
)

interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  /** Element pinned to right (e.g. a small "Max" button or unit suffix). */
  endAdornment?: React.ReactNode
}

function Input({
  className,
  type,
  sizing = "default",
  startIcon,
  endIcon,
  endAdornment,
  ...props
}: InputProps) {
  /* When no decorations present, render the bare input — keeps DOM minimal. */
  if (!startIcon && !endIcon && !endAdornment) {
    return (
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(inputVariants({ sizing }), className)}
        {...props}
      />
    )
  }

  /* Decorated layout: relative wrapper + absolutely positioned slots.
     Padding is shifted on whichever side has a decoration so text never
     overlaps an icon. Icon size scales with the input height. */
  const padLeft  = startIcon ? "pl-9" : ""
  const padRight = endIcon || endAdornment ? "pr-9" : ""

  return (
    <div data-slot="input-wrapper" className="relative w-full">
      {startIcon && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
        >
          {startIcon}
        </span>
      )}
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(inputVariants({ sizing }), padLeft, padRight, className)}
        {...props}
      />
      {endIcon && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
        >
          {endIcon}
        </span>
      )}
      {endAdornment && (
        <span className="absolute inset-y-0 right-1.5 flex items-center">
          {endAdornment}
        </span>
      )}
    </div>
  )
}

export { Input, inputVariants }
export type { InputProps }
