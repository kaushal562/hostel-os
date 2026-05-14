import React, { useMemo } from "react";
import clsx from "clsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Home, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Calendar,
  ShieldCheck,
  Award,
  Download,
  Printer,
  ChevronRight
} from "lucide-react";
import type {
  FeeCollectionReportResult,
  StudentReportResult,
  RoomOccupancyReportResult,
  ComplaintReportResult,
} from "./reportData";
import type { FeeStatus } from "./types";

// Formatting utilities
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
  return d.toLocaleDateString("en-IN", { 
    year: "numeric", 
    month: "short", 
    day: "2-digit" 
  });
}

function feeStatusBadge(s: FeeStatus | string) {
  switch (s) {
    case "paid":
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[9px] uppercase tracking-wider px-2 py-0">Paid</Badge>;
    case "partially_paid":
      return <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-black text-[9px] uppercase tracking-wider px-2 py-0">Partial</Badge>;
    case "overdue":
      return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-100 font-black text-[9px] uppercase tracking-wider px-2 py-0">Overdue</Badge>;
    default:
      return <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100 font-black text-[9px] uppercase tracking-wider px-2 py-0">Pending</Badge>;
  }
}

function ExecutiveSummaryCard({ title, value, colorClass, isPrimary }: { title: string; value: string; colorClass: string; isPrimary?: boolean }) {
  return (
    <div className={`bg-white border-l-4 border-slate-200 p-8 space-y-0.5 print:border-slate-300 print:shadow-none transition-all hover:bg-slate-50 ${isPrimary ? 'bg-blue-50/30 ring-1 ring-inset ring-blue-100/50' : ''}`}>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
      <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</p>
      <div className={`h-1.5 w-10 ${colorClass} mt-4 opacity-80`} />
    </div>
  );
}

function ProfessionalBar({
  label,
  value,
  maxValue,
  color = "blue",
}: {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-600",
    blue: "bg-blue-600",
    amber: "bg-amber-600",
  };

  return (
    <div className="space-y-2.5 print:break-inside-avoid group">
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{label}</span>
        <span className="text-xs font-black text-slate-900 tabular-nums">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100/80 rounded-none overflow-hidden">
        <div
          className={`${colorMap[color] || "bg-blue-600"} h-full transition-all duration-1000 ease-out group-hover:opacity-80`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export interface FullReportViewProps {
  feeData: FeeCollectionReportResult;
  studentData: StudentReportResult;
  roomData: RoomOccupancyReportResult;
  complaintData: ComplaintReportResult;
  adminInfo: { name: string; timestamp: string };
  loading?: boolean;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  /** When true, document sits inside admin shell — avoid full-viewport height and force light document colors. */
  embeddedInShell?: boolean;
}

export default function FullReportView({
  feeData,
  studentData,
  roomData,
  complaintData,
  adminInfo,
  loading = false,
  onExportPDF,
  embeddedInShell = false,
}: FullReportViewProps) {
  const isExportingLocal = false; // We use the parent's isExporting through overlay, but can add local state if needed

  if (loading) {
    return (
      <div
        className={clsx(
          "bg-slate-50 print:bg-white font-sans text-slate-900 selection:bg-blue-100 antialiased [color-scheme:light]",
          embeddedInShell ? "min-h-0 w-full min-w-0" : "min-h-screen",
        )}
      >
        <div
          className={clsx(
            embeddedInShell && "flex w-full min-w-0 justify-center px-2 sm:px-4",
          )}
        >
          <div
            className={clsx(
              "exec-report-sheet mx-auto w-full max-w-[210mm] bg-white print:mx-0 print:max-w-none print:w-full print:shadow-none print:opacity-100",
              embeddedInShell
                ? "shadow-[0_32px_120px_-48px_rgba(15,23,42,0.65)] ring-1 ring-slate-900/12"
                : "shadow-2xl",
            )}
          >
            <header className="flex items-end justify-between border-b-4 border-slate-900 p-12 pb-8 print:p-8">
              <div className="min-w-0 flex-1 space-y-6">
                <div className="h-3 max-w-[12rem] animate-pulse rounded-none bg-slate-200" />
                <div className="space-y-3">
                  <div className="h-12 max-w-[min(100%,24rem)] animate-pulse bg-slate-200" />
                  <div className="h-3 max-w-[14rem] animate-pulse bg-slate-100" />
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-4 pl-6">
                <div className="mb-6 h-14 w-[min(100%,14rem)] max-w-full animate-pulse bg-slate-200 print:hidden" />
                <div className="h-8 w-24 animate-pulse bg-slate-100" />
                <div className="h-6 w-28 animate-pulse bg-slate-100" />
              </div>
            </header>

            <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/30 print:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="space-y-3 border-l-4 border-slate-200 p-8 print:border-slate-300"
                >
                  <div className="h-2 w-20 animate-pulse bg-slate-200" />
                  <div className="h-10 w-16 animate-pulse bg-slate-200" />
                  <div className="mt-4 h-1.5 w-10 animate-pulse bg-slate-200" />
                </div>
              ))}
            </div>

            <main className="flex flex-col items-center p-12 print:p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Assembling Executive Report...
              </p>
              <div className="mt-14 w-full max-w-xl space-y-3">
                <div className="h-2.5 w-full animate-pulse rounded-none bg-slate-100" />
                <div className="h-2.5 w-[92%] animate-pulse rounded-none bg-slate-100" />
                <div className="h-2.5 w-[76%] animate-pulse rounded-none bg-slate-100" />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const executiveSummary = useMemo(() => {
    const totalStudents = studentData.rows.length;
    const totalFeeCollected = feeData.summary.totalCollected;
    const totalPendingFees = feeData.studentWise.reduce((sum, row) => sum + row.remainingAmount, 0);
    const totalComplaints = complaintData.pendingCount + complaintData.resolvedCount;
    const resolutionRate =
      totalComplaints > 0 ? (((complaintData.resolvedCount / totalComplaints) * 100).toFixed(1)) : "0";

    return {
      totalStudents,
      occupancyRate: roomData.occupancyPercentage,
      totalFeeCollected,
      totalPendingFees,
      totalComplaints,
      resolvedComplaints: complaintData.resolvedCount,
      resolutionRate,
      reportId: `HMS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    };
  }, [feeData, studentData, roomData, complaintData]);

  return (
    <div
      className={clsx(
        "bg-slate-50 print:bg-white font-sans text-slate-900 selection:bg-blue-100 antialiased [color-scheme:light]",
        embeddedInShell ? "min-h-0 w-full min-w-0" : "min-h-screen",
      )}
    >
      {/* A4-width sheet — same logical width for embedded preview, standalone, and @page print */}
      <div
        className={clsx(
          embeddedInShell && "flex w-full min-w-0 justify-center px-2 sm:px-4",
        )}
      >
        <div
          className={clsx(
            "exec-report-sheet mx-auto w-full max-w-[210mm] bg-white print:mx-0 print:max-w-none print:w-full print:shadow-none print:opacity-100",
            embeddedInShell
              ? "shadow-[0_32px_120px_-48px_rgba(15,23,42,0.65)] ring-1 ring-slate-900/12"
              : "shadow-2xl",
          )}
        >
        
        {/* ============ EXECUTIVE DOCUMENT HEADER ============ */}
        <header className="p-12 pb-8 border-b-4 border-slate-900 flex justify-between items-end print:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-0 text-slate-900 border-b-2 border-blue-600 pb-1">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.05em]">Administrative Intelligence Archive</span>
            </div>
            <div className="space-y-0">
              <h1 className="text-5xl font-black text-slate-900 tracking-[-0.04em] uppercase leading-[0.82] print:text-4xl">
                Master <br />
                <span className="text-blue-700">Executive</span> Report
              </h1>
              <p className="text-slate-400 font-bold text-xs tracking-[0.05em] uppercase pt-2">
                Quarterly Facility Utilization & Financial Audit
              </p>
            </div>
          </div>

          <div className="text-right space-y-4 flex flex-col items-end">
            <div className="print:hidden mb-6">
              <button
                onClick={onExportPDF}
                className="group relative inline-flex items-center gap-4 px-8 py-4 bg-blue-600 text-white rounded-none font-black text-sm uppercase tracking-[0.25em] hover:bg-slate-900 transition-all duration-500 shadow-[12px_12px_0px_0px_rgba(37,99,235,0.2)] hover:shadow-[16px_16px_0px_0px_rgba(15,23,42,0.3)] active:translate-y-1 ring-2 ring-blue-600 ring-offset-4 ring-offset-white"
              >
                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                <span>Download Executive PDF</span>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Document ID</p>
              <p className="text-slate-900 font-black text-sm tabular-nums">{executiveSummary.reportId}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Classification</p>
              <Badge variant="outline" className="border-slate-900 text-slate-900 font-black text-[9px] uppercase px-2 rounded-none">INTERNAL USE ONLY</Badge>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Issued Date</p>
              <p className="text-slate-900 font-black text-xs tabular-nums">{adminInfo.timestamp}</p>
            </div>
          </div>
        </header>

        {/* ============ CORE METRICS MATRIX ============ */}
        <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/30 print:grid-cols-4">
          <ExecutiveSummaryCard title="Active Population" value={String(executiveSummary.totalStudents)} colorClass="bg-blue-600" />
          <ExecutiveSummaryCard title="Occupancy Rate" value={`${executiveSummary.occupancyRate}%`} colorClass="bg-indigo-600" />
          <ExecutiveSummaryCard title="Gross Revenue" value={formatINR(executiveSummary.totalFeeCollected)} colorClass="bg-emerald-600" isPrimary />
          <ExecutiveSummaryCard title="Outstanding" value={formatINR(executiveSummary.totalPendingFees)} colorClass="bg-rose-600" />
        </div>

        {/* ============ MAIN CONTENT AREA ============ */}
        <main className="p-12 space-y-24 print:p-8 print:space-y-16">
          
          {/* SECTION 1: FINANCIAL PERFORMANCE */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-900/10 pb-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-slate-900" />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">01. Financial Performance</h2>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Revenue Audit</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 print:gap-8">
              {/* Revenue Trends */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-3 bg-blue-600" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Collection Trajectory</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {feeData.monthlyRevenue.slice(0, 6).map((p) => (
                    <ProfessionalBar
                      key={p.key}
                      label={p.month}
                      value={p.amount}
                      maxValue={Math.max(...feeData.monthlyRevenue.map((x) => x.amount), 1)}
                      color="blue"
                    />
                  ))}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-slate-50 p-8 space-y-8 border border-slate-100 ring-1 ring-inset ring-white">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-3 bg-blue-600" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Compliance Distribution</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Fully Paid", count: feeData.summary.paidCount, color: "emerald" },
                    { label: "Pending Dues", count: feeData.summary.pendingCount + feeData.summary.overdueCount, color: "amber" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>{item.label}</span>
                        <span>{item.count}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-200">
                        <div 
                          className={`h-full ${item.color === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'}`} 
                          style={{ width: `${(item.count / (studentData.rows.length || 1)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-8 border-t border-slate-200">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Audit Value</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{formatINR(feeData.summary.totalCollected)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: STUDENT DIRECTORY */}
          <section className="space-y-6 pt-4 print:page-break-before">
            <div className="flex items-center justify-between border-b border-slate-900/10 pb-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-slate-900" />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">02. Student Population</h2>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{studentData.rows.length} Active Records</span>
            </div>

            <div className="overflow-hidden border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-900">
                  <TableRow className="hover:bg-slate-900">
                    <TableHead className="text-white font-black text-[10px] uppercase tracking-wider py-3 pl-6">Student ID</TableHead>
                    <TableHead className="text-white font-black text-[10px] uppercase tracking-wider py-3">Full Name</TableHead>
                    <TableHead className="text-white font-black text-[10px] uppercase tracking-wider py-3">Course / Year</TableHead>
                    <TableHead className="text-white font-black text-[10px] uppercase tracking-wider py-3">Allocation</TableHead>
                    <TableHead className="text-white font-black text-[10px] uppercase tracking-wider py-3 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.rows.map((r, idx) => (
                    <TableRow key={idx} className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <TableCell className="font-black text-slate-900 py-3 pl-6 text-[11px] align-middle">{r.student_id}</TableCell>
                      <TableCell className="font-bold text-slate-800 text-[11px] py-3 align-middle">{r.studentName}</TableCell>
                      <TableCell className="text-slate-500 font-medium text-[10px] uppercase py-3 align-middle">
                        {r.course} <span className="text-slate-300 mx-1">/</span> {r.year}
                      </TableCell>
                      <TableCell className="text-[10px] font-bold text-slate-700 uppercase py-3 align-middle">
                        {r.room_number ? `${r.room_type} Room ${r.room_number}` : "Unallocated"}
                      </TableCell>
                      <TableCell className="text-center py-3 align-middle">{feeStatusBadge(r.feeStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* SECTION 3: REVENUE LEDGER */}
          <section className="space-y-6 pt-4 print:page-break-before">
            <div className="flex items-center justify-between border-b border-slate-900/10 pb-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-slate-900" />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">03. Revenue Ledger</h2>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Transaction Audit</span>
            </div>

            <div className="overflow-hidden border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-black text-[10px] text-slate-600 uppercase tracking-wider py-3 pl-6">Student ID</TableHead>
                    <TableHead className="font-black text-[10px] text-slate-600 uppercase tracking-wider py-3">Transaction Description</TableHead>
                    <TableHead className="font-black text-[10px] text-slate-600 uppercase tracking-wider py-3 text-right">Value</TableHead>
                    <TableHead className="font-black text-[10px] text-slate-600 uppercase tracking-wider py-3 text-right">Balance</TableHead>
                    <TableHead className="font-black text-[10px] text-slate-600 uppercase tracking-wider py-3 text-center">Audit Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeData.studentWise.map((r, idx) => (
                    <TableRow key={idx} className="border-b border-slate-100 even:bg-slate-50/30 hover:bg-slate-50 transition-colors">
                      <TableCell className="font-black text-slate-900 py-3 pl-6 text-[11px] align-middle">{r.student_id}</TableCell>
                      <TableCell className="py-3 align-middle">
                        <div className="font-bold text-slate-800 text-[11px]">{r.feeTitle}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{r.studentName}</div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-[11px] text-right py-3 align-middle tabular-nums">{formatINR(r.totalAmount)}</TableCell>
                      <TableCell className={`font-black text-[11px] text-right py-3 align-middle tabular-nums ${r.remainingAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {formatINR(r.remainingAmount)}
                      </TableCell>
                      <TableCell className="text-center py-3 align-middle">{feeStatusBadge(r.feeStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* ============ FOOTER / SIGNATURES ============ */}
          <footer className="pt-32 space-y-16 print:pt-20">
            <div className="grid grid-cols-2 gap-24 print:gap-16">
              <div className="space-y-12">
                <div className="border-t-2 border-slate-900 pt-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Authorized Administrative Signature</p>
                  <p className="text-2xl font-black text-slate-900 mt-4">{adminInfo.name}</p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hostel Administrator</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-none border-l-4 border-blue-600">
                  <Award className="w-8 h-8 text-blue-400 shrink-0" />
                  <p className="text-[10px] leading-relaxed font-bold uppercase tracking-wider opacity-80">
                    Certified Accurate by HMS Enterprise Audit Engine. This document serves as a legal administrative record for the current period.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-8 border border-slate-200 space-y-6">
                  <div className="flex items-center gap-2 text-rose-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-black uppercase tracking-wider text-[10px]">Data Privacy Protocol</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    This report contains sensitive operational data. All PII (Personally Identifiable Information) is protected under the Administrative Security Act. Technical identifiers and system UUIDs have been obfuscated for security compliance.
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider pt-4">
                  <span>&copy; {new Date().getFullYear()} HMS ENTERPRISE</span>
                  <span>VERSION 4.0.5S</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
        </div>
      </div>

      {/* ============ PREMIUM PRINT ARCHITECTURE — STRICT COLOR & CLIPPING PRESERVATION ============ */}
      <style>{`
        @page { 
          size: A4; 
          margin: 15mm 12mm;
          padding: 0;
        }

        @media print {
          html, body {
            background: white !important;
            margin: 0 !important; 
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            width: 100% !important;
            height: auto !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* CRITICAL: Remove ALL overflow/height constraints that cause clipping */
          .overflow-hidden, .overflow-auto, .overflow-y-auto, .overflow-x-auto,
          [data-radix-scroll-area-viewport], [data-radix-scroll-area-root] {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            min-height: auto !important;
          }
          .exec-report-sheet {
            box-shadow: none !important;
            max-width: none !important;
            width: 100% !important;
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* CRITICAL: Ensure sections can expand fully */
          main, section, div {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          /* Hide interactive elements */
          .print\\:hidden { display: none !important; }
          /* Page breaks — allow natural flow */
          .print\\:page-break-before { page-break-before: always; break-before: page; }
          .print\\:break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          section { page-break-inside: auto; break-inside: auto; }
          tbody tr { page-break-inside: avoid; break-inside: avoid; }
          tbody { page-break-inside: auto; break-inside: auto; }
          footer { page-break-inside: avoid; break-inside: avoid; }
          /* Tables — ensure full rendering */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 9px !important;
            page-break-inside: auto !important;
            overflow: visible !important;
            background-color: transparent !important;
          }
          thead { display: table-header-group !important; }
          tfoot { display: table-footer-group !important; }
          tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: visible !important;
          }
          html, body, #root, #__hostel_exec_report, .exec-report-sheet, main, section, div {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            page-break-inside: auto !important;
          }
          .exec-report-sheet {
            box-shadow: none !important;
            max-width: none !important;
            width: 100% !important;
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-after: auto !important;
            page-break-before: auto !important;
          }
          section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: auto !important;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
          }
          thead { display: table-header-group !important; }
          th { background-color: #0f172a !important; color: #ffffff !important; }
          td { border-bottom: 1px solid #f1f5f9 !important; }
          /* Remove ALL shadows */
          .shadow-2xl, .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm, .ring-1, .ring-2 {
            box-shadow: none !important;
            --tw-ring-shadow: none !important;
          }
          /* ========== STRICT COLOR PRESERVATION ========== */
          /* Backgrounds — preserve exact colors for sections */
          .bg-white          { background-color: #ffffff !important; }
          .bg-slate-50       { background-color: #f8fafc !important; }
          .bg-slate-100      { background-color: #f1f5f9 !important; }
          .bg-slate-200      { background-color: #e2e8f0 !important; }
          .bg-slate-900      { background-color: #0f172a !important; }
          .bg-blue-50        { background-color: #eff6ff !important; }
          .bg-blue-100       { background-color: #dbeafe !important; }
          .bg-blue-600       { background-color: #2563eb !important; }
          .bg-blue-700       { background-color: #1d4ed8 !important; }
          .bg-blue-800       { background-color: #1e40af !important; }
          .bg-emerald-600    { background-color: #059669 !important; }
          .bg-rose-600       { background-color: #e11d48 !important; }
          .bg-amber-600      { background-color: #d97706 !important; }
          .bg-indigo-600     { background-color: #4f46e5 !important; }
          /* Text colors — preserve all variants */
          .text-slate-50     { color: #f8fafc !important; }
          .text-slate-900    { color: #0f172a !important; }
          .text-slate-800    { color: #1e293b !important; }
          .text-slate-700    { color: #334155 !important; }
          .text-slate-600    { color: #475569 !important; }
          .text-slate-500    { color: #64748b !important; }
          .text-slate-400    { color: #94a3b8 !important; }
          .text-blue-600     { color: #2563eb !important; }
          .text-blue-700     { color: #1d4ed8 !important; }
          .text-blue-800     { color: #1e40af !important; }
          .text-emerald-600  { color: #059669 !important; }
          .text-rose-600     { color: #e11d48 !important; }
          .text-amber-600    { color: #d97706 !important; }
          .text-white        { color: #ffffff !important; }
          /* Border colors — force exact match */
          .border-slate-900  { border-color: #0f172a !important; }
          .border-slate-200  { border-color: #e2e8f0 !important; }
          .border-slate-100  { border-color: #f1f5f9 !important; }
          .border-blue-600   { border-color: #2563eb !important; }
          .border-blue-100   { border-color: #dbeafe !important; }
          /* Gradient preservation */
          .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important; }
          .from-blue-50 { --tw-gradient-from: #eff6ff !important; }
          .to-blue-100 { --tw-gradient-to: #dbeafe !important; }
        }
      `}</style>

    </div>
  );
}

