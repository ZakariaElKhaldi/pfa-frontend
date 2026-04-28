import * as React from "react"

import { cn } from "@/lib/utils"

interface LabelProps extends React.ComponentProps<"label"> {
  /** Marks the field as required — appends a primary-coloured asterisk. */
  required?: boolean
  /** Marks the field as optional — appends a muted "(optional)" hint. */
  optional?: boolean
}

function Label({
  className,
  required,
  optional,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "inline-flex items-center gap-1.5",
        "text-sm font-medium leading-none tracking-tight text-foreground",
        "select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden className="font-semibold text-primary">*</span>
      )}
      {optional && !required && (
        <span className="text-xs font-normal tracking-normal text-muted-foreground">
          (optional)
        </span>
      )}
    </label>
  )
}

export { Label }
export type { LabelProps }
