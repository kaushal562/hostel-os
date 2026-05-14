import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { PREMIUM_COLORS, PREMIUM_SHADOWS, PREMIUM_RADIUS, PREMIUM_TRANSITIONS } from "@/lib/premium-design-tokens"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-5",
        // Premium surface styling
        "rounded-[0.875rem] backdrop-blur-xl",
        className
      )}
      classNames={{
        // Month container with premium spacing
        months: "flex flex-col sm:flex-row space-y-5 sm:space-x-6 sm:space-y-0",
        month: "space-y-5",
        
        // Caption with enterprise typography
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: cn(
          "text-sm font-bold uppercase tracking-[0.08em]",
          "text-[#f0f4ff]" // Premium white text
        ),
        
        // Navigation buttons with premium styling
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 group",
          "text-[#a8b5d1] hover:text-[#00d9ff]", // Muted to cyan on hover
          "transition-all duration-200",
          "hover:bg-white/[0.08] hover:backdrop-blur-md",
          "focus-visible:ring-2 focus-visible:ring-[#00d9ff]/30",
          "focus-visible:outline-none"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        
        // Table layout with premium spacing
        table: "w-full border-collapse space-y-2",
        head_row: "flex",
        
        // Weekday headers - muted but readable
        head_cell: cn(
          "text-[#757c92]", // Tertiary text
          "rounded-md w-8 font-semibold text-[0.75rem] uppercase tracking-wider",
          "py-2 transition-colors duration-200"
        ),
        
        // Day rows with proper spacing
        row: "flex w-full mt-2 gap-1",
        
        // Date cell container - elegant range highlighting
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          // Range styling - gentle glass background
          "data-[range]:bg-[#00d9ff]/10",
          props.mode === "range"
            ? cn(
                // Range start/end rounded corners
                "[&:has(>.day-range-end)]:rounded-r-[0.625rem]",
                "[&:has(>.day-range-start)]:rounded-l-[0.625rem]",
                "first:[&:has([aria-selected])]:rounded-l-[0.625rem]",
                "last:[&:has([aria-selected])]:rounded-r-[0.625rem]"
              )
            : "[&:has([aria-selected])]:rounded-[0.625rem]"
        ),
        
        // Premium day button styling
        day: cn(
          "h-8 w-8 p-0 font-medium text-[0.875rem]",
          "text-[#a8b5d1]", // Default muted text
          "bg-transparent hover:bg-white/[0.06]",
          "rounded-[0.5rem] transition-all duration-200",
          "hover:text-[#00d9ff]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d9ff]/40",
          "hover:backdrop-blur-sm",
          "aria-selected:opacity-100"
        ),
        
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        
        // Selected day - premium gradient and glow
        day_selected: cn(
          "!bg-gradient-to-br from-[#00d9ff]/20 to-[#7c3aed]/20",
          "!text-[#00d9ff] font-semibold",
          "!border !border-[#00d9ff]/30",
          "shadow-[inset_0_0_20px_rgba(0,217,255,0.15)]",
          "hover:!bg-gradient-to-br hover:from-[#00d9ff]/25 hover:to-[#7c3aed]/25",
          "hover:!border-[#00d9ff]/50",
          "focus:!bg-gradient-to-br focus:from-[#00d9ff]/25 focus:to-[#7c3aed]/25"
        ),
        
        // Today indicator - subtle elegant emphasis
        day_today: cn(
          "!bg-white/[0.08] !text-[#00d9ff]",
          "!border !border-[#00d9ff]/40",
          "font-semibold",
          "hover:!bg-white/[0.12]"
        ),
        
        // Outside days - muted but visible
        day_outside: cn(
          "day-outside text-[#757c92]", // Tertiary text
          "opacity-40 transition-opacity duration-200",
          "aria-selected:bg-white/[0.05] aria-selected:text-[#00d9ff]/70 aria-selected:opacity-60"
        ),
        
        // Disabled days
        day_disabled: cn(
          "text-[#4a4f65] opacity-30",
          "cursor-not-allowed"
        ),
        
        // Range middle days - gentle highlight
        day_range_middle: cn(
          "aria-selected:!bg-white/[0.04] aria-selected:!text-[#a8b5d1]",
          "aria-selected:hover:!bg-white/[0.08]"
        ),
        
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeftIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
