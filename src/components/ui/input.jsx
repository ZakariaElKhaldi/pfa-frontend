import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-ghost bg-surface px-3 py-1 text-sm text-primary-text shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/20",
        "aria-invalid:border-error aria-invalid:ring-error/20",
        className
      )}
      {...props} />
  );
}

export { Input }
