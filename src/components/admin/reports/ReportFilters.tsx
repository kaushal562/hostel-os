import React, { useEffect, useState, useRef } from "react";
import type { ComplaintStatus, FeeStatus, ReportFilters, ReportType, RoomType } from "./types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, Search, Filter, RefreshCcw } from "lucide-react";

const feeOptions: Array<FeeStatus> = ["pending", "partially_paid", "paid", "overdue"];
const complaintOptions: Array<ComplaintStatus> = ["pending", "in-progress", "resolved", "rejected"];
const roomOptions: Array<RoomType> = ["single", "double", "triple", "quad"];

export default function ReportFilters({
  value,
  onChange,
  onReset,
  reportType,
}: {
  value: ReportFilters;
  onChange: (next: ReportFilters) => void;
  onReset: () => void;
  reportType: ReportType;
}) {
  // Use local state for text-based inputs to prevent focus loss and "reset" issues
  const [localStart, setLocalStart] = useState(value.startDate ?? "");
  const [localEnd, setLocalEnd] = useState(value.endDate ?? "");
  const [localMonth, setLocalMonth] = useState(value.month ?? "");
  const [localSearch, setLocalSearch] = useState(value.studentQuery ?? "");
  const [localCourse, setLocalCourse] = useState(value.course && value.course !== "all" ? value.course : "");
  const [localYear, setLocalYear] = useState(value.year && value.year !== "all" ? value.year : "");

  // Refs to prevent feedback loops and stabilize syncing
  const isInternalChange = useRef(false);
  const isDebouncing = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync local state when props change (from external sources like reset or tab switch)
  useEffect(() => {
    // Only sync if we're NOT in the middle of a user interaction (internal change)
    if (!isInternalChange.current) {
      if (value.startDate !== undefined && value.startDate !== localStart) setLocalStart(value.startDate);
      if (value.startDate === undefined && localStart !== "") setLocalStart("");
      
      if (value.endDate !== undefined && value.endDate !== localEnd) setLocalEnd(value.endDate);
      if (value.endDate === undefined && localEnd !== "") setLocalEnd("");

      if (value.month !== undefined && value.month !== localMonth) setLocalMonth(value.month);
      if (value.month === undefined && localMonth !== "") setLocalMonth("");

      if (value.studentQuery !== undefined && value.studentQuery !== localSearch) setLocalSearch(value.studentQuery);
      if (value.studentQuery === undefined && localSearch !== "") setLocalSearch("");

      const courseVal = value.course && value.course !== "all" ? value.course : "";
      if (courseVal !== localCourse) setLocalCourse(courseVal);

      const yearVal = value.year && value.year !== "all" ? value.year : "";
      if (yearVal !== localYear) setLocalYear(yearVal);
    }
  }, [value]);

  const debouncedChange = (next: ReportFilters) => {
    isInternalChange.current = true;
    isDebouncing.current = true;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChange(next);
      // We allow syncing again after the parent has likely received and processed the change
      isInternalChange.current = false;
      isDebouncing.current = false;
    }, 400); // Slightly longer debounce for better stability
  };

  return (
    <Card className="overflow-visible rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] p-6 shadow-none print:hidden">
      <div className="flex flex-col gap-6">
        <div className="mb-1 flex items-center gap-3">
          <div className="rounded-lg border border-white/[0.08] bg-slate-950/50 p-2.5 text-indigo-200">
            <Filter className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Report filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Date From</Label>
            <div className="relative">
              <Input
                type="date"
                value={localStart}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalStart(val);
                  // Strict Mutual Exclusivity: Clear Quick Month when Date Range is selected
                  setLocalMonth("");
                  debouncedChange({ ...value, startDate: val || undefined, month: undefined });
                }}
                className="border-white/[0.08] bg-slate-950/40 pl-9 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-white/[0.14] focus:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/10 hover:border-white/[0.12]"
              />
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Date To</Label>
            <div className="relative">
              <Input
                type="date"
                value={localEnd}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalEnd(val);
                  // Strict Mutual Exclusivity: Clear Quick Month when Date Range is selected
                  setLocalMonth("");
                  debouncedChange({ ...value, endDate: val || undefined, month: undefined });
                }}
                className="border-white/[0.08] bg-slate-950/40 pl-9 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-white/[0.14] focus:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/10 hover:border-white/[0.12]"
              />
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quick Month Select</Label>
            <Input
              type="month"
              value={localMonth}
              onChange={(e) => {
                const val = e.target.value;
                setLocalMonth(val);
                // Strict Mutual Exclusivity: Clear Date Range when Quick Month is selected
                setLocalStart("");
                setLocalEnd("");
                debouncedChange({ ...value, month: val || undefined, startDate: undefined, endDate: undefined });
              }}
              className="border-white/[0.08] bg-slate-950/40 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-white/[0.14] focus:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/10 hover:border-white/[0.12]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Student ID / Name</Label>
            <div className="relative">
              <Input
                placeholder="Search..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  debouncedChange({ ...value, studentQuery: e.target.value || undefined });
                }}
                className="border-white/[0.08] bg-slate-950/40 pl-9 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-white/[0.14] focus:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/10 hover:border-white/[0.12]"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Course</Label>
            <Input
              placeholder="All Courses"
              value={localCourse}
              onChange={(e) => {
                setLocalCourse(e.target.value);
                debouncedChange({ ...value, course: e.target.value ? e.target.value : "all" });
              }}
              className="border-white/[0.08] bg-slate-950/40 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-white/[0.14] focus:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/10 hover:border-white/[0.12]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Batch / Year</Label>
            <Input
              placeholder="All Years"
              value={localYear}
              onChange={(e) => {
                setLocalYear(e.target.value);
                debouncedChange({ ...value, year: e.target.value ? e.target.value : "all" });
              }}
              className="border-white/[0.08] bg-slate-950/40 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-white/[0.14] focus:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/10 hover:border-white/[0.12]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Room Type</Label>
            <Select
              value={value.roomType ?? "all"}
              onValueChange={(v) => onChange({ ...value, roomType: v as any })}
            >
              <SelectTrigger className="border-white/[0.08] bg-slate-950/40 text-slate-100 hover:border-white/[0.12] focus:border-white/[0.14]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Room Types</SelectItem>
                {roomOptions.map((rt) => (
                  <SelectItem key={rt} value={rt} className="capitalize">
                    {rt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end pb-0.5">
            <Button 
              variant="outline" 
              onClick={onReset}
              className="w-full gap-2 border-white/[0.08] bg-transparent text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-slate-200"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset All Filters
            </Button>
          </div>
        </div>

        {(reportType === "fee_collection" || reportType === "student" || reportType === "complaints") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(reportType === "fee_collection" || reportType === "student") && (
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Fee Payment Status</Label>
                <Select
                  value={value.feeStatus ?? "all"}
                  onValueChange={(v) => onChange({ ...value, feeStatus: v as any })}
                >
                  <SelectTrigger className="border-white/[0.08] bg-slate-950/40 text-slate-100 hover:border-white/[0.12] focus:border-white/[0.14]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {feeOptions.map((st) => (
                      <SelectItem key={st} value={st} className="capitalize">
                        {st.split("_").join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType === "complaints" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Complaint Status</Label>
                <Select
                  value={value.complaintStatus ?? "all"}
                  onValueChange={(v) => onChange({ ...value, complaintStatus: v as any })}
                >
                  <SelectTrigger className="border-white/[0.08] bg-slate-950/40 text-slate-100 hover:border-white/[0.12] focus:border-white/[0.14]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {complaintOptions.map((st) => (
                      <SelectItem key={st} value={st} className="capitalize">
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
