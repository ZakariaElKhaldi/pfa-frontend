import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  [
    "flex w-full field-sizing-content",
    "rounded-lg",
    "bg-background border border-input",
    "text-foreground placeholder:text-muted-foreground",
    "px-3.5 py-2.5",
    "transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)]",
    "outline-none resize-y",
    "hover:border-foreground/35",
    "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[color:var(--primary)]/20",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-65",
    "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
  ].join(" "),
  {
    variants: {
      sizing: {
        sm:      "min-h-20 text-[13px] leading-normal",
        default: "min-h-24 text-sm    leading-normal",
        lg:      "min-h-32 text-[15px] leading-relaxed",
      },
    },
    defaultVariants: { sizing: "default" },
  }
)

interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, sizing = "default", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ sizing }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
export type { TextareaProps }
