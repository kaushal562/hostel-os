import { supabase } from "@/lib/supabase";
import type { ComplaintStatus, FeeStatus, ReportFilters, MonthlyAmountPoint, RoomType } from "./types";

export type FeeCollectionSummary = {
  totalCollected: number;
  pendingCount: number;
  partiallyPaidCount: number;
  paidCount: number;
  overdueCount: number;
  fullyPaidStudentCount: number;
};

export type StudentPaymentRow = {
  student_id: string;
  studentName: string;
  feeTitle: string;
  feeDueDate: string | null;
  feeStatus: FeeStatus;
  totalAmount: number;
  remainingAmount: number;
  // Export/print uses only count + aggregated fields; internal payment ids must not leak.
  paymentHistory: Array<{
    paid_at: string | null;
    created_at: string | null;
    payment_method: string | null;
    payment_status: string | null;
    amount_paid: number;
    transaction_reference: string | null;
  }>;
};


export type FeeCollectionReportResult = {
  summary: FeeCollectionSummary;
  monthlyRevenue: MonthlyAmountPoint[];
  studentWise: StudentPaymentRow[];
};

export type StudentReportRow = {
  student_id: string;
  studentName: string;
  course: string | null;
  year: string | null;
  room_number: string | null;
  room_type: RoomType | string | null;
  block: string | null;
  floor: string | null;

  roommateInfo: Array<{ student_id: string; studentName: string; full_name: string | null }>;

  feeStatus: FeeStatus | "unknown";
  complaintCount: number;
};

export type StudentReportResult = {
  rows: StudentReportRow[];
};

export type RoomOccupancyRow = {
  room_type: RoomType | string;
  occupiedCount: number;
  emptyCount: number;
  occupancyPercentage: number;
};

export type RoomOccupancyReportResult = {
  occupiedRooms: number;
  emptyRooms: number;
  occupancyPercentage: number;
  roomTypeDistribution: Array<{ room_type: RoomType | string; count: number }>;
};

export type ComplaintTrendPoint = {
  key: string; // YYYY-MM
  monthLabel: string;
  count: number;
};

export type ComplaintReportResult = {
  pendingCount: number;
  resolvedCount: number;
  categories: Array<{ issue_type: string; count: number }>;
  trend: ComplaintTrendPoint[];
};

const toISODate = (yyyyMmDd?: string) => {
  if (!yyyyMmDd) return undefined;
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(d.getTime())) return undefined;
  // inclusive end-of-day conversion not handled here; caller can adjust if needed
  return d.toISOString();
};

const applyMonthToRange = (month?: string) => {
  if (!month) return { start: undefined, end: undefined };
  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return { start: undefined, end: undefined };
  }
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

const normalizeRoomType = (t: string | null | undefined): string | null => {
  if (!t) return null;
  const s = String(t).toLowerCase();
  if (s === "single" || s === "double" || s === "triple" || s === "quad") return s;
  return s;
};

export async function fetchFeeCollectionReport(filters: ReportFilters): Promise<FeeCollectionReportResult> {
  const monthRange = applyMonthToRange(filters.month);

  const startIso = monthRange.start ?? toISODate(filters.startDate);
  const endIso = monthRange.end ?? toISODate(filters.endDate);

  const feeStatus = filters.feeStatus ?? "all";

  // Source of truth:
  // - payment aggregates => fee_payments (success only)
  // - fee status counts => fees.status

  // 1) Load fees (for counts + student-wise)
  let feesQ = supabase
    .from("fees")
    .select(
      "id, student_id, title, description, amount, remaining_amount, due_date, status, created_at, updated_at, profiles!fees_student_id_fkey(full_name,student_id)"
    );

  if (filters.studentQuery && filters.studentQuery.trim()) {
    const q = filters.studentQuery.trim();
    // We can't join arbitrary search into profiles reliably without mock; apply OR-ish by filtering student_id and full_name via ilike on profiles fields.
    // PostgREST: use supabase filter on relationship fields is supported as select + .ilike("profiles.full_name", ...)
    // However relationship filtering keys differ per schema; safest: pull fees for matching student ids via profiles lookup.
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, student_id, full_name")
      .or(`student_id.ilike.%${q}%,full_name.ilike.%${q}%`);
    const ids = (profs ?? []).map((p: any) => p.id as string);
    feesQ = feesQ.in("student_id", ids);
  }

  if (feeStatus !== "all") {
    feesQ = feesQ.eq("status", feeStatus as FeeStatus);
  }

  // date filters on fees created_at
  if (startIso) feesQ = feesQ.gte("created_at", startIso);
  if (endIso) feesQ = feesQ.lte("created_at", endIso);

  const { data: feesData, error: feesErr } = await feesQ.order("created_at", { ascending: false });
  if (feesErr) throw feesErr;

  const fees = (feesData ?? []) as any[];

  // 2) Load payments for fee ids (success only)
  const feeIds = fees.map((f) => f.id).filter(Boolean);

  let payments: any[] = [];
  if (feeIds.length) {
    let payQ = supabase
      .from("fee_payments")
      .select(
        "id, fee_id, student_id, created_at, paid_at, amount_paid, payment_status, payment_method, transaction_reference"
      )
      .in("fee_id", feeIds)
      .eq("payment_status", "success");

    if (startIso) payQ = payQ.gte("created_at", startIso);
    if (endIso) payQ = payQ.lte("created_at", endIso);

    const { data: payData, error: payErr } = await payQ.order("created_at", { ascending: false });
    if (payErr) throw payErr;
    payments = (payData ?? []) as any[];
  }

  // Build lookups
  const byFeeId = new Map<string, any[]>();
  const byStudent = new Map<string, { student_id: string; studentName: string }>();

  for (const f of fees) {
    const sid = String(f.student_id);
    const name = f.profiles?.full_name ?? f.profiles?.student_id ?? sid;
    byStudent.set(sid, { student_id: sid, studentName: name ?? sid });
    byFeeId.set(String(f.id), []);
  }
  for (const p of payments) {
    const fid = String(p.fee_id);
    const arr = byFeeId.get(fid);
    if (arr) arr.push(p);
  }

  // 3) Summary counts from fees.status
  const summaryBase: FeeCollectionSummary = {
    totalCollected: 0,
    pendingCount: 0,
    partiallyPaidCount: 0,
    paidCount: 0,
    overdueCount: 0,
    fullyPaidStudentCount: 0,
  };

  summaryBase.totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);

  for (const f of fees) {
    const st = f.status as FeeStatus;
    if (st === "pending") summaryBase.pendingCount++;
    if (st === "partially_paid") summaryBase.partiallyPaidCount++;
    if (st === "paid") summaryBase.paidCount++;
    if (st === "overdue") summaryBase.overdueCount++;
  }

  // fully paid student count: student that has at least one paid fee and no non-paid fees within filtered set
  const studentFees = new Map<string, any[]>();
  for (const f of fees) {
    const sid = String(f.student_id);
    const arr = studentFees.get(sid) ?? [];
    arr.push(f);
    studentFees.set(sid, arr);
  }

  let fullyPaid = 0;
  for (const [sid, sf] of studentFees.entries()) {
    const hasPaid = sf.some((x) => x.status === "paid");
    const hasNonPaid = sf.some((x) => x.status !== "paid");
    if (hasPaid && !hasNonPaid) fullyPaid++;
  }
  summaryBase.fullyPaidStudentCount = fullyPaid;

  // 4) Monthly revenue analytics (success payments)
  // If date range is specifically set, still show month breakdown for that window.
  // We'll bucket by YYYY-MM based on created_at.
  const monthlyMap = new Map<string, number>();
  for (const p of payments) {
    const d = p.created_at ? new Date(p.created_at) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + (Number(p.amount_paid) || 0));
  }

  // Create stable ordering
  const keys = Array.from(monthlyMap.keys()).sort();
  const monthlyRevenue: MonthlyAmountPoint[] = keys.map((key) => {
    const [y, m] = key.split("-");
    const monthDate = new Date(Number(y), Number(m) - 1, 1);
    return {
      key,
      month: monthDate.toLocaleString("en-IN", { month: "short" }),
      amount: monthlyMap.get(key) || 0,
    };
  });

  // 5) Student-wise payment history table
  const studentWise: StudentPaymentRow[] = fees.map((f) => {
    const sid = String(f.student_id);
    const name = byStudent.get(sid)?.studentName ?? f.profiles?.full_name ?? sid;
    const feeId = String(f.id);
    return {
      student_id: f.profiles?.student_id ?? "N/A",
      studentName: name ?? "N/A",
      feeTitle: f.title ?? "",
      feeDueDate: f.due_date ?? null,
      feeStatus: f.status as FeeStatus,
      totalAmount: Number(f.amount) || 0,
      remainingAmount: Number(f.remaining_amount) || 0,
      paymentHistory: (byFeeId.get(feeId) ?? []).map((p: any) => ({
        paid_at: p.paid_at ?? null,
        created_at: p.created_at ?? null,
        payment_method: p.payment_method ?? null,
        payment_status: p.payment_status ?? null,
        amount_paid: Number(p.amount_paid) || 0,
        transaction_reference: p.transaction_reference ?? null,
      })),
    };
  });

  return {
    summary: summaryBase,
    monthlyRevenue,
    studentWise: studentWise.sort((a, b) => a.studentName.localeCompare(b.studentName)),
  };
}

export async function fetchStudentReports(filters: ReportFilters): Promise<StudentReportResult> {
  const monthRange = applyMonthToRange(filters.month);
  const startIso = monthRange.start ?? toISODate(filters.startDate);
  const endIso = monthRange.end ?? toISODate(filters.endDate);

  // 1) Load student profiles with filters
  let profQ = supabase
    .from("profiles")
    .select(
      "id, student_id, full_name, course, year, room_number, room_type, block, floor"
    )
    .eq("role", "student");

  if (filters.course && filters.course !== "all") profQ = profQ.eq("course", filters.course);
  if (filters.year && filters.year !== "all") profQ = profQ.eq("year", filters.year);

  if (filters.roomType && filters.roomType !== "all") {
    profQ = profQ.eq("room_type", filters.roomType);
  }

  if (filters.studentQuery && filters.studentQuery.trim()) {
    const q = filters.studentQuery.trim();
    // use ilike on full_name/student_id
    profQ = profQ.or(`student_id.ilike.%${q}%,full_name.ilike.%${q}%`);
  }

  // Date range for profiles use created_at if present
  if (startIso) profQ = profQ.gte("created_at", startIso);
  if (endIso) profQ = profQ.lte("created_at", endIso);

  const { data: profData, error: profErr } = await profQ.order("created_at", { ascending: false });
  if (profErr) throw profErr;

  const students = (profData ?? []) as any[];

  const studentIds = students.map((s) => s.id as string);

  // 2) Fee status per student (best-effort: take latest fee by created_at)
  let feesQ = supabase
    .from("fees")
    .select("id, student_id, status, created_at")
    .in("student_id", studentIds);

  if (filters.feeStatus && filters.feeStatus !== "all") {
    feesQ = feesQ.eq("status", filters.feeStatus as FeeStatus);
  }

  if (startIso) feesQ = feesQ.gte("created_at", startIso);
  if (endIso) feesQ = feesQ.lte("created_at", endIso);

  const { data: feesData, error: feesErr } = await feesQ.order("created_at", { ascending: false });
  if (feesErr) throw feesErr;

  const latestFeeByStudent = new Map<string, { status: FeeStatus | string }>();
  for (const f of feesData ?? []) {
    const sid = String(f.student_id);
    if (!latestFeeByStudent.has(sid)) latestFeeByStudent.set(sid, { status: f.status });
  }

  // 3) Complaint counts per student
  let compQ = supabase
    .from("complaints")
    .select("id, user_id, status")
    .in("user_id", studentIds);

  if (filters.complaintStatus && filters.complaintStatus !== "all") {
    compQ = compQ.eq("status", filters.complaintStatus as ComplaintStatus);
  }

  if (startIso) compQ = compQ.gte("created_at", startIso);
  if (endIso) compQ = compQ.lte("created_at", endIso);

  const { data: compData, error: compErr } = await compQ;
  if (compErr) throw compErr;

  const complaintCountByStudent = new Map<string, number>();
  for (const c of compData ?? []) {
    const sid = String(c.user_id);
    complaintCountByStudent.set(sid, (complaintCountByStudent.get(sid) || 0) + 1);
  }

  // 4) Roommate info: same room_number/block/floor and room_type
  // We'll fetch all students in rooms and then group.
  let roommatesQ = supabase
    .from("profiles")
    .select("id, student_id, full_name, room_number, room_type, block, floor")
    .eq("role", "student")
    .not("room_number", "is", null);

  if (filters.roomType && filters.roomType !== "all") roommatesQ = roommatesQ.eq("room_type", filters.roomType);
  if (startIso) roommatesQ = roommatesQ.gte("created_at", startIso);
  if (endIso) roommatesQ = roommatesQ.lte("created_at", endIso);

  const { data: allRoomStudents, error: allRoomStudentsErr } = await roommatesQ;
  if (allRoomStudentsErr) throw allRoomStudentsErr;

  const keyFor = (s: any) =>
    `${String(s.room_type || "").toLowerCase()}|${String(s.block || "")}|${String(s.floor || "")}|${String(s.room_number || "")}`;

  const roomGroup = new Map<string, any[]>();
  for (const s of allRoomStudents ?? []) {
    const key = keyFor(s);
    const arr = roomGroup.get(key) ?? [];
    arr.push(s);
    roomGroup.set(key, arr);
  }

  const rows: StudentReportRow[] = students.map((s) => {
    const sid = String(s.id);
    const roomKey = keyFor(s);
    const roommates = (roomGroup.get(roomKey) ?? []).filter((x) => String(x.id) !== sid);

    const feeStatusVal = latestFeeByStudent.get(sid)?.status as any;
    return {
      student_id: s.student_id ?? "N/A",
      studentName: s.full_name ?? "N/A",
      course: s.course ?? null,
      year: s.year ?? null,
      room_number: s.room_number ?? null,
      room_type: (normalizeRoomType(s.room_type) as any) ?? null,
      block: s.block ?? null,
      floor: s.floor ?? null,
      roommateInfo: roommates.map((r: any) => ({
        student_id: r.student_id ?? "N/A",
        studentName: r.full_name ?? "N/A",
        full_name: r.full_name ?? null,
      })),
      feeStatus: (feeStatusVal as FeeStatus) ?? "unknown",
      complaintCount: complaintCountByStudent.get(sid) || 0,
    };
  });

  // Sorting for consistent UX
  rows.sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));

  return { rows };
}

export async function fetchRoomOccupancyReport(filters: ReportFilters): Promise<RoomOccupancyReportResult> {
  // Occupancy based on student room_number assignment and room_type
  // empty rooms are not directly stored; we treat occupancy % relative to allocated room capacity based on room_type.

  // Load students with room assignments
  let studentsQ = supabase
    .from("profiles")
    .select("room_number, room_type, block, floor, id")
    .eq("role", "student")
    .not("room_number", "is", null);

  if (filters.roomType && filters.roomType !== "all") studentsQ = studentsQ.eq("room_type", filters.roomType);

  const { data: studentsData, error: studentsErr } = await studentsQ;
  if (studentsErr) throw studentsErr;

  const assigned = (studentsData ?? []) as any[];

  // distribution by room_type for occupied room seats (students)
  const roomTypeDistributionMap = new Map<string, number>();
  let occupiedRooms = 0;

  // We define "occupied rooms" as number of rooms that have at least one student.
  const roomKey = (s: any) => `${String(s.room_type || "").toLowerCase()}|${s.block || ""}|${s.floor || ""}|${s.room_number || ""}`;
  const roomKeys = new Set<string>();

  for (const s of assigned) {
    const rt = normalizeRoomType(s.room_type) ?? "";
    roomTypeDistributionMap.set(rt, (roomTypeDistributionMap.get(rt) || 0) + 1);
    roomKeys.add(roomKey(s));
  }

  occupiedRooms = roomKeys.size;

  // total capacity estimate: sum per room based on room_type capacity (1/2/3/4)
  // We derive seats per room by taking first student record's room_type per room_key.
  const roomCapacityByKey = new Map<string, number>();
  for (const rk of roomKeys) {
    const [rt] = rk.split("|");
    const cap =
      rt === "single" ? 1 : rt === "double" ? 2 : rt === "triple" ? 3 : rt === "quad" ? 4 : 0;
    roomCapacityByKey.set(rk, cap);
  }

  const totalCapacitySeats = Array.from(roomCapacityByKey.values()).reduce((a, b) => a + b, 0);
  const occupiedSeats = assigned.length;

  const emptyRooms = Math.max(0, occupiedRooms); // cannot derive absolute empties; we will compute empty seats instead.
  const emptySeats = Math.max(0, totalCapacitySeats - occupiedSeats);

  const occupancyPercentage = totalCapacitySeats > 0 ? Math.round((occupiedSeats / totalCapacitySeats) * 100) : 0;

  const roomTypeDistribution = Array.from(roomTypeDistributionMap.entries())
    .map(([room_type, count]) => ({ room_type: room_type as any, count }))
    .sort((a, b) => (a.room_type || "").localeCompare(b.room_type || ""));

  return {
    occupiedRooms,
    emptyRooms,
    occupancyPercentage,
    roomTypeDistribution,
  };
}

export async function fetchComplaintReport(filters: ReportFilters): Promise<ComplaintReportResult> {
  const monthRange = applyMonthToRange(filters.month);
  const startIso = monthRange.start ?? toISODate(filters.startDate);
  const endIso = monthRange.end ?? toISODate(filters.endDate);

  let compBase = supabase.from("complaints").select("id, status, issue_type, created_at");

  if (filters.complaintStatus && filters.complaintStatus !== "all") {
    compBase = compBase.eq("status", filters.complaintStatus as ComplaintStatus);
  }

  if (startIso) compBase = compBase.gte("created_at", startIso);
  if (endIso) compBase = compBase.lte("created_at", endIso);

  const { data, error } = await compBase;
  if (error) throw error;

  const rows = (data ?? []) as any[];

  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const resolvedCount = rows.filter((r) => r.status === "resolved").length;

  const catMap = new Map<string, number>();
  for (const r of rows) {
    const key = String(r.issue_type || "Uncategorized");
    catMap.set(key, (catMap.get(key) || 0) + 1);
  }

  const categories = Array.from(catMap.entries())
    .map(([issue_type, count]) => ({ issue_type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // trend by month for all rows in window
  const trendMap = new Map<string, number>();
  for (const r of rows) {
    const d = r.created_at ? new Date(r.created_at) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    trendMap.set(key, (trendMap.get(key) || 0) + 1);
  }

  const keys = Array.from(trendMap.keys()).sort();
  const trend: ComplaintTrendPoint[] = keys.map((key) => {
    const [y, m] = key.split("-");
    const monthDate = new Date(Number(y), Number(m) - 1, 1);
    return {
      key,
      monthLabel: monthDate.toLocaleString("en-IN", { month: "short" }),
      count: trendMap.get(key) || 0,
    };
  });

  return { pendingCount, resolvedCount, categories, trend };
}

