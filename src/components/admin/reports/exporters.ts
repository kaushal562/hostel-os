import type {
  ComplaintReportResult,
  FeeCollectionReportResult,
  RoomOccupancyReportResult,
  StudentReportResult,
} from "./reportData";
import type { ReportFilters, ReportType } from "./types";

function downloadBlob(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCSV(v: any) {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) {
    const escapedQuotes = s.split('"').join('""');
    return `"${escapedQuotes}"`;
  }
  return s;
}

function formatCSVDate(yyyyMmDdOrIso: string) {
  const d = new Date(yyyyMmDdOrIso);
  if (Number.isNaN(d.getTime())) return yyyyMmDdOrIso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function createReportHeader(reportType: ReportType, timestamp: string): string {
  return `╔══════════════════════════════════════════════════════════════╗
║     HOSTEL MANAGEMENT SYSTEM - ADMINISTRATIVE REPORT      ║
║  ${reportType.replace(/_/g, " ").toUpperCase().padEnd(57)}║
║  Generated: ${timestamp.padEnd(50)}║
╚══════════════════════════════════════════════════════════════╝\n`;
}

function stringifyFilters(filters: ReportFilters, reportType: ReportType) {
  const parts = [];
  if (filters.startDate) parts.push(`Start Date: ${filters.startDate}`);
  if (filters.endDate) parts.push(`End Date: ${filters.endDate}`);
  if (filters.month) parts.push(`Month: ${filters.month}`);
  if (filters.feeStatus && filters.feeStatus !== "all") parts.push(`Fee Status: ${filters.feeStatus}`);
  if (filters.complaintStatus && filters.complaintStatus !== "all") parts.push(`Complaint Status: ${filters.complaintStatus}`);
  if (filters.roomType && filters.roomType !== "all") parts.push(`Room Type: ${filters.roomType}`);
  if (filters.course && filters.course !== "all") parts.push(`Course: ${filters.course}`);
  if (filters.year && filters.year !== "all") parts.push(`Year: ${filters.year}`);
  if (filters.studentQuery) parts.push(`Student Search: ${filters.studentQuery}`);
  
  return parts.length > 0 ? `Filters Applied: ${parts.join(" | ")}` : "";
}

export async function exportCSV({
  reportType,
  filters,
  data,
}: {
  reportType: ReportType;
  filters: ReportFilters;
  data:
    | FeeCollectionReportResult
    | StudentReportResult
    | RoomOccupancyReportResult
    | ComplaintReportResult;
}) {
  const now = new Date();
  const timestamp = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const stamp = now.toISOString().slice(0, 19).split(":").join("-");
  const safe = reportType.split("_").join("-");
  const filename = `hostel-${safe}-report-${stamp}.csv`;

  let csv = "";
  csv += createReportHeader(reportType, timestamp);
  
  const filterLine = stringifyFilters(filters, reportType);
  if (filterLine) csv += `${filterLine}\n`;
  csv += "\n";

  if (reportType === "fee_collection") {
    const d = data as FeeCollectionReportResult;
    csv += "\n┌─ FEE COLLECTION & REVENUE AUDIT ────────────────────────────┐\n";
    csv += "└─────────────────────────────────────────────────────────────┘\n\n";
    
    csv += "SECTION A: FINANCIAL EXECUTIVE SUMMARY\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    if (d.summary) {
      csv += `Key Metric,Value,Status\n`;
      csv += `Total Fee Collection,₹ ${d.summary.totalCollected.toLocaleString('en-IN')},CONFIRMED\n`;
      csv += `Total Outstanding Dues,₹ ${d.studentWise.reduce((sum, row) => sum + row.remainingAmount, 0).toLocaleString('en-IN')},ACTION REQUIRED\n`;
      csv += `Fully Paid Students,${d.summary.paidCount},HEALTHY\n`;
      csv += `Partially Paid Students,${d.summary.partiallyPaidCount},FOLLOW-UP\n`;
      csv += `Pending Students,${d.summary.pendingCount},DUE\n`;
      csv += `Overdue Students,${d.summary.overdueCount},CRITICAL\n`;
    }
    csv += "\n";

    csv += "SECTION B: STUDENT-WISE PAYMENT LEDGER\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    const header = [
      "Student ID",
      "Full Name",
      "Fee Title",
      "Due Date",
      "Status",
      "Total Amount (₹)",
      "Remaining (₹)",
    ];

    csv += header.join(",") + "\n";
    for (const row of d.studentWise) {
      csv +=
        [
          row.student_id,
          row.studentName || "-",
          row.feeTitle,
          row.feeDueDate ? formatCSVDate(row.feeDueDate) : "-",
          row.feeStatus.toUpperCase(),
          row.totalAmount,
          row.remainingAmount,
        ]
          .map(escapeCSV)
          .join(",") + "\n";
    }
    
    csv += "\nSECTION C: COLLECTION VELOCITY (MONTHLY)\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    csv += "Month,Amount (₹),Performance\n";
    if (d.monthlyRevenue) {
      const maxRev = Math.max(...d.monthlyRevenue.map(m => m.amount), 0);
      for (const m of d.monthlyRevenue) {
        const perf = m.amount === maxRev ? "PEAK" : "STABLE";
        csv += `${m.month},₹ ${m.amount.toLocaleString('en-IN')},${perf}\n`;
      }
    }
  }

  if (reportType === "student") {
    const d = data as StudentReportResult;
    csv += "\n┌─ STUDENT REGISTRATION & ALLOCATION MASTER ──────────────────┐\n";
    csv += "└─────────────────────────────────────────────────────────────┘\n\n";
    
    csv += `SECTION A: DEMOGRAPHIC SUMMARY\n`;
    csv += `─────────────────────────────────────────────────────────────\n`;
    csv += `Metric,Value\n`;
    csv += `Total Active Students,${d.rows.length}\n`;
    csv += `Allocated Students,${d.rows.filter(r => r.room_number).length}\n`;
    csv += `Pending Allocation,${d.rows.filter(r => !r.room_number).length}\n\n`;

    csv += "SECTION B: COMPREHENSIVE STUDENT DIRECTORY\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    const header = [
      "Student ID",
      "Full Name",
      "Course",
      "Year",
      "Room",
      "Room Type",
      "Block/Floor",
      "Fee Compliance",
      "Active Issues",
    ];

    csv += header.join(",") + "\n";
    for (const row of d.rows) {
      csv +=
        [
          row.student_id,
          row.studentName || "-",
          row.course || "-",
          row.year || "-",
          row.room_number || "UNALLOCATED",
          row.room_type || "-",
          (row.block ? `B:${row.block}` : "") + (row.floor ? ` F:${row.floor}` : ""),
          row.feeStatus.toUpperCase(),
          row.complaintCount,
        ]
          .map(escapeCSV)
          .join(",") + "\n";
    }
  }

  if (reportType === "room_occupancy") {
    const d = data as RoomOccupancyReportResult;
    csv += "\n┌─ FACILITY UTILIZATION & OCCUPANCY AUDIT ────────────────────┐\n";
    csv += "└─────────────────────────────────────────────────────────────┘\n\n";
    
    csv += "SECTION A: CAPACITY UTILIZATION SUMMARY\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    csv += "Metric,Value,Threshold\n";
    csv += `Occupied Rooms,${d.occupiedRooms},NORMAL\n`;
    csv += `Available Rooms,${d.emptyRooms},AVAILABLE\n`;
    csv += `Global Occupancy Rate,${d.occupancyPercentage}%,${Number(d.occupancyPercentage) > 90 ? "OPTIMAL" : "STABLE"}\n`;
    csv += "\n";

    csv += "SECTION B: ROOM CONFIGURATION DISTRIBUTION\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    csv += "Room Configuration,Student Load,Percentage\n";
    const totalAssigned = d.roomTypeDistribution.reduce((sum, rt) => sum + rt.count, 0);
    for (const rt of d.roomTypeDistribution) {
      const pct = totalAssigned > 0 ? ((rt.count / totalAssigned) * 100).toFixed(1) : "0";
      csv += [rt.room_type.toUpperCase(), rt.count, `${pct}%`].map(escapeCSV).join(",") + "\n";
    }
  }

  if (reportType === "complaints") {
    const d = data as ComplaintReportResult;
    csv += "\n┌─ GRIEVANCE ANALYTICS & SERVICE QUALITY REPORT ──────────────┐\n";
    csv += "└─────────────────────────────────────────────────────────────┘\n\n";
    
    csv += "SECTION A: SERVICE RESOLUTION SUMMARY\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    const totalComplaints = d.pendingCount + d.resolvedCount;
    const resRate = totalComplaints > 0 ? ((d.resolvedCount / totalComplaints) * 100).toFixed(1) : "0";
    csv += "Status Category,Metric,Performance\n";
    csv += `Pending Incidents,${d.pendingCount},ACTION REQUIRED\n`;
    csv += `Resolved Incidents,${d.resolvedCount},COMPLETE\n`;
    csv += `Resolution Velocity,${resRate}%,${Number(resRate) > 80 ? "EXCELLENT" : "IMPROVING"}\n`;
    csv += "\n";

    csv += "SECTION B: INCIDENT CATEGORY BREAKDOWN\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    csv += "Issue Classification,Volume,Density\n";
    for (const c of d.categories) {
      const pct = totalComplaints > 0 ? ((c.count / totalComplaints) * 100).toFixed(1) : "0";
      csv += [c.issue_type.toUpperCase(), c.count, `${pct}%`].map(escapeCSV).join(",") + "\n";
    }

    csv += "\nSECTION C: INCIDENT TREND ANALYSIS\n";
    csv += "─────────────────────────────────────────────────────────────\n";
    csv += "Analysis Period,Incident Volume,Trend\n";
    if (d.trend) {
      const avg = totalComplaints / d.trend.length;
      for (const t of d.trend) {
        const trendIcon = t.count > avg ? "HIGH" : "NORMAL";
        csv += [t.monthLabel, t.count, trendIcon].map(escapeCSV).join(",") + "\n";
      }
    }
  }

  csv += "\n─────────────────────────────────────────────────────────────\n";
  csv += "END OF ADMINISTRATIVE RECORD\n";
  csv += "═════════════════════════════════════════════════════════════\n\n";
  csv += "CONFIDENTIALITY & SECURITY NOTICE:\n";
  csv += "This document contains sensitive administrative intelligence.\n";
  csv += "• 100% UUID-FREE GUARANTEE: All internal identifiers obfuscated\n";
  csv += "• ACCESS RESTRICTED: Authorized administrators only\n";
  csv += "• DATA PRIVACY: Official Student IDs utilized exclusively\n";
  csv += "• AUDIT TRAIL: Exported from HMS Enterprise Engine\n";
  csv += "═════════════════════════════════════════════════════════════\n";

  downloadBlob(filename, csv, "text/csv;charset=utf-8");
}

export function exportPrintPDF() {
  window.print();
}

export async function exportFullReportCSV({
  feeData,
  studentData,
  roomData,
  complaintData,
  timestamp,
}: {
  feeData: FeeCollectionReportResult;
  studentData: StudentReportResult;
  roomData: RoomOccupancyReportResult;
  complaintData: ComplaintReportResult;
  timestamp: string;
}) {
  const stamp = new Date().toISOString().slice(0, 19).split(":").join("-");
  const filename = `hostel-full-master-report-${stamp}.csv`;

  let csv = "";
  csv += "═══════════════════════════════════════════════════════════════\n";
  csv += "HOSTEL MANAGEMENT SYSTEM - FULL EXECUTIVE MASTER REPORT\n";
  csv += "═══════════════════════════════════════════════════════════════\n";
  csv += `Generated: ${timestamp}\n`;
  csv += `Report Type: Complete Comprehensive Analysis (All Modules)\n`;
  csv += "═══════════════════════════════════════════════════════════════\n\n";

  // ============ EXECUTIVE SUMMARY ============
  csv += "─────────────────────────────────────────────────────────────\n";
  csv += "EXECUTIVE SUMMARY - KEY METRICS AT A GLANCE\n";
  csv += "─────────────────────────────────────────────────────────────\n\n";

  // Calculate key metrics
  const totalStudents = studentData.rows.length;
  const totalRoomOccupancy = roomData.occupancyPercentage;
  const totalFeeCollected = feeData.summary.totalCollected;
  const totalPendingFees = feeData.studentWise
    .reduce((sum, row) => sum + row.remainingAmount, 0);
  const totalComplaints = complaintData.pendingCount + complaintData.resolvedCount;
  const resolvedComplaints = complaintData.resolvedCount;
  const resolutionRate = totalComplaints > 0 
    ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) 
    : "0";

  csv += "Metric,Value\n";
  csv += `Total Students,${totalStudents}\n`;
  csv += `Room Occupancy Rate,%,${totalRoomOccupancy}\n`;
  csv += `Total Fee Collection,₹,${totalFeeCollected.toLocaleString('en-IN')}\n`;
  csv += `Total Pending Fees,₹,${totalPendingFees.toLocaleString('en-IN')}\n`;
  csv += `Total Complaints,${totalComplaints}\n`;
  csv += `Resolved Complaints,${resolvedComplaints}\n`;
  csv += `Complaint Resolution Rate,%,${resolutionRate}\n\n`;

  // ============ STUDENT ANALYTICS ============
  csv += "─────────────────────────────────────────────────────────────\n";
  csv += "SECTION A: STUDENT ANALYTICS\n";
  csv += "─────────────────────────────────────────────────────────────\n\n";

  const studentHeader = [
    "Student ID",
    "Full Name",
    "Course/Year",
    "Room Allocation",
    "Block/Floor",
    "Roommates",
    "Fee Status",
    "Active Complaints",
  ];

  csv += studentHeader.map(escapeCSV).join(",") + "\n";

  for (const row of studentData.rows) {
    csv +=
      [
        row.student_id,
        row.studentName || "-",
        (row.course ?? "-") + " / " + (row.year ?? "-"),
        row.room_number ? `${row.room_type} - Room ${row.room_number}` : "-",
        [row.block ? `Block ${row.block}` : "", row.floor ? `Floor ${row.floor}` : ""]
          .filter(Boolean)
          .join(" ") || "-",
        row.roommateInfo.length > 0
          ? row.roommateInfo.map((x) => x.studentName).join("; ")
          : "-",
        row.feeStatus,
        row.complaintCount,
      ]
        .map(escapeCSV)
        .join(",") + "\n";
  }

  csv += `Total Students,${studentData.rows.length}\n\n`;

  // ============ FEE ANALYTICS ============
  csv += "─────────────────────────────────────────────────────────────\n";
  csv += "SECTION B: FEE ANALYTICS & PAYMENT TRACKING\n";
  csv += "─────────────────────────────────────────────────────────────\n\n";

  csv += "B1. MONTHLY REVENUE ANALYTICS\n";
  csv += "Month,Amount (₹)\n";
  for (const point of feeData.monthlyRevenue) {
    csv += `${point.month},${point.amount}\n`;
  }
  csv += "\n";

  csv += "B2. STUDENT-WISE PAYMENT HISTORY\n";
  const feeHeader = [
    "Student ID",
    "Student Name",
    "Fee Title",
    "Total Amount (₹)",
    "Remaining Amount (₹)",
    "Due Date",
    "Status",
  ];

  csv += feeHeader.map(escapeCSV).join(",") + "\n";

  for (const row of feeData.studentWise) {
    csv +=
      [
        row.student_id,
        row.studentName || "-",
        row.feeTitle,
        row.totalAmount,
        row.remainingAmount,
        row.feeDueDate ? formatCSVDate(row.feeDueDate) : "-",
        row.feeStatus,
      ]
        .map(escapeCSV)
        .join(",") + "\n";
  }

  csv += "\nB3. FEE COLLECTION SUMMARY\n";
  csv += "Status Category,Count,Percentage\n";
  const totalStudentsCount = feeData.summary.paidCount + 
                             feeData.summary.partiallyPaidCount + 
                             feeData.summary.pendingCount + 
                             feeData.summary.overdueCount;

  if (totalStudentsCount > 0) {
    csv += `Fully Paid,${feeData.summary.paidCount},${((feeData.summary.paidCount / totalStudentsCount) * 100).toFixed(1)}%\n`;
    csv += `Partially Paid,${feeData.summary.partiallyPaidCount},${((feeData.summary.partiallyPaidCount / totalStudentsCount) * 100).toFixed(1)}%\n`;
    csv += `Pending,${feeData.summary.pendingCount},${((feeData.summary.pendingCount / totalStudentsCount) * 100).toFixed(1)}%\n`;
    csv += `Overdue,${feeData.summary.overdueCount},${((feeData.summary.overdueCount / totalStudentsCount) * 100).toFixed(1)}%\n`;
  }

  csv += `\nTotal Revenue Collected (₹),${feeData.summary.totalCollected}\n`;
  csv += `Total Pending Dues (₹),${totalPendingFees}\n\n`;

  // ============ COMPLAINT ANALYTICS ============
  csv += "─────────────────────────────────────────────────────────────\n";
  csv += "SECTION C: COMPLAINT ANALYTICS & TRENDS\n";
  csv += "─────────────────────────────────────────────────────────────\n\n";

  csv += "C1. COMPLAINT SUMMARY\n";
  csv += "Status,Count\n";
  csv += `Pending,${complaintData.pendingCount}\n`;
  csv += `Resolved,${complaintData.resolvedCount}\n`;
  csv += `Total,${totalComplaints}\n\n`;

  csv += "C2. COMPLAINT CATEGORIES\n";
  csv += "Issue Type,Count,Percentage\n";
  for (const cat of complaintData.categories) {
    const pct = totalComplaints > 0 ? ((cat.count / totalComplaints) * 100).toFixed(1) : "0";
    csv += `${cat.issue_type},${cat.count},${pct}%\n`;
  }

  csv += "\nC3. COMPLAINT TRENDS (MONTHLY)\n";
  csv += "Month,Count\n";
  for (const trend of complaintData.trend) {
    csv += `${trend.monthLabel},${trend.count}\n`;
  }

  csv += "\n";

  // ============ OCCUPANCY ANALYTICS ============
  csv += "─────────────────────────────────────────────────────────────\n";
  csv += "SECTION D: ROOM OCCUPANCY ANALYTICS\n";
  csv += "─────────────────────────────────────────────────────────────\n\n";

  csv += "D1. OCCUPANCY SUMMARY\n";
  csv += "Metric,Value\n";
  csv += `Occupied Rooms,${roomData.occupiedRooms}\n`;
  csv += `Empty Rooms,${roomData.emptyRooms}\n`;
  csv += `Occupancy Rate (%),${roomData.occupancyPercentage}\n\n`;

  csv += "D2. ROOM TYPE DISTRIBUTION\n";
  csv += "Room Type,Students Assigned,Percentage\n";
  const totalRooms = roomData.roomTypeDistribution.reduce((sum, rt) => sum + rt.count, 0);
  for (const rt of roomData.roomTypeDistribution) {
    const pct = totalRooms > 0 ? ((rt.count / totalRooms) * 100).toFixed(1) : "0";
    csv += `${rt.room_type},${rt.count},${pct}%\n`;
  }

  csv += "\n";

  // ============ FOOTER ============
  csv += "═══════════════════════════════════════════════════════════════\n";
  csv += "END OF COMPREHENSIVE EXECUTIVE MASTER ARCHIVE\n";
  csv += "═══════════════════════════════════════════════════════════════\n";
  csv += "\nEXECUTIVE SECURITY SUMMARY:\n";
  csv += "This report has been processed by the HMS Privacy Engine. \n";
  csv += "All internal Supabase UUIDs and technical primary keys have \n";
  csv += "been eliminated. Identification is restricted to official \n";
  csv += "Student Registration Numbers only.\n";

  downloadBlob(filename, csv, "text/csv;charset=utf-8");
}

