"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        /* layout */
        "peer group/switch relative inline-flex shrink-0 items-center",
        "rounded-full",
        /* sizing — proper proportions: track is 1.85x its height for clean thumb travel */
        "data-[size=sm]:h-5      data-[size=sm]:w-9",
        "data-[size=default]:h-6 data-[size=default]:w-11",
        "data-[size=lg]:h-7      data-[size=lg]:w-[52px]",
        /* idle / unchecked: muted track */
        "bg-input/70",
        /* motion */
        "transition-[background-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out)]",
        "outline-none",
        /* hit area expansion */
        "after:absolute after:-inset-x-2 after:-inset-y-2",
        /* hover */
        "hover:bg-input",
        /* focus */
        "focus-visible:ring-[3px] focus-visible:ring-[color:var(--primary)]/25",
        /* checked: primary fill */
        "data-checked:bg-primary data-checked:hover:bg-[var(--primary-hover)]",
        /* disabled */
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        /* invalid */
        "aria-invalid:ring-[3px] aria-invalid:ring-destructive/30",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white",
          /* shadow gives elevation — the thumb feels physical, like a knob */
          "shadow-[0_1px_2px_hsla(220,20%,15%,0.25),0_2px_4px_hsla(220,20%,15%,0.10)]",
          /* sizes — thumb leaves 2px breathing room on track */
          "group-data-[size=sm]/switch:size-4",
          "group-data-[size=default]/switch:size-5",
          "group-data-[size=lg]/switch:size-6",
          /* travel: smooth slide, slightly springy */
          "transition-transform duration-[var(--duration-base)] ease-[var(--ease-spring)]",
          /* unchecked: 2px from left */
          "translate-x-0.5",
          /* checked: travel = (track width - thumb width - 2px) */
          "group-data-[size=sm]/switch:data-checked:translate-x-[18px]",
          "group-data-[size=default]/switch:data-checked:translate-x-[22px]",
          "group-data-[size=lg]/switch:data-checked:translate-x-[26px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
