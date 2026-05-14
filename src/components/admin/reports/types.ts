export type FeeStatus = "pending" | "partially_paid" | "paid" | "overdue";

export type ComplaintStatus = "pending" | "in-progress" | "resolved" | "rejected";

export type ReportType =
  | "fee_collection"
  | "student"
  | "room_occupancy"
  | "complaints";

export type RoomType = "single" | "double" | "triple" | "quad";

export type ReportFilters = {
  reportType: ReportType;

  // date filters (inclusive)
  startDate?: string; // yyyy-mm-dd
  endDate?: string; // yyyy-mm-dd

  // quick month filter (YYYY-MM)
  month?: string; // e.g. 2026-05

  feeStatus?: FeeStatus | "all";
  complaintStatus?: ComplaintStatus | "all";

  roomType?: RoomType | "all";

  course?: string | "all";
  year?: string | "all";

  studentQuery?: string; // name/id search
};

export type MonthlyAmountPoint = {
  month: string; // label
  key: string; // YYYY-MM
  amount: number;
};

