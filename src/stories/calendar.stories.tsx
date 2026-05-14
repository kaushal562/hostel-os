// [build] library: 'shadcn'
import { Calendar } from "../components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { Button } from "../components/ui/button";
import { PremiumCalendarPicker } from "../components/ui/premium-calendar-picker";
import { PremiumRangeCalendarPicker } from "../components/ui/premium-range-calendar-picker";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

const meta = {
  title: "ui/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// ============ BASE CALENDAR ============
export const Base = {
  render: (args: any) => (
    <div className="bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] p-8 rounded-lg">
      <Calendar {...args}>Calendar</Calendar>
    </div>
  ),
  args: {
    mode: "single",
  },
};

// ============ PREMIUM SINGLE DATE PICKER ============
export const PremiumDatePicker = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] p-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-[#f0f4ff] font-bold mb-2">Premium Date Picker</h3>
            <PremiumCalendarPicker
              date={date}
              onDateChange={setDate}
              placeholder="Select a date"
              className="w-[300px]"
            />
          </div>
          {date && (
            <p className="text-[#a8b5d1] text-sm">
              Selected: {format(date, "MMMM dd, yyyy")}
            </p>
          )}
        </div>
      </div>
    );
  },
};

// ============ PREMIUM RANGE CALENDAR PICKER ============
export const PremiumRangePicker = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 7),
    });

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] p-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-[#f0f4ff] font-bold mb-2">Premium Range Picker</h3>
            <PremiumRangeCalendarPicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              placeholder="Select date range"
              className="w-[350px]"
            />
          </div>
          {dateRange?.from && (
            <p className="text-[#a8b5d1] text-sm">
              Range: {format(dateRange.from, "MMM dd")} to{" "}
              {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "..."}
            </p>
          )}
        </div>
      </div>
    );
  },
};

// ============ STANDARD DATE PICKER (Premium Shell) ============
export const StandardDatePicker = {
  render: () => {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] p-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-medium group bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] hover:border-white/[0.15] text-[#f0f4ff] hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d9ff]/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,217,255,0.1)]"
            >
              <CalendarIcon className="mr-2 h-4 w-4 group-hover:text-[#00d9ff] transition-colors duration-200" />
              <span>Pick a date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-gradient-to-br from-[#111933]/95 to-[#0a0e27]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-[0.875rem]"
            align="start"
          >
            <div className="p-4">
              <Calendar mode="single" initialFocus />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};

// ============ RANGE CALENDAR PICKER (Premium Shell) ============
export const RangeCalendarPicker = {
  render: () => {
    const [date, setDate] = useState<DateRange | undefined>({
      from: new Date(2024, 0, 20),
      to: addDays(new Date(2024, 0, 20), 20),
    });

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] p-8">
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className="w-[300px] justify-start text-left font-medium group bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] hover:border-white/[0.15] text-[#f0f4ff] hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d9ff]/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,217,255,0.1)]"
              >
                <CalendarIcon className="mr-2 h-4 w-4 group-hover:text-[#00d9ff] transition-colors duration-200" />
                {date?.from ? (
                  date.to ? (
                    <span className="text-[#f0f4ff]">
                      {format(date.from, "MMM dd, y")} —{" "}
                      <span className="text-[#00d9ff]">{format(date.to, "MMM dd, y")}</span>
                    </span>
                  ) : (
                    <span className="text-[#00d9ff]">{format(date.from, "MMM dd, y")}</span>
                  )
                ) : (
                  <span className="text-[#757c92]">Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-gradient-to-br from-[#111933]/95 to-[#0a0e27]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-[0.875rem]"
              align="start"
            >
              <div className="p-4">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  },
};

// ============ CALENDAR WITH QUICK PRESETS ============
export const DatePickerWithPresets = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2024, 0, 20));

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] p-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-medium group bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] hover:border-white/[0.15] text-[#f0f4ff] hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d9ff]/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,217,255,0.1)]"
            >
              <CalendarIcon className="mr-2 h-4 w-4 group-hover:text-[#00d9ff] transition-colors duration-200" />
              {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="flex w-auto flex-col space-y-3 p-4 bg-gradient-to-br from-[#111933]/95 to-[#0a0e27]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-[0.875rem]"
          >
            <Select
              onValueChange={(value) => {
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + parseInt(value));
                setDate(newDate);
              }}
            >
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-[#f0f4ff]">
                <SelectValue placeholder="Quick select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Today</SelectItem>
                <SelectItem value="1">Tomorrow</SelectItem>
                <SelectItem value="3">In 3 days</SelectItem>
                <SelectItem value="7">In a week</SelectItem>
              </SelectContent>
            </Select>
            <div className="rounded-[0.625rem] border border-white/[0.08] overflow-hidden bg-white/[0.04]">
              <Calendar
                initialFocus
                mode="single"
                defaultMonth={date}
                selected={date}
                onSelect={setDate}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};
