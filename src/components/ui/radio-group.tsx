"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2.5", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative grid aspect-square size-[18px] shrink-0 place-items-center",
        "rounded-full",
        /* idle: filled bg + soft border */
        "bg-background border border-input",
        "transition-[background-color,border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)]",
        /* hit area expansion */
        "after:absolute after:-inset-2.5 after:rounded-full",
        /* hover */
        "hover:border-foreground/45",
        /* focus */
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[color:var(--primary)]/25 outline-none",
        /* checked: primary border with center dot via indicator */
        "data-checked:border-primary",
        "data-checked:shadow-[0_1px_2px_hsla(243,72%,40%,0.20)]",
        "active:scale-[0.92]",
        /* disabled */
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        /* invalid */
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={cn(
          "grid size-full place-items-center",
          "data-checked:animate-in data-checked:fade-in-0 data-checked:zoom-in-50 data-checked:duration-150"
        )}
      >
        <span className="block size-[8px] rounded-full bg-primary" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
