import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        /* layout: 18px hit, +6px invisible expansion via ::after for easier tap */
        "peer relative grid size-[18px] shrink-0 place-items-center",
        "rounded-[5px]",
        /* idle: filled bg + soft border */
        "bg-background border border-input",
        /* motion */
        "transition-[background-color,border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)]",
        /* hit area expansion (no visual) */
        "after:absolute after:-inset-2.5 after:rounded-[10px]",
        /* hover: stronger outline */
        "hover:border-foreground/45",
        /* focus */
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[color:var(--primary)]/25 outline-none",
        /* checked: primary fill + subtle scale on press */
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        "data-checked:shadow-[0_1px_2px_hsla(243,72%,40%,0.25)]",
        "active:scale-[0.92]",
        /* disabled */
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "group-has-disabled/field:opacity-50",
        /* invalid */
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(
          "grid place-items-center text-current",
          /* indicator pops in with scale + fade */
          "data-checked:animate-in data-checked:fade-in-0 data-checked:zoom-in-50 data-checked:duration-150",
          "[&>svg]:size-3 [&>svg]:stroke-[3]"
        )}
      >
        <CheckIcon className="data-[indeterminate]:hidden" />
        <MinusIcon className="hidden data-[indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
