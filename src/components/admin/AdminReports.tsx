import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ReportFilters from "./reports/ReportFilters";
import FullReportView from "./reports/FullReportView";
import type { ComplaintStatus, FeeStatus, ReportFilters as Filters, ReportType } from "./reports/types";
import { exportCSV, exportPrintPDF, exportFullReportCSV } from "./reports/exporters";
import {
  fetchComplaintReport,
  fetchFeeCollectionReport,
  fetchRoomOccupancyReport,
  fetchStudentReports,
} from "./reports/reportData";
import clsx from "clsx";
import {
  Users,
  Home,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  Download,
  Printer,
  BarChart3,
  Search,
  ChevronRight,
  Info,
} from "lucide-react";

// ============ FORMATTING & UTILITY FUNCTIONS ============

function formatINR(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safe);
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
}

function getCurrentAdminInfo(): { name: string; timestamp: string } {
  const now = new Date();
  const timestamp = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return { name: "Administrator", timestamp };
}

// ============ BADGE COMPONENTS ============

function feeStatusBadge(s: FeeStatus | string) {
  switch (s) {
    case "paid":
      return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-semibold">Paid</Badge>;
    case "partially_paid":
      return <Badge className="bg-sky-600 hover:bg-sky-600 text-white font-semibold">Partially Paid</Badge>;
    case "overdue":
      return <Badge variant="destructive" className="font-semibold">Overdue</Badge>;
    default:
      return <Badge variant="secondary" className="font-semibold">Pending</Badge>;
  }
}

function complaintStatusBadge(s: string) {
  switch (s) {
    case "pending":
      return <Badge variant="secondary" className="font-semibold">Pending</Badge>;
    case "resolved":
      return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-semibold">Resolved</Badge>;
    case "in-progress":
      return <Badge className="bg-sky-600 hover:bg-sky-600 text-white font-semibold">In Progress</Badge>;
    case "rejected":
      return <Badge variant="destructive" className="font-semibold">Rejected</Badge>;
    default:
      return <Badge variant="secondary" className="font-semibold">{s}</Badge>;
  }
}

// ============ PROFESSIONAL REPORT HEADER ============

function ReportHeader({ adminInfo }: { adminInfo: { name: string; timestamp: string } }) {
  return (
    <div className="mb-8 print:mb-6 print:page-break-after-avoid border-b-2 border-gray-300 pb-6 print:pb-4">
      <div className="flex justify-between items-start print:flex-col">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 print:text-2xl tracking-tight">HOSTEL MANAGEMENT SYSTEM</h2>
          <p className="text-sm text-gray-600 mt-2 print:text-xs font-medium">Executive Analytics Report</p>
        </div>
        <div className="text-right text-sm print:text-xs print:mt-3 space-y-1">
          <p className="text-gray-700 font-semibold">{adminInfo.name}</p>
          <p className="text-gray-500 text-xs">{adminInfo.timestamp}</p>
          <p className="text-blue-600 text-xs font-medium">Auto-generated Report</p>
        </div>
      </div>
    </div>
  );
}

// ============ PREMIUM SUMMARY CARD COMPONENT ============

function SummaryCard({ title, value, icon: Icon, loading, colorClass = "bg-blue-600" }: { title: string; value: string; icon: any; loading: boolean; colorClass?: string }) {
  return (
    <Card className="group relative overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] shadow-none transition-colors hover:border-white/[0.09] print:border print:border-slate-100 print:bg-white">
      <div className={`absolute left-0 top-0 h-full w-1 ${colorClass} opacity-80 transition-all group-hover:w-1.5 print:w-1`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 print:pb-1">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 print:text-[10px]">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-300 print:hidden" />
      </CardHeader>
      <CardContent className="print:pt-0">
        <div className="text-2xl font-semibold tracking-tight text-slate-100 print:text-2xl print:text-slate-900">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-white/[0.06] print:bg-slate-100" />
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ MODULE HEADER COMPONENT ============

function ModuleHeader({ title, description, icon: Icon, colorClass = "text-indigo-300" }: { title: string; description: string; icon: any; colorClass?: string }) {
  return (
    <div className="group mb-6 flex items-start gap-4 print:mb-4">
      <div
        className={`rounded-2xl border border-white/[0.08] bg-slate-950/50 p-3 print:hidden ${colorClass}`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-50 print:text-xl print:uppercase print:text-slate-900">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400 print:text-xs print:text-slate-600">{description}</p>
      </div>
    </div>
  );
}

// ============ PREMIUM HORIZONTAL BAR CHART COMPONENT ============

function HorizontalBar({ label, value, maxValue, color = "emerald" }: { label: string; value: number; maxValue: number; color?: string }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-600",
    sky: "bg-sky-600",
    blue: "bg-blue-600",
    orange: "bg-amber-600",
    amber: "bg-amber-600",
    indigo: "bg-indigo-600",
  };

  return (
    <div className="group space-y-2">
      <div className="flex items-end justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-300 transition-colors group-hover:text-slate-200 print:text-slate-700">
          {label}
        </span>
        <span className="rounded-md border border-white/[0.06] bg-slate-950/40 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-50 print:border-slate-200 print:bg-white print:text-slate-900">
          {value.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06] print:bg-slate-100">
        <div
          className={`${colorMap[color] || "bg-blue-600"} h-full rounded-full transition-all duration-700 print:bg-slate-800`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function AdminReports({ embedded = false }: { embedded?: boolean }) {
  const { toast } = useToast();

  const [activeReport, setActiveReport] = useState<ReportType>("fee_collection");
  const [showingFullReport, setShowingFullReport] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    reportType: "fee_collection",
    startDate: undefined,
    endDate: undefined,
    month: undefined,
    feeStatus: "all",
    complaintStatus: "all",
    roomType: "all",
    course: "all",
    year: "all",
    studentQuery: undefined,
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, reportType: activeReport }));
  }, [activeReport]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // For premium PDF export experience
  const [error, setError] = useState<string>("");

  const [feeData, setFeeData] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [complaintData, setComplaintData] = useState<any>(null);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user) throw new Error("Not authenticated");

      const { data: roleRow, error: roleErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.data.session.user.id)
        .maybeSingle();
      if (roleErr) throw roleErr;
      if (roleRow?.role !== "admin") throw new Error("Admins only");

      const f = filtersRef.current;

      if (f.reportType === "fee_collection") {
        const res = await fetchFeeCollectionReport(f);
        setFeeData(res);
      }
      if (f.reportType === "student") {
        const res = await fetchStudentReports(f);
        setStudentData(res);
      }
      if (f.reportType === "room_occupancy") {
        const res = await fetchRoomOccupancyReport(f);
        setRoomData(res);
      }
      if (f.reportType === "complaints") {
        const res = await fetchComplaintReport(f);
        setComplaintData(res);
      }
    } catch (e: any) {
      console.error("[AdminReports] load error", e);
      setError(e?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [activeReport]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 350);
    return () => window.clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-reports-realtime")
      .on(
        "postgres_changes",
        { schema: "public", table: "fees", event: "*" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { schema: "public", table: "fee_payments", event: "*" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { schema: "public", table: "profiles", event: "*" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { schema: "public", table: "complaints", event: "*" },
        () => void load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  // CSV Exports de-prioritized per executive requirement


  const generateFullReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user) throw new Error("Not authenticated");

      const { data: roleRow, error: roleErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.data.session.user.id)
        .maybeSingle();
      if (roleErr) throw roleErr;
      if (roleRow?.role !== "admin") throw new Error("Admins only");

      // Load all 4 reports with no filters for comprehensive view
      const noFilters: Filters = {
        reportType: "fee_collection",
        startDate: undefined,
        endDate: undefined,
        month: undefined,
        feeStatus: "all",
        complaintStatus: "all",
        roomType: "all",
        course: "all",
        year: "all",
        studentQuery: undefined,
      };

      const [feeRes, studentRes, roomRes, complaintRes] = await Promise.all([
        fetchFeeCollectionReport(noFilters),
        fetchStudentReports(noFilters),
        fetchRoomOccupancyReport(noFilters),
        fetchComplaintReport(noFilters),
      ]);

      setFeeData(feeRes);
      setStudentData(studentRes);
      setRoomData(roomRes);
      setComplaintData(complaintRes);
      setShowingFullReport(true);
    } catch (e: any) {
      console.error("[AdminReports] generateFullReport error", e);
      setError(e?.message || "Failed to generate full report");
      toast({ title: "Error", description: e?.message || "Failed to generate full report", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleExecutiveExport = useCallback(async () => {
    setIsExporting(true);
    
    // 1. Initial delay to allow the "Preparing" UI to be seen and for state to settle
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 2. Wait for React to finish rendering the export-only state (double RAF)
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(null);
        });
      });
    });
    
    // 3. Final stabilization delay to ensure any charts or animations have completed
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 4. Trigger print
    window.print();
    
    // 5. Cleanup: wait for the print dialog to close and then revert the UI
    setTimeout(() => {
      setIsExporting(false);
    }, 500);
  }, []);

  // Full Master CSV de-prioritized per executive requirement


  const printScopeRef = useRef<HTMLDivElement | null>(null);
  const adminInfo = useMemo(() => getCurrentAdminInfo(), []);

  const cardSummary = useMemo(() => {
    if (activeReport === "fee_collection") {
      const s = feeData?.summary;
      return {
        a: s ? formatINR(s.totalCollected) : "-",
        b: s ? `${s.paidCount}` : "-",
        c: s ? `${s.partiallyPaidCount}` : "-",
        d: s ? `${s.pendingCount + s.overdueCount}` : "-",
      };
    }
    if (activeReport === "student") {
      const rows = studentData?.rows ?? [];
      return {
        a: String(rows.length),
        b: "-",
        c: "-",
        d: "-",
      };
    }
    if (activeReport === "room_occupancy") {
      return {
        a: roomData ? `${roomData.occupancyPercentage}%` : "-",
        b: roomData ? `${roomData.occupiedRooms}` : "-",
        c: "-",
        d: "-",
      };
    }
    if (activeReport === "complaints") {
      return {
        a: complaintData ? String(complaintData.pendingCount) : "-",
        b: complaintData ? `${complaintData.resolvedCount}` : "-",
        c: complaintData?.categories?.length ? `${complaintData.categories.length}` : "-",
        d: "-",
      };
    }

    return { a: "-", b: "-", c: "-", d: "-" };
  }, [activeReport, feeData, roomData, complaintData, studentData]);

  const summaryCards = {
    fee_collection: [
      { title: "Total Collected", value: cardSummary.a, icon: CreditCard, color: "bg-emerald-600" },
      { title: "Paid", value: cardSummary.b, icon: CheckCircle2, color: "bg-blue-600" },
      { title: "Partially Paid", value: cardSummary.c, icon: TrendingUp, color: "bg-sky-600" },
      { title: "Pending/Overdue", value: cardSummary.d, icon: AlertCircle, color: "bg-orange-600" },
    ],
    student: [
      { title: "Total Students", value: cardSummary.a, icon: Users, color: "bg-blue-600" },
      { title: "Allocated Rooms", value: cardSummary.b, icon: Home, color: "bg-indigo-600" },
      { title: "Active Complaints", value: cardSummary.c, icon: AlertCircle, color: "bg-rose-600" },
      { title: "Fee Compliance", value: cardSummary.d, icon: ShieldCheck, color: "bg-emerald-600" },
    ],
    room_occupancy: [
      { title: "Occupancy Rate", value: cardSummary.a, icon: BarChart3, color: "bg-indigo-600" },
      { title: "Occupied Rooms", value: cardSummary.b, icon: Home, color: "bg-blue-600" },
      { title: "Empty Rooms", value: cardSummary.c, icon: CheckCircle2, color: "bg-emerald-600" },
      { title: "Room Types", value: cardSummary.d, icon: LayoutDashboard, color: "bg-sky-600" },
    ],
    complaints: [
      { title: "Pending", value: cardSummary.a, icon: AlertCircle, color: "bg-orange-600" },
      { title: "Resolved", value: cardSummary.b, icon: CheckCircle2, color: "bg-emerald-600" },
      { title: "Categories", value: cardSummary.c, icon: BarChart3, color: "bg-indigo-600" },
      { title: "This Month", value: cardSummary.d, icon: TrendingUp, color: "bg-blue-600" },
    ],
  };

  return (
    <div
      className={clsx(
        "w-full min-w-0 print:bg-white",
        embedded ? "min-w-0" : "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-slate-900",
      )}
    >
      {/* Show Full Report View if selected */}
      {showingFullReport && feeData && studentData && roomData && complaintData && (
        <div className={`print:opacity-100 ${isExporting ? "opacity-0" : "opacity-100"}`}>
          {/* Close button for full report */}
          <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#0a1224]/95 px-4 py-3 text-slate-100 backdrop-blur-xl print:hidden">
            <div className="flex items-center gap-2">
              <div className="rounded-md border border-white/[0.08] bg-white/[0.06] p-1">
                <ShieldCheck className="h-4 w-4 text-indigo-200" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                Full executive master report
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowingFullReport(false)}
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 hover:bg-white/[0.06]"
            >
              Exit
            </Button>
          </div>

          <div
            className={clsx(
              "print:bg-white",
              embedded
                ? "bg-[radial-gradient(ellipse_at_50%_0%,rgba(148,163,184,0.14)_0%,transparent_55%)] px-3 pb-10 pt-4 sm:px-8"
                : "",
            )}
          >
            <div
              className={clsx(
                "mx-auto flex w-full min-w-0 justify-center text-slate-900 [color-scheme:light]",
                embedded ? "rounded-sm px-0" : "",
              )}
            >
              <FullReportView
                feeData={feeData}
                studentData={studentData}
                roomData={roomData}
                complaintData={complaintData}
                adminInfo={adminInfo}
                loading={false}
                onExportPDF={handleExecutiveExport}
                embeddedInShell={embedded}
              />
            </div>
          </div>
          {/* Export Overlay for Full Report */}
          {isExporting && (
            <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center print:hidden transition-all animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-8 tracking-tighter uppercase italic">Preparing Executive Report</h2>
              <p className="text-slate-500 font-bold text-xs mt-3 uppercase tracking-[0.3em] animate-pulse">Assembling Presentation Quality Archive...</p>
            </div>
          )}
        </div>
      )}

      {/* Regular tab-based view */}
      {!showingFullReport && (
          <div
              id="__hostel_exec_report"
              ref={printScopeRef}
              className={`mx-auto w-full max-w-[1720px] space-y-6 px-0 py-2 print:max-w-full print:space-y-6 print:px-8 print:py-6 print:opacity-100 ${isExporting ? "opacity-0" : "opacity-100"}`}
            >
        {/* Export Overlay for Tabs View */}
        {isExporting && (
          <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center print:hidden transition-all animate-in fade-in duration-500 opacity-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-8 tracking-tighter uppercase italic">Preparing Executive Report</h2>
            <p className="text-slate-500 font-bold text-xs mt-3 uppercase tracking-[0.3em] animate-pulse">Generating Presentation Quality Document...</p>
          </div>
        )}
        {/* Print Header - Hidden on screen */}
        <div className="hidden print:block">
      <ReportHeader adminInfo={adminInfo} />
        </div>

        {/* Print styles for executive report parity (scoped to print only; does not affect embedded preview scaling) */}
        <div className="print:block hidden">
          <style>{`
            @media print {
              @page { size: A4 portrait; margin: 0.5in; }

              /* Preserve the mounted executive preview feel while ensuring clean pagination */
              html, body, #root, #__hostel_exec_report, .exec-report-sheet { background: #fff !important; color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }

              /* Prevent sticky overlays from impacting layout */
              .sticky { position: static !important; }

              /* Remove screen-only overflow constraints from the report subtree only */
              #__hostel_exec_report, #__hostel_exec_report *, .exec-report-sheet, .exec-report-sheet * {
                overflow: visible !important;
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
              }

              /* Force atomic cards and safe page breaking */
              #__hostel_exec_report .print-break-inside-avoid {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              /* Make tables print cleanly */
              #__hostel_exec_report table { width: 100% !important; border-collapse: collapse !important; }
              #__hostel_exec_report thead { display: table-header-group !important; }
              #__hostel_exec_report tfoot { display: table-footer-group !important; }
              #__hostel_exec_report tr, #__hostel_exec_report td, #__hostel_exec_report th { break-inside: avoid !important; page-break-inside: avoid !important; overflow: visible !important; }

              /* Avoid deep clipping from layout helpers */
              #__hostel_exec_report, #__hostel_exec_report section, #__hostel_exec_report div, #__hostel_exec_report main { page-break-inside: auto !important; break-inside: auto !important; }

              /* Typography normalization */
              #__hostel_exec_report { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji" !important; }
              #__hostel_exec_report .text-slate-900 { color: #0f172a !important; }

              /* Preserve section color blocks */
              #__hostel_exec_report .bg-blue-600 { background-color: #2563eb !important; }
              #__hostel_exec_report .bg-emerald-600 { background-color: #059669 !important; }
              #__hostel_exec_report .bg-rose-600 { background-color: #e11d48 !important; }
              #__hostel_exec_report .bg-amber-600 { background-color: #d97706 !important; }
              #__hostel_exec_report .bg-indigo-600 { background-color: #4f46e5 !important; }
              #__hostel_exec_report .text-blue-600 { color: #2563eb !important; }
              #__hostel_exec_report .text-emerald-600 { color: #059669 !important; }
              #__hostel_exec_report .text-rose-600 { color: #e11d48 !important; }

              #__hostel_exec_report img { max-width: 100% !important; height: auto !important; }

              /* Ensure print wrappers are visible */
              .print-hidden { display: none !important; }
            }
          `}</style>
        </div>

        {/* Screen Header */}
        <div className="print:hidden">
          <div className="rounded-[1.25rem] border border-white/[0.06] bg-slate-950/35 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Intelligence workspace
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">Reports</h1>
                <p className="text-sm leading-relaxed text-slate-400 font-medium">
                  Filtered operational datasets with exports aligned to the Hostel OS dark workspace — print output stays audit-ready.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <Button
                  variant="default"
                  onClick={() => void generateFullReport()}
                  disabled={loading || isExporting}
                  className="h-10 whitespace-nowrap text-xs font-semibold print:hidden"
                >
                  {loading ? "Generating…" : "Executive master"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void load()}
                  disabled={loading || isExporting}
                  className="h-10 whitespace-nowrap border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-slate-200 hover:bg-white/[0.06] print:hidden"
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </Button>
                <Button
                  variant="default"
                  onClick={handleExecutiveExport}
                  disabled={loading || isExporting}
                  className="flex h-10 items-center gap-2 whitespace-nowrap bg-slate-100 text-xs font-semibold text-slate-900 hover:bg-white print:hidden"
                >
                  <Printer className="h-4 w-4" />
                  Print / PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className={`print:hidden ${isExporting ? 'hidden' : 'block'}`}>
          <ReportFilters
            value={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters((p) => ({
                ...p,
                startDate: undefined,
                endDate: undefined,
                month: undefined,
                feeStatus: "all",
                complaintStatus: "all",
                roomType: "all",
                course: "all",
                year: "all",
                studentQuery: undefined,
              }))
            }
            reportType={activeReport}
          />
        </div>

        <Tabs value={activeReport} onValueChange={(v) => setActiveReport(v as ReportType)} className="space-y-6">
          <TabsList
            className={`flex h-auto w-full flex-wrap gap-2 rounded-[1rem] border border-white/[0.06] bg-slate-950/40 p-1.5 print:hidden ${isExporting ? "hidden" : "flex"}`}
          >
            <TabsTrigger
              value="fee_collection"
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-100"
            >
              Fees
            </TabsTrigger>
            <TabsTrigger
              value="student"
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-100"
            >
              Students
            </TabsTrigger>
            <TabsTrigger
              value="room_occupancy"
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-100"
            >
              Rooms
            </TabsTrigger>
            <TabsTrigger
              value="complaints"
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-100"
            >
              Complaints
            </TabsTrigger>
          </TabsList>

          {/* ============ FEE COLLECTION REPORT ============ */}
          <TabsContent value="fee_collection" className="space-y-6 outline-none">
            <ModuleHeader 
              title="Revenue & Fee Collection" 
              description="Detailed analysis of student financial engagement, collection trends, and payment compliance across the hostel ecosystem."
              icon={CreditCard}
              colorClass="text-emerald-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
              {summaryCards.fee_collection.map((card, i) => (
                <SummaryCard key={i} title={card.title} value={card.value} icon={card.icon} colorClass={card.color} loading={loading} />
              ))}
            </div>

            {error ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            ) : (
              <div className="space-y-6 print:space-y-5">
                <Card className="print:break-inside-avoid overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] shadow-none transition-colors hover:border-white/[0.09]">
                  <div className="h-1.5 w-full bg-emerald-500" />
                  <CardHeader className="space-y-1 border-b border-white/[0.06] bg-white/[0.02] print:bg-slate-50/90">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 print:text-slate-900">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Monthly Revenue Analytics
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500 print:text-slate-600">Revenue trends analyzed by month within your selected filter period.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Analyzing Financials...</p>
                      </div>
                    ) : feeData?.monthlyRevenue?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 print:gap-6">
                        {feeData.monthlyRevenue.map((p: any) => (
                          <HorizontalBar
                            key={p.key}
                            label={p.month}
                            value={p.amount}
                            maxValue={Math.max(...feeData.monthlyRevenue.map((x: any) => x.amount), 0)}
                            color="emerald"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                        <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No financial data detected</p>
                        <p className="text-xs mt-1">Adjust filters to broaden your search</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="print:break-inside-avoid overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] shadow-none transition-colors hover:border-white/[0.09]">
                  <div className="h-1.5 w-full bg-blue-500" />
                  <CardHeader className="space-y-1 border-b border-white/[0.06] bg-white/[0.02] print:bg-slate-50/90">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 print:text-slate-900">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Detailed Ledger Analysis
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500 print:text-slate-600">Official payment records excluding technical identifiers. High-fidelity financial transparency.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Compiling Records...</p>
                      </div>
                    ) : feeData?.studentWise?.length ? (
                      <div className="overflow-x-auto">
                        <Table className="print:text-[10px]">
                          <TableHeader>
                            <TableRow className="border-b border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] print:bg-slate-50 print:border-slate-100">
                              <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Student ID</TableHead>
                              <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Full Name</TableHead>
                              <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Title</TableHead>
                              <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4 text-right">Total Amount</TableHead>
                              <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4 text-right">Remaining</TableHead>
                              <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Due Date</TableHead>
                              <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4 text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feeData.studentWise.slice(0, 200).map((r: any, idx: number) => (
                              <TableRow
                                key={`${r.student_id}-${r.feeTitle}-${idx}`}
                                className="group hover:bg-white/[0.04] transition-colors border-b border-white/[0.05]"
                              >
                                <TableCell className="font-mono text-[10px] text-slate-400 py-4">{r.student_id}</TableCell>
                                <TableCell className="font-bold text-xs text-slate-50 py-4">{r.studentName || "-"}</TableCell>
                                <TableCell className="text-xs text-slate-300 font-medium py-4">{r.feeTitle}</TableCell>
                                <TableCell className="font-bold text-xs text-right py-4 text-slate-100">{formatINR(r.totalAmount)}</TableCell>
                                <TableCell className="font-bold text-xs text-right py-4 text-rose-400">{formatINR(r.remainingAmount)}</TableCell>
                                <TableCell className="text-[11px] font-bold text-slate-400 py-4">{formatDate(r.feeDueDate)}</TableCell>
                                <TableCell className="text-center py-4">{feeStatusBadge(r.feeStatus)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {feeData.studentWise.length > 200 && (
                          <div className="flex items-center justify-center p-4 bg-slate-50 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Showing first 200 rows. Use CSV Export for full audit trail.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-slate-400">
                        <p className="text-sm font-bold uppercase tracking-widest">No matching ledger entries</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ============ STUDENT REPORT ============ */}
          <TabsContent value="student" className="space-y-6 outline-none">
            <ModuleHeader 
              title="Student Population Analysis" 
              description="Comprehensive demographic breakdown of the student body including room allocations, academic distributions, and engagement metrics."
              icon={Users}
              colorClass="text-blue-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
              {summaryCards.student.map((card, i) => (
                <SummaryCard key={i} title={card.title} value={card.value} icon={card.icon} colorClass={card.color} loading={loading} />
              ))}
            </div>

            {error ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            ) : (
              <Card className="print:break-inside-avoid overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] shadow-none transition-colors hover:border-white/[0.09]">
                <div className="h-1.5 w-full bg-indigo-500" />
                <CardHeader className="space-y-1 border-b border-white/[0.06] bg-white/[0.02] print:bg-slate-50/90">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 print:text-slate-900">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                    Official Student Directory
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 print:text-slate-600">Master allocation register with complete room and fee status tracking.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                      <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Database...</p>
                    </div>
                  ) : studentData?.rows?.length ? (
                    <div className="overflow-x-auto">
                      <Table className="print:text-[10px]">
                        <TableHeader>
                          <TableRow className="border-b border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] print:bg-slate-50 print:border-slate-100">
                            <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Student ID</TableHead>
                            <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Full Name</TableHead>
                            <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Academic Detail</TableHead>
                            <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Room Allocation</TableHead>
                            <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Roommates</TableHead>
                            <TableHead className="font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Status</TableHead>
                            <TableHead className="text-right font-bold text-[10px] text-slate-300 uppercase tracking-wider py-4">Issues</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentData.rows.slice(0, 200).map((r: any, idx: number) => (
                            <TableRow
                              key={`${r.student_id}-${idx}`}
                              className="group hover:bg-white/[0.04] transition-colors border-b border-white/[0.05]"
                            >
                              <TableCell className="font-mono text-[10px] text-slate-400 py-4">{r.student_id}</TableCell>
                              <TableCell className="font-bold text-xs text-slate-50 py-4">{r.studentName || "-"}</TableCell>
                              <TableCell className="text-xs font-bold text-slate-400 py-4">
                                <Badge variant="outline" className="bg-slate-950/40 border-white/[0.06] text-slate-300 font-bold text-[10px]">
                                  {(r.course ?? "-") + " / " + (r.year ?? "-")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-slate-200 py-4 font-medium">
                                {r.room_number ? (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-indigo-300">{r.room_type} - {r.room_number}</span>
                                    <span className="text-[10px] text-slate-400">
                                      {r.block ? `Block ${r.block}` : ""} {r.floor ? `Floor ${r.floor}` : ""}
                                    </span>
                                  </div>
                                ) : "-"}
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="max-w-[200px] truncate">
                                  {r.roommateInfo?.length ? (
                                    <span className="text-[11px] font-medium text-slate-400">
                                      {r.roommateInfo.map((x: any) => x.studentName).join(", ")}
                                    </span>
                                  ) : <span className="text-slate-500 italic text-[11px]">No roommates</span>}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">{feeStatusBadge(r.feeStatus)}</TableCell>
                              <TableCell className="text-right py-4 font-bold text-xs text-slate-100">
                                {r.complaintCount > 0 ? (
                                  <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">{r.complaintCount}</span>
                                ) : <span className="text-slate-500">0</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {studentData.rows.length > 200 && (
                        <div className="flex items-center justify-center p-4 bg-slate-50 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Showing first 200 rows. Use CSV Export for full master directory.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-24 text-slate-400">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">No student data detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ============ ROOM OCCUPANCY REPORT ============ */}
          <TabsContent value="room_occupancy" className="space-y-6 outline-none">
            <ModuleHeader 
              title="Space Utilization Intelligence" 
              description="Real-time capacity analysis and room distribution metrics. Optimize hostel resources and plan for future expansions."
              icon={Home}
              colorClass="text-indigo-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
              {summaryCards.room_occupancy.map((card, i) => (
                <SummaryCard key={i} title={card.title} value={card.value} icon={card.icon} colorClass={card.color} loading={loading} />
              ))}
            </div>

            {error ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            ) : (
              <Card className="print:break-inside-avoid overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] shadow-none transition-colors hover:border-white/[0.09]">
                <div className="h-1.5 w-full bg-sky-500" />
                <CardHeader className="space-y-1 border-b border-white/[0.06] bg-white/[0.02] print:bg-slate-50/90">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 print:text-slate-900">
                    <BarChart3 className="w-5 h-5 text-sky-600" />
                    Room Type Distribution
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 print:text-slate-600">Utilization metrics segmented by room configuration and student allocation.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 px-8 pb-12">
                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600" />
                      <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Calculating Density...</p>
                    </div>
                  ) : roomData?.roomTypeDistribution?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                      {roomData.roomTypeDistribution.map((rt: any) => (
                        <HorizontalBar
                          key={rt.room_type}
                          label={`${rt.room_type} Occupancy`}
                          value={rt.count}
                          maxValue={Math.max(
                            ...roomData.roomTypeDistribution.map((x: any) => Number(x.count) || 0),
                            0,
                          )}
                          color="sky"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400">
                      <Home className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">No occupancy data matched</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ============ COMPLAINTS REPORT ============ */}
          <TabsContent value="complaints" className="space-y-6 outline-none">
            <ModuleHeader 
              title="Grievance & Service Analytics" 
              description="Monitor service quality and maintenance responsiveness. Track resolution times and identify recurring infrastructure issues."
              icon={AlertCircle}
              colorClass="text-rose-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
              {summaryCards.complaints.map((card, i) => (
                <SummaryCard key={i} title={card.title} value={card.value} icon={card.icon} colorClass={card.color} loading={loading} />
              ))}
            </div>

            {error ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            ) : (
              <div className="space-y-6 print:space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:gap-6">
                  {/* Categories */}
                  <Card className="print:break-inside-avoid overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] shadow-none transition-colors hover:border-white/[0.09]">
                    <div className="h-1.5 w-full bg-rose-500" />
                    <CardHeader className="space-y-1 border-b border-white/[0.06] bg-white/[0.02] print:bg-slate-50/90">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 print:text-slate-900">
                        <BarChart3 className="w-5 h-5 text-rose-600" />
                        Incident Categories
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-slate-500 print:text-slate-600">Distribution of complaints by issue category and frequency.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                      {loading ? (
                        <div className="py-10 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        </div>
                      ) : complaintData?.categories?.length ? (
                        <div className="space-y-3 print:space-y-2">
                          {complaintData.categories.map((c: any) => (
                            <div
                              key={c.issue_type}
                              className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-rose-200 hover:shadow-sm transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-400 group-hover:scale-125 transition-transform" />
                                <span className="text-sm font-bold text-slate-700 capitalize">{c.issue_type}</span>
                              </div>
                              <div className="inline-flex items-center justify-center px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-black">
                                {c.count}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-400">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">No incidents recorded</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Trends */}
                  <Card className="print:break-inside-avoid overflow-hidden rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] shadow-none transition-colors hover:border-white/[0.09]">
                    <div className="h-1.5 w-full bg-orange-500" />
                    <CardHeader className="space-y-1 border-b border-white/[0.06] bg-white/[0.02] print:bg-slate-50/90">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 print:text-slate-900">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        Resolution Trends
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-slate-500 print:text-slate-600">Monthly grievance volume analysis and resolution velocity patterns.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 px-8 pb-10">
                      {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
                          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Mapping Trends...</p>
                        </div>
                      ) : complaintData?.trend?.length ? (
                        <div className="space-y-6">
                          {complaintData.trend.map((t: any) => (
                            <HorizontalBar
                              key={t.key}
                              label={t.monthLabel}
                              value={t.count}
                              maxValue={Math.max(...complaintData.trend.map((x: any) => Number(x.count) || 0), 0)}
                              color="orange"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20 text-slate-400">
                          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">No trend patterns found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      )}

      {/* Professional Print Styles — STRICT COLOR & OVERFLOW PRESERVATION */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }

          html, body {
            background: white !important;
            color: #0f172a !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* CRITICAL: Remove overflow constraints */
          .overflow-hidden, .overflow-auto, .overflow-y-auto, .overflow-x-auto {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl {
            box-shadow: none !important;
          }

          h1, h2, h3, h4 {
            page-break-after: avoid;
            break-after: avoid;
          }
          
          section, .card {
            page-break-inside: auto;
            height: auto !important;
            overflow: visible !important;
          }

          /* Color preservation for data visualization */
          .bg-blue-600 { background-color: #2563eb !important; }
          .bg-emerald-600 { background-color: #059669 !important; }
          .bg-rose-600 { background-color: #e11d48 !important; }
          .bg-amber-600 { background-color: #d97706 !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-emerald-600 { color: #059669 !important; }
          .text-rose-600 { color: #e11d48 !important; }
          .text-slate-900 { color: #0f172a !important; }
        }
      `}</style>
    </div>
  );
}
