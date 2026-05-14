"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PremiumCalendarPickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PremiumCalendarPicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: PremiumCalendarPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            // Premium trigger styling
            "justify-start text-left font-medium group",
            "bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
            "border border-white/[0.1] hover:border-white/[0.15]",
            "text-[#f0f4ff] placeholder:text-[#757c92]",
            "hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-white/[0.04]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d9ff]/40",
            "transition-all duration-200",
            "hover:shadow-[0_0_20px_rgba(0,217,255,0.1)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            !date && "text-[#a8b5d1]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 group-hover:text-[#00d9ff] transition-colors duration-200" />
          {date ? (
            <span className="text-[#00d9ff]">{format(date, "MMM dd, yyyy")}</span>
          ) : (
            <span className="text-[#757c92]">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto p-0",
          // Premium popover surface
          "bg-gradient-to-br from-[#111933]/95 to-[#0a0e27]/95",
          "backdrop-blur-2xl",
          "border border-white/[0.08]",
          "shadow-[0_25px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
          "rounded-[0.875rem]"
        )}
        align="start"
      >
        <div className="p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
