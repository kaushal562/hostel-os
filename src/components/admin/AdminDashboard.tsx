import React, { useMemo, useState, useEffect, useCallback } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  DoorOpen,
  MessageSquareWarning,
  DollarSign,
  Megaphone,
  FileText,
} from "lucide-react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import StudentDetailsDialog from "./StudentDetailsDialog";
import EditStudentDialog from "./EditStudentDialog";
import AdminNotifications from "./AdminNotifications";
import ComplaintReviewDialog from "./ComplaintReviewDialog";
import RoomRequestDetailsDialog from "./RoomRequestDetailsDialog";
import AdminFees from "./AdminFees";
import { AdminWorkspaceShell, type AdminNavId } from "./premium/AdminWorkspaceShell";
import { AdminTopBar } from "./premium/AdminTopBar";
import { AdminCommandPalette } from "./premium/AdminCommandPalette";
import { AdminMetricStrip } from "./premium/AdminMetricStrip";
import { AdminActionZone } from "./premium/AdminActionZone";
import { AdminOperationsCard, AdminTableClasses } from "./premium/AdminOperationsCard";
import { AdminPageHero } from "./premium/AdminPageHero";
import { adminVisual } from "./premium/admin-visual-system";
import { AdminActivityFeed } from "./premium/AdminActivityFeed";




interface AdminDashboardProps {
  totalStudents?: number;
  occupiedRooms?: number;
  totalRooms?: number;
  pendingComplaints?: number;
  resolvedComplaints?: number;
  totalFeeCollection?: number;
  feeCollectionTarget?: number;
  recentNotifications?: Array<{
    id: string;
    title: string;
    date: string;
    type: "info" | "warning" | "urgent";
  }>;
  recentComplaints?: Array<{
    id: string;
    title: string;
    date: string;
    status: "pending" | "in-progress" | "resolved" | "rejected";
  }>;
  roomAllocationData?: {
    single: number;
    double: number;
    triple: number;
    quad: number;
  };
  monthlyFeeCollection?: Array<{
    month: string;
    amount: number;
  }>;
}

interface RoomRequest {
  id: string;
  studentName: string;
  student_id?: string;
  currentRoom: string;
  requestedType: string;
  preferred_floor?: string;
  reason?: string;
  roommate_preference?: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  user_id?: string;
  admin_remarks?: string | null;
}

interface Complaint {
  id: string;
  title: string;
  date: string;
  status: "pending" | "in-progress" | "resolved" | "rejected";
  description?: string;
}

interface StudentProfile {
  id: string;
  full_name: string | null;
  student_id: string | null;
  course: string | null;
  year: string | null;
  room_number: string | null;
  room_type: string | null;
  block: string | null;
  floor: string | null;
  contact_number: string | null;
  emergency_contact: string | null;
  profile_picture: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [adminName, setAdminName] = useState<string>("Admin");
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [showStudentDetailsDialog, setShowStudentDetailsDialog] =
    useState(false);
  const [showEditStudentDialog, setShowEditStudentDialog] = useState(false);
  const [showComplaintReviewDialog, setShowComplaintReviewDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [selectedRoomRequest, setSelectedRoomRequest] = useState<any>(null);
  const [showRoomRequestDialog, setShowRoomRequestDialog] = useState(false);
  const [isLoadingRoomRequests, setIsLoadingRoomRequests] = useState(false);
  const [roomRequestsError, setRoomRequestsError] = useState<string | null>(null);

  const [roomRequestsDebugOnce, setRoomRequestsDebugOnce] = useState(false);

  const [overviewLoading, setOverviewLoading] = useState(true);
  
  // Workspace shell state
  const [activeNav, setActiveNav] = useState<AdminNavId>("overview");

  useEffect(() => {
    const nav = (location.state as { adminNav?: AdminNavId } | null)?.adminNav;
    if (nav) setActiveNav(nav);
  }, [location.key, location.state]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    totalStudents: 0,
    occupiedRooms: 0,
    totalRooms: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalFeeCollection: 0,
    feeCollectionTarget: 0,
    recentNotifications: [] as any[],
    recentComplaints: [] as any[],
    complaintsInProgress: 0,
    complaintsRejected: 0,
    roomAllocationData: {
      single: 0,
      double: 0,
      triple: 0,
      quad: 0,
    },
    monthlyFeeCollection: [] as Array<{ month: string; amount: number }>,
    recentRoomChangeRequests: [],
    roomOccupancy: {
      single: 0,
      double: 0,
      triple: 0,
      quad: 0,
    },
  });

  const occupancyRate = useMemo(() => {
    if (!realTimeData.totalRooms) return 0;
    return Math.round((realTimeData.occupiedRooms / realTimeData.totalRooms) * 100);
  }, [realTimeData.occupiedRooms, realTimeData.totalRooms]);

  const feeCollectionRate = useMemo(() => {
    if (!realTimeData.monthlyFeeCollection.length) return 0;
    const maxAmount = Math.max(...realTimeData.monthlyFeeCollection.map((i) => i.amount), 0);
    if (maxAmount <= 0) return 0;
    return Math.round(((realTimeData.totalFeeCollection || 0) / maxAmount) * 100);
  }, [realTimeData.monthlyFeeCollection, realTimeData.totalFeeCollection]);

  const fetchAdminProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (!error && data?.full_name) {
        setAdminName(data.full_name);
      }
    } catch (e) {
      console.error("Error fetching admin profile:", e);
    }
  };

  const fetchStudentProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

      if (error) {
        console.error("[AdminDashboard] Error fetching profiles:", error);
        throw error;
      }

      const validStudents = (data || []).filter(
        (u: any) => u.full_name && u.full_name.trim().length > 0,
      ) as StudentProfile[];

      setStudentProfiles(validStudents);
    } catch (error) {
      console.error("[AdminDashboard] Error in fetchStudentProfiles:", error);
    }
  };

  const handleViewStudentDetails = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowStudentDetailsDialog(true);
  };

  const handleEditStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowEditStudentDialog(true);
  };

  const handleReviewComplaint = (complaint: any) => {
    setSelectedComplaint(complaint);
    setShowComplaintReviewDialog(true);
  };

  useEffect(() => {
    // Component-level admin validation (defense-in-depth)
    const runAdminCheck = async () => {
      try {
        const {

          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          navigate("/");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("[AdminDashboard] admin role check error:", error);
          navigate("/");
          return;
        }

        if (data?.role !== "admin") {
          navigate("/");
        }
      } catch (e) {
        console.error("[AdminDashboard] admin role check exception:", e);
        navigate("/");
      }
    };

    runAdminCheck();

    // Subscribe to real-time updates for notifications
    const notificationsSubscription = supabase
      .channel("notifications-admin-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          console.log("Notification change received:", payload);
          fetchNotifications();
        },
      )
      .subscribe();

    // Subscribe to real-time updates for complaints
    const complaintsSubscription = supabase
      .channel("complaints-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        (payload) => {
          console.log("Complaints change received:", payload);
          // Overview aggregates must use full-table counts
          fetchComplaints();
          fetchOverviewAggregates();
        },
      )
      .subscribe();


    // Subscribe to real-time updates for student profiles
    const profilesSubscription = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          console.log("Profile change received:", payload);
          // Update student profiles data + overview aggregates
          fetchStudentProfiles();
          fetchOverviewAggregates();
        },
      )
      .subscribe();


    // Subscribe to real-time updates for fee payments
    const paymentsSubscription = supabase
      .channel("fee-payments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fee_payments",
        },
        (payload) => {
          console.log("Payments change received:", payload);
          fetchPayments();
          fetchOverviewAggregates();
        },
      )
      .subscribe();


    // Subscribe to real-time updates for room change requests
    const roomChangeSubscription = supabase
      .channel("room-change-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_change_requests",
        },
        (payload) => {
          console.log("[AdminDashboard][RT] room_change_requests payload:", payload);
          fetchRoomChangeRequests();
          fetchStudentProfiles();
        },
      )
      .subscribe();

    // Initial data fetch
    fetchAdminProfile();
    fetchNotifications();
    fetchRoomChangeRequests();
    fetchStudentProfiles();

    // Overview aggregates + complaint queue (list only; counts stay aggregate)
    fetchOverviewAggregates();
    void fetchComplaints();

    return () => {
      // Clean up subscriptions
      supabase.removeChannel(complaintsSubscription);
      supabase.removeChannel(notificationsSubscription);
      supabase.removeChannel(paymentsSubscription);
      supabase.removeChannel(roomChangeSubscription);
      supabase.removeChannel(profilesSubscription);
    };
  }, []);

  // Debug: Log final complaint state IDs
  useEffect(() => {
    console.log("[AdminDashboard] Final complaint state IDs:", realTimeData.recentComplaints.map(c => c.id));
  }, [realTimeData.recentComplaints]);

  // ===== Admin analytics aggregates (Supabase-backed) =====
  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);

  const roomCapacityForType = (t: string) => {
    switch (String(t || "").toLowerCase()) {
      case "single":
        return 1;
      case "double":
        return 2;
      case "triple":
        return 3;
      case "quad":
        return 4;
      default:
        return 0;
    }
  };

  const fetchOverviewAggregates = useCallback(async () => {
    try {
      setOverviewLoading(true);

      // 1) Total students
      const { count: studentCount, error: studentCountErr } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student");

      if (studentCountErr) throw studentCountErr;

      // 2) Room allocation distribution + occupancy by room_type
      // allocatedStudentsPerType = count profiles by room_type where room_number is assigned
      const { data: studentsWithRooms, error: roomsErr } = await supabase
        .from("profiles")
        .select("room_type, room_number")
        .eq("role", "student")
        .not("room_number", "is", null);

      if (roomsErr) throw roomsErr;

      const allocatedByType = {
        single: 0,
        double: 0,
        triple: 0,
        quad: 0,
      };

      (studentsWithRooms || []).forEach((s: any) => {
        const rt = String(s.room_type || "").toLowerCase();
        const rn = s.room_number;
        const hasRoom = rn !== null && rn !== undefined && String(rn).trim().length > 0;
        if (!hasRoom) return;
        if (rt in allocatedByType) allocatedByType[rt as keyof typeof allocatedByType]++;
      });

      const totalCapacity =
        allocatedByType.single * 1 +
        allocatedByType.double * 2 +
        allocatedByType.triple * 3 +
        allocatedByType.quad * 4;
      const allocatedStudents =
        allocatedByType.single +
        allocatedByType.double +
        allocatedByType.triple +
        allocatedByType.quad;

      const occupancyByType = {
        single: allocatedByType.single,
        double: allocatedByType.double,
        triple: allocatedByType.triple,
        quad: allocatedByType.quad,
      };

      // roomAllocationData is distribution counts from room_type
      const roomAllocationData = { ...allocatedByType };

      // 3) Complaints totals (FULL table counts)
      const { count: pendingCount, error: pendingErr } = await supabase
        .from("complaints")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      if (pendingErr) throw pendingErr;

      const { count: resolvedCount, error: resolvedErr } = await supabase
        .from("complaints")
        .select("id", { count: "exact", head: true })
        .eq("status", "resolved");

      if (resolvedErr) throw resolvedErr;

      const { count: inProgressCount, error: inProgressErr } = await supabase
        .from("complaints")
        .select("id", { count: "exact", head: true })
        .eq("status", "in-progress");

      if (inProgressErr) throw inProgressErr;

      const { count: rejectedCount, error: rejectedErr } = await supabase
        .from("complaints")
        .select("id", { count: "exact", head: true })
        .eq("status", "rejected");

      if (rejectedErr) throw rejectedErr;
      // 4) Fee totals (success only)
      const { data: paymentsForTotal, error: paymentsTotalErr } = await supabase
        .from("fee_payments")
        .select("amount_paid, payment_status")
        .eq("payment_status", "success");

      if (paymentsTotalErr) throw paymentsTotalErr;

      const totalFeeCollection = (paymentsForTotal || []).reduce(
        (sum: number, p: any) => sum + (p.amount_paid || 0),
        0,
      );

      setRealTimeData((prev) => ({
        ...prev,
        totalStudents: studentCount ?? 0,
        occupiedRooms: allocatedStudents,
        totalRooms: totalCapacity,
        pendingComplaints: pendingCount ?? 0,
        resolvedComplaints: resolvedCount ?? 0,
        complaintsInProgress: inProgressCount ?? 0,
        complaintsRejected: rejectedCount ?? 0,
        totalFeeCollection,
        feeCollectionTarget: 0,
        roomAllocationData,
        roomOccupancy: occupancyByType,
      }));

      // 5) Monthly fee aggregation (last 6 months)
      const now = new Date();
      const start = new Date(now);
      start.setMonth(start.getMonth() - 5);
      start.setHours(0, 0, 0, 0);

      const { data: monthlyRows, error: monthlyErr } = await supabase
        .from("fee_payments")
        .select("created_at, amount_paid")
        .eq("payment_status", "success")
        .gte("created_at", start.toISOString());

      if (monthlyErr) throw monthlyErr;

      // group by YYYY-MM
      const byMonth = new Map<string, number>();
      (monthlyRows || []).forEach((r: any) => {
        const d = r.created_at ? new Date(r.created_at) : null;
        if (!d || Number.isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        byMonth.set(key, (byMonth.get(key) || 0) + (r.amount_paid || 0));
      });

      // produce last 6 months labels
      const labels: string[] = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (5 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        labels.push(key);
      }

      const monthlyFeeCollection = labels.map((key) => {
        const [y, m] = key.split("-");
        const monthDate = new Date(Number(y), Number(m) - 1, 1);
        const label = monthDate.toLocaleString("en-IN", { month: "short" });
        return {
          month: label,
          amount: byMonth.get(key) || 0,
        };
      });

      setRealTimeData((prev) => ({
        ...prev,
        monthlyFeeCollection,
      }));
    } catch (e) {
      console.error("[AdminDashboard] fetchOverviewAggregates error:", e);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  // Fetch functions to get data from Supabase
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setRealTimeData((prev) => ({
          ...prev,
          recentNotifications: data.map((n) => ({
            id: n.id,
            title: n.title,
            date: n.created_at,
            type: n.type,
          })),
        }));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchComplaints = async () => {
    try {
      // Keep this function for the Recent Complaints list only.
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);


      if (error) throw error;

      if (data && data.length > 0) {
        setRealTimeData((prev) => ({
          ...prev,
          recentComplaints: data.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            location: c.location,
            user_id: c.user_id,
            date: c.created_at,
            status: c.status,
          })),
        }));
      } else {
        setRealTimeData((prev) => ({
          ...prev,
          recentComplaints: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };


const fetchPayments = async () => {
    try {
      // Aggregate source of truth: fee_payments (success only)
      const { data, error } = await supabase
        .from("fee_payments")
        .select("amount_paid, payment_status, created_at")
        .order("created_at", { ascending: false });


      if (error) throw error;

      if (data && data.length > 0) {
        const total = (data as any[])
          .filter((p) => p.payment_status === "success")
          .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

        setRealTimeData((prev) => ({
          ...prev,
          totalFeeCollection: total,
          // You would need more complex logic to group by month for real data
        }));
      } else {
        // No mock data.
        setRealTimeData((prev) => ({
          ...prev,
          totalFeeCollection: 0,
          monthlyFeeCollection: [],
        }));
      }

    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchRoomChangeRequests = async () => {
    try {
      setIsLoadingRoomRequests(true);
      setRoomRequestsError(null);

      console.log("[AdminDashboard] Starting fetchRoomChangeRequests...");

      // Step 1: Fetch room change requests
      const { data: requests, error: requestsError } = await supabase
        .from("room_change_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);


      if (requestsError) {
        console.error("[AdminDashboard] Error fetching room_change_requests:", requestsError);
        throw new Error(`Failed to fetch requests: ${requestsError.message}`);
      }

      // Debug logs (avoid infinite spam)
      console.log("[AdminDashboard][Debug] fetched room_change_requests IDs+timestamps:",
        (requests || []).map((r: any) => ({ id: r.id, created_at: r.created_at }))
      );
      console.log("[AdminDashboard][Debug] fetched room_change_requests raw:", requests);

      if (Array.isArray(requests) && requests.length > 0) {
        const newest = requests[0];
        console.log("[AdminDashboard][Debug] newest request in fetch:", {
          id: newest?.id,
          created_at: newest?.created_at,
          status: newest?.status,
          user_id: newest?.user_id,
        });
      }

      if (!requests || requests.length === 0) {

        console.log("[AdminDashboard] No room change requests found");
        setRealTimeData((prev) => ({
          ...prev,
          recentRoomChangeRequests: [],
        }));
        setIsLoadingRoomRequests(false);
        return;
      }

      // Step 2: Extract unique user IDs
      const userIds = [...new Set(requests.map((r: any) => r.user_id))];
      console.log("[AdminDashboard] Extracted user IDs:", userIds);

      // Step 3: Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, student_id, room_number, room_type")
        .in("id", userIds);

      if (profilesError) {
        console.error("[AdminDashboard] Error fetching profiles:", profilesError);
        // Continue anyway - we have requests data, just without profile details
      }

      // Debug logs
      console.log("[AdminDashboard][Debug] fetched profiles:", profiles);
      console.log("[AdminDashboard][Debug] profiles IDs:", (profiles || []).map((p: any) => p.id));



      // Step 4: Create a lookup map for profiles
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach((profile: any) => {
          profileMap.set(profile.id, profile);
        });
      }

      // Step 5: Merge request data with profile data
      const formattedRequests = requests.map((request: any) => {
        const profile = profileMap.get(request.user_id);
        return {
          id: request.id,
          studentName: profile?.full_name || "", 
          student_id: profile?.student_id ?? undefined,
          currentRoom: profile?.room_number ?? undefined,


          requestedType: request.preferred_room_type,
          preferred_floor: request.preferred_floor,
          reason: request.reason,
          roommate_preference: request.roommate_preference,
          date: request.created_at,
          status: request.status,
          admin_remarks: request.admin_remarks,
          user_id: request.user_id,
        };
      });

      console.log("[AdminDashboard][Debug] merged final room requests:", formattedRequests);
      if (formattedRequests?.length) {
        console.log("[AdminDashboard][Debug] merged top 3:", formattedRequests.slice(0,3));
      }


      setRealTimeData((prev) => ({
        ...prev,
        recentRoomChangeRequests: formattedRequests,
      }));

    } catch (error: any) {
      console.error("[AdminDashboard][Debug] Supabase query error in fetchRoomChangeRequests:", error);
      const errorMsg = error?.message || "Failed to fetch room requests";
      // show graceful error once (no infinite spam)
      setRoomRequestsError(errorMsg);
    } finally {
      setIsLoadingRoomRequests(false);
    }
  };

  const ROOM_CAPACITY_BY_TYPE: Record<string, number> = {
    single: 1,
    double: 2,
    triple: 3,
    quad: 4,
  };

  const handleApproveRoomRequest = async (
    requestId: string,
    remarks: string,
    allocation: { room_number: string; floor: string; block: string },
  ) => {
    try {
      console.log("[AdminDashboard] Approving request:", requestId);
      
      // 1. Get the request details to know the user and preferred type
      const request = realTimeData.recentRoomChangeRequests.find(r => r.id === requestId);
      if (!request) {
        console.error("[AdminDashboard] Request not found:", requestId);
        toast({
          title: "Error",
          description: "Request not found",
          variant: "destructive",
        });
        return;
      }

      console.log("[AdminDashboard] Found request:", request);

      const room_number = allocation.room_number?.trim();
      const floor = allocation.floor?.trim();
      const block = allocation.block?.trim();

      if (!room_number || !floor || !block) {
        toast({
          title: "Missing allocation",
          description: "Please select block/floor and enter a room number before approving.",
          variant: "destructive",
        });
        return;
      }

      const requestedType = String(request.requestedType || "").toLowerCase();
      const maxCapacity = ROOM_CAPACITY_BY_TYPE[requestedType];
      if (!maxCapacity) {
        toast({
          title: "Invalid room type",
          description: `Unsupported room type: ${request.requestedType}`,
          variant: "destructive",
        });
        return;
      }

      // 2. Occupancy validation (prevent over-allocation)
      // Count existing students already assigned to this exact room (room_number + block + floor)
      const { count: existingCount, error: countError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("room_number", room_number)
        .eq("block", block)
        .eq("floor", floor)
        .neq("id", request.user_id);

      if (countError) {
        console.error("[AdminDashboard] Error checking room occupancy:", countError);
        toast({
          title: "Error",
          description: "Could not validate room occupancy. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const occupancy = existingCount ?? 0;
      if (occupancy >= maxCapacity) {
        toast({
          title: "Room is full",
          description: `This ${requestedType} room already has ${occupancy}/${maxCapacity} students assigned.`,
          variant: "destructive",
        });
        return;
      }

      // 2. Update the request status and save admin remarks
      const { error: requestError } = await supabase
        .from("room_change_requests")
        .update({ 
          status: "approved", 
          admin_remarks: remarks || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (requestError) {
        console.error("[AdminDashboard] Error updating request status:", requestError);
        throw requestError;
      }

      console.log("[AdminDashboard] Updated request status to approved");

      // 3. Update the student's profile with full allocation
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          room_type: requestedType,
          room_number,
          floor,
          block,
          updated_at: new Date().toISOString()
        })
        .eq("id", request.user_id);

      if (profileError) {
        console.error("[AdminDashboard] Error updating profile:", profileError);
        throw profileError;
      }

      console.log("[AdminDashboard] Updated profile allocation:", {
        user_id: request.user_id,
        room_type: requestedType,
        room_number,
        floor,
        block,
      });

      // 4. Create a notification for the student
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: request.user_id,
          title: "Room Change Request Approved",
          message: `Your request for a ${requestedType} room has been approved. You have been allocated Block ${block}, ${floor} floor, Room ${room_number}.`,
          type: "info"
        });

      if (notifError) {
        console.warn("[AdminDashboard] Warning: Could not create notification:", notifError);
        // Don't throw - notification failure shouldn't block the approval
      } else {
        console.log("[AdminDashboard] Created notification for user:", request.user_id);
      }

      toast({
        title: "Request Approved",
        description: `Room change request for ${request.studentName} has been approved.`,
      });

      // 5. Refresh the data
      console.log("[AdminDashboard] Refreshing data after approval...");
      await fetchRoomChangeRequests();
      await fetchStudentProfiles();
    } catch (error: any) {
      console.error("[AdminDashboard] Error approving room request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRoomRequest = async (requestId: string, remarks: string) => {
    try {
      console.log("[AdminDashboard] Rejecting request:", requestId);

      // 1. Get the request to know the user and preferred type
      const request = realTimeData.recentRoomChangeRequests.find(r => r.id === requestId);
      if (!request) {
        console.error("[AdminDashboard] Request not found for rejection:", requestId);
        toast({
          title: "Error",
          description: "Request not found",
          variant: "destructive",
        });
        return;
      }

      console.log("[AdminDashboard] Found request for rejection:", request);

      // 2. Update the request status and save admin remarks
      const { error: requestError } = await supabase
        .from("room_change_requests")
        .update({ 
          status: "rejected", 
          admin_remarks: remarks || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (requestError) {
        console.error("[AdminDashboard] Error updating request status:", requestError);
        throw requestError;
      }

      console.log("[AdminDashboard] Updated request status to rejected");

      // 3. Create a notification for the student
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: request.user_id,
          title: "Room Change Request Rejected",
          message: `Your request for a ${request.requestedType} room has been rejected. Reason: ${remarks || 'Capacity limitations or other constraints.'}`,
          type: "warning"
        });

      if (notifError) {
        console.warn("[AdminDashboard] Warning: Could not create notification:", notifError);
        // Don't throw - notification failure shouldn't block the rejection
      } else {
        console.log("[AdminDashboard] Created rejection notification for user:", request.user_id);
      }

      toast({
        title: "Request Rejected",
        description: "The room change request has been rejected and the student has been notified.",
      });

      // 4. Refresh the data
      console.log("[AdminDashboard] Refreshing data after rejection...");
      await fetchRoomChangeRequests();
    } catch (error: any) {
      console.error("[AdminDashboard] Error rejecting room request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleViewRoomRequest = (request: RoomRequest) => {
    setSelectedRoomRequest(request);
    setShowRoomRequestDialog(true);
  };

  const handleLogout = async () => {
    try {
      // Admin authorization must come ONLY from Supabase session.
      // Do not rely on localStorage flags.
      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleAdminPaletteNavigate = useCallback(
    (id: AdminNavId) => {
      if (id === "student-preview") {
        navigate("/admin/select-student-dashboard");
        return;
      }
      setActiveNav(id);
    },
    [navigate],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "in-progress":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-white/[0.05] text-slate-300 border border-white/[0.08]";
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    }
  };

  const activityEvents = useMemo(() => {
    const events = [
      ...realTimeData.recentNotifications.map((notification) => {
        const status =
          notification.type === "urgent"
            ? "error"
            : notification.type === "warning"
              ? "warning"
              : "info";

        return {
          id: `notice-${notification.id}`,
          type: "notice" as const,
          status,
          title: notification.title,
          description: "Notification published",
          timestamp: notification.date,
        };
      }),
      ...realTimeData.recentComplaints.map((complaint) => {
        const status =
          complaint.status === "resolved"
            ? "success"
            : complaint.status === "pending"
              ? "warning"
              : "info";

        return {
          id: `complaint-${complaint.id}`,
          type: "complaint" as const,
          status,
          title: complaint.title,
          description: complaint.description || "Complaint submitted",
          timestamp: complaint.date,
        };
      }),
      ...realTimeData.recentRoomChangeRequests.map((request) => {
        const status =
          request.status === "approved"
            ? "success"
            : request.status === "rejected"
              ? "error"
              : "pending";

        return {
          id: `room-${request.id}`,
          type: "room" as const,
          status,
          title: `${request.studentName} requested ${request.requestedType} room`,
          description: request.reason || "Room change request submitted",
          timestamp: request.date,
        };
      }),
    ];

    return events
      .filter((event) => event.timestamp)
      .sort(
        (a, b) =>
          new Date(b.timestamp as any).getTime() -
          new Date(a.timestamp as any).getTime(),
      )
      .slice(0, 14) as any;
  }, [
    realTimeData.recentNotifications,
    realTimeData.recentComplaints,
    realTimeData.recentRoomChangeRequests,
  ]);

  const latestStudents = useMemo(
    () =>
      [...studentProfiles]
        .sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        )
        .slice(0, 6),
    [studentProfiles],
  );

  const pendingRoomRequests = useMemo(
    () =>
      realTimeData.recentRoomChangeRequests.filter(
        (request) => request.status === "pending",
      ),
    [realTimeData.recentRoomChangeRequests],
  );

  const complaintDeskSnapshot = useMemo(() => {
    const pipeline = {
      pending: realTimeData.pendingComplaints,
      resolved: realTimeData.resolvedComplaints,
      inProgress: realTimeData.complaintsInProgress,
      rejected: realTimeData.complaintsRejected,
    };
    const total =
      pipeline.pending + pipeline.resolved + pipeline.inProgress + pipeline.rejected;
    const resolutionRate = total > 0 ? Math.round((pipeline.resolved / total) * 100) : 0;
    const c1 = total ? (pipeline.pending / total) * 100 : 0;
    const c2 = c1 + (total ? (pipeline.resolved / total) * 100 : 0);
    const c3 = c2 + (total ? (pipeline.inProgress / total) * 100 : 0);
    const donutBg =
      total === 0
        ? "conic-gradient(rgb(51 65 85 / 0.45) 0% 100%)"
        : `conic-gradient(
            rgb(251 191 36) 0% ${c1}%,
            rgb(52 211 153) ${c1}% ${c2}%,
            rgb(56 189 248) ${c2}% ${c3}%,
            rgb(251 113 133) ${c3}% 100%
          )`;
    const maxStage = Math.max(pipeline.pending, pipeline.resolved, pipeline.inProgress, pipeline.rejected, 1);
    return { pipeline, total, resolutionRate, donutBg, maxStage };
  }, [
    realTimeData.pendingComplaints,
    realTimeData.resolvedComplaints,
    realTimeData.complaintsInProgress,
    realTimeData.complaintsRejected,
  ]);

  const renderOverviewContent = () => {
    const todayLabel = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const dueAmount = 0;
    const totalNotifications = realTimeData.recentNotifications.length;
    const paymentPercent = Math.min(100, Math.max(0, feeCollectionRate));

    const { pipeline: complaintPipeline, total: complaintTotal, resolutionRate, donutBg, maxStage } =
      complaintDeskSnapshot;

    return (
      <div className="flex w-full flex-col gap-5">

        <div className="rounded-[2rem] border border-white/[0.06] bg-slate-950/50 p-6 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.85)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Dashboard
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Good Evening, {adminName}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-slate-400">
                Here’s what’s happening in your hostel today.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Today</p>
                <p className="mt-1 font-semibold text-slate-100">{todayLabel}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/reports")}
                className="h-11 px-4 text-sm"
              >
                Generate Report
              </Button>
              <Button
                type="button"
                onClick={() => setActiveNav("notices")}
                className="h-11 px-4 text-sm"
              >
                Send Notification
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Room Occupancy
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-50">{occupancyRate}%</p>
            <p className="mt-2 text-sm text-slate-400">{realTimeData.occupiedRooms} of {realTimeData.totalRooms} slots filled</p>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Total Fees
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-50">{formatINR(realTimeData.totalFeeCollection)}</p>
            <p className="mt-2 text-sm text-slate-400">Collected this month</p>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Due Amount
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-50">{formatINR(dueAmount)}</p>
            <p className="mt-2 text-sm text-emerald-300">All Clear</p>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Complaints
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-50">{realTimeData.pendingComplaints}</p>
            <p className="mt-2 text-sm text-slate-400">{realTimeData.resolvedComplaints} resolved</p>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Notifications
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-50">{totalNotifications}</p>
            <p className="mt-2 text-sm text-slate-400">Unread alerts</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <AdminOperationsCard
            title="Fee Payment Status"
            description="Realtime billing health"
            actionButton={{
              label: "View payment history",
              onClick: () => setActiveNav("fees"),
              variant: "secondary",
            }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex items-center justify-center">
                <div className="relative h-44 w-44 rounded-full bg-slate-900/80 p-6">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#22c55e ${paymentPercent}%, rgba(148,163,184,0.16) ${paymentPercent}% 100%)`,
                    }}
                  />
                  <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-slate-950/90 text-center text-slate-100 shadow-inner">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Paid</p>
                    <p className="mt-2 text-3xl font-semibold">{paymentPercent}%</p>
                    <p className="mt-1 text-xs text-slate-400">of target</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/[0.06] bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Fees</p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">{formatINR(realTimeData.totalFeeCollection)}</p>
                </div>
                <div className="rounded-3xl border border-white/[0.06] bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Remaining</p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">{formatINR(dueAmount)}</p>
                </div>
              </div>
            </div>
          </AdminOperationsCard>

          <AdminOperationsCard
            title="Recent Complaints"
            description="Latest issues reported by students"
            actionButton={{
              label: "View all complaints",
              onClick: () => setActiveNav("complaints"),
              variant: "secondary",
            }}
          >
            <div className="space-y-3">
              {realTimeData.recentComplaints.slice(0, 4).map((complaint) => (
                <div
                  key={complaint.id}
                  className="rounded-3xl border border-white/[0.05] bg-slate-950/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-50 truncate">{complaint.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(complaint.date)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>
              ))}
              {realTimeData.recentComplaints.length === 0 && (
                <p className="text-sm text-slate-400">No complaints available.</p>
              )}
            </div>
          </AdminOperationsCard>

          <AdminOperationsCard
            title="Hostel Announcements"
            description="Latest notices for students"
            actionButton={{
              label: "View all notices",
              onClick: () => setActiveNav("notices"),
              variant: "secondary",
            }}
          >
            <div className="space-y-3">
              {realTimeData.recentNotifications.slice(0, 4).map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-3xl border border-white/[0.05] bg-slate-950/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-50 truncate">{notification.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(notification.date)}</p>
                    </div>
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-200">
                      New
                    </span>
                  </div>
                </div>
              ))}
              {realTimeData.recentNotifications.length === 0 && (
                <p className="text-sm text-slate-400">No announcements published yet.</p>
              )}
            </div>
          </AdminOperationsCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.65fr_minmax(300px,400px)]">
          <div className="min-w-0 space-y-6">
            <AdminOperationsCard
              title="Dashboard Overview"
              description="Monitor core operational metrics"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Total Students",
                    value: realTimeData.totalStudents,
                  },
                  {
                    label: "Room Occupancy",
                    value: `${occupancyRate}%`,
                  },
                  {
                    label: "Total Rooms",
                    value: realTimeData.totalRooms,
                  },
                  {
                    label: "Pending Fees",
                    value: formatINR(dueAmount),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-50">{item.value}</p>
                  </div>
                ))}
              </div>
            </AdminOperationsCard>

            <AdminOperationsCard
              title="Revenue Overview"
              description="Fee collection trend across recent months"
            >
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/[0.06] bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">This Month</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-50">{formatINR(realTimeData.totalFeeCollection)}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                      {paymentPercent}% collected
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {realTimeData.monthlyFeeCollection.map((item) => {
                    const maxAmount = Math.max(...realTimeData.monthlyFeeCollection.map((i) => i.amount), 1);
                    return (
                      <div key={item.month} className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{item.month}</span>
                          <span className="tabular-nums text-slate-200">{formatINR(item.amount)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-sky-400/90"
                            style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AdminOperationsCard>
          </div>

          <div className="min-h-0 min-w-0">
            <AdminOperationsCard
              title="Live activity stream"
              description="Cross-domain events — fees, rooms, complaints, notices"
              actionButton={{
                label: "Open analytics",
                onClick: () => setActiveNav("analytics"),
                variant: "secondary",
              }}
              className="xl:min-h-[560px]"
            >
              <AdminActivityFeed
                events={activityEvents}
                compact
                maxHeight="max-h-[min(520px,56vh)] xl:max-h-[min(640px,calc(100vh-20rem))]"
              />
            </AdminOperationsCard>
          </div>
        </div>

        <AdminOperationsCard
          title="Operations health"
          description="Complaint queue intelligence — volume, resolution cadence, and stage-wise load (live aggregate)"
          actionButton={{
            label: "Open complaint desk",
            onClick: () => setActiveNav("complaints"),
            variant: "secondary",
          }}
          contentClassName="!pt-2"
          className={clsx(adminVisual.primaryPanel, "border-white/[0.07]")}
        >
          <div className="grid gap-8 xl:grid-cols-[1fr_minmax(200px,260px)] xl:items-start">
            <div className="min-w-0 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    {
                      label: "Total volume",
                      value: complaintTotal > 0 ? String(complaintTotal) : "—",
                      hint: "All ticket statuses",
                    },
                    {
                      label: "Resolution rate",
                      value: `${resolutionRate}%`,
                      hint: `${complaintPipeline.resolved} closed`,
                    },
                    {
                      label: "Open queue",
                      value: String(complaintPipeline.pending),
                      hint: "Pending routing",
                    },
                    {
                      label: "In progress",
                      value: String(complaintPipeline.inProgress),
                      hint: "Staff-owned",
                    },
                  ] as const
                ).map((tile) => (
                  <div
                    key={tile.label}
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">{tile.label}</p>
                    <p className="mt-3 text-2xl font-bold tabular-nums text-slate-50">{tile.value}</p>
                    <p className={clsx(adminVisual.metaQuiet, "mt-2 text-[11px]")}>{tile.hint}</p>
                  </div>
                ))}
              </div>

              <div className={clsx(adminVisual.secondaryPanel, "p-5")}>
                <p className={adminVisual.labelEyebrow}>Pipeline distribution</p>
                <p className={clsx(adminVisual.metaQuiet, "mt-1 max-w-2xl")}>
                  Proportional mix across the full desk — same strip semantics as revenue overview, scaled to complaint volume.
                </p>
                <div className="mt-5 flex h-4 w-full overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.06]">
                  {complaintTotal > 0 ? (
                    <>
                      <div
                        className="h-full bg-amber-400/90"
                        style={{ width: `${(complaintPipeline.pending / complaintTotal) * 100}%` }}
                        title="Pending"
                      />
                      <div
                        className="h-full bg-emerald-400/90"
                        style={{ width: `${(complaintPipeline.resolved / complaintTotal) * 100}%` }}
                        title="Resolved"
                      />
                      <div
                        className="h-full bg-sky-400/90"
                        style={{ width: `${(complaintPipeline.inProgress / complaintTotal) * 100}%` }}
                        title="In progress"
                      />
                      <div
                        className="h-full bg-rose-400/90"
                        style={{ width: `${(complaintPipeline.rejected / complaintTotal) * 100}%` }}
                        title="Rejected"
                      />
                    </>
                  ) : (
                    <div className="h-full w-full bg-slate-800/60" />
                  )}
                </div>
              </div>

              <div className={clsx(adminVisual.secondaryPanel, "p-5")}>
                <p className={adminVisual.labelEyebrow}>Stage load (normalized)</p>
                <p className={clsx(adminVisual.metaQuiet, "mb-4 mt-1")}>
                  Cadence bars use the same read pattern as revenue analytics — peak stage carries the longest trace.
                </p>
                <div className="space-y-3">
                  {(
                    [
                      {
                        key: "pending",
                        label: "Pending",
                        value: complaintPipeline.pending,
                        barClass: "rounded-full bg-amber-400/90",
                      },
                      {
                        key: "resolved",
                        label: "Resolved",
                        value: complaintPipeline.resolved,
                        barClass: "rounded-full bg-emerald-400/90",
                      },
                      {
                        key: "in-progress",
                        label: "In progress",
                        value: complaintPipeline.inProgress,
                        barClass: "rounded-full bg-sky-400/90",
                      },
                      {
                        key: "rejected",
                        label: "Rejected",
                        value: complaintPipeline.rejected,
                        barClass: "rounded-full bg-rose-400/90",
                      },
                    ] as const
                  ).map((row) => (
                    <div key={row.key} className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{row.label}</span>
                        <span className="tabular-nums font-bold text-slate-50">{row.value}</span>
                      </div>
                      <div className={adminVisual.chartTrack}>
                        <div
                          className={`h-full ${row.barClass}`}
                          style={{ width: `${(row.value / maxStage) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={clsx(adminVisual.secondaryPanel, "px-3 py-2.5 text-[11px] leading-relaxed text-slate-500")}>
                <span className="font-medium text-slate-400">Desk signal:</span>{" "}
                {complaintPipeline.pending} open items need routing; {complaintPipeline.inProgress} owned by staff;
                latest samples surface in Live activity stream and Recent Complaints.
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/[0.06] bg-slate-950/45 px-4 py-6">
              <div
                className="relative h-[188px] w-[188px] shrink-0 rounded-full p-[11px] shadow-[0_22px_60px_-32px_rgba(0,0,0,0.88)] ring-1 ring-white/[0.08]"
                style={{ background: donutBg }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950/92 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Resolved</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-50">{resolutionRate}%</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {complaintPipeline.resolved} / {complaintTotal || "—"} closed
                  </p>
                </div>
              </div>
              <p className="max-w-[220px] text-center text-[11px] leading-snug text-slate-500">
                Aggregate ring mirrors the complaint desk — counts refresh with hostel-wide ticket changes.
              </p>
            </div>
          </div>
        </AdminOperationsCard>
      </div>
  );
  };

  const renderStudentsSection = () => (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Directory"
        title="Student operations"
        description="Live roster, assignments, and profile actions — primary operational surface for hostel intake."
        actions={
          <Button
            type="button"
            className="h-10 px-4 text-xs font-semibold"
            onClick={() => navigate("/admin/select-student-dashboard")}
          >
            Add student
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_minmax(260px,320px)]">
        <AdminOperationsCard
          title="Student roster"
          description="Searchable directory — primary workflow"
          contentClassName="!px-0 !pb-0"
        >
          <div className={clsx(AdminTableClasses.container, adminVisual.dataPlate)}>
            <table className={AdminTableClasses.table}>
              <thead className={AdminTableClasses.thead}>
                <tr>
                  <th className={AdminTableClasses.th}>Student</th>
                  <th className={AdminTableClasses.th}>ID</th>
                  <th className={AdminTableClasses.th}>Course</th>
                  <th className={AdminTableClasses.th}>Room</th>
                  <th className={clsx(AdminTableClasses.th, "text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody className={AdminTableClasses.tbody}>
                {studentProfiles.map((student) => (
                  <tr key={student.id} className={AdminTableClasses.tr}>
                    <td className={AdminTableClasses.td}>
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={student.full_name}
                          imageUrl={student.profile_picture}
                          seed={student.student_id || student.id}
                          className="h-8 w-8"
                        />
                        <div className="min-w-0">
                          <p className={clsx(adminVisual.textRowPrimary, "truncate font-medium")}>
                            {student.full_name || "Unnamed"}
                          </p>
                          <p className={clsx(adminVisual.textRowMeta, "truncate text-[11px]")}>
                            {student.course || "Course unknown"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={clsx(AdminTableClasses.td, "tabular-nums text-slate-400")}>
                      {student.student_id || "—"}
                    </td>
                    <td className={clsx(AdminTableClasses.td, "text-slate-400")}>{student.course || "—"}</td>
                    <td className={clsx(AdminTableClasses.td, "text-slate-100 font-bold")}>
                      {student.room_number || "Unassigned"}
                    </td>
                    <td className={clsx(AdminTableClasses.td, "text-right")}>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-[11px]"
                          onClick={() => handleViewStudentDetails(student.id)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 px-2.5 text-[11px]"
                          onClick={() => handleEditStudent(student.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminOperationsCard>
        <div className="flex flex-col gap-5">
          <div className={clsx(adminVisual.secondaryPanel, "p-5")}>
            <p className={adminVisual.labelEyebrow}>Roster signal</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-100">{studentProfiles.length}</p>
            <p className={clsx(adminVisual.metaQuiet, "mt-2")}>Students indexed in this workspace snapshot.</p>
          </div>
          <div className={clsx(adminVisual.tertiaryPanel, "p-4 text-xs leading-relaxed text-slate-500")}>
            Tip: use <span className="text-slate-400">Add student</span> to onboard profiles, then assign rooms from the student view.
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoomsSection = () => (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Capacity"
        title="Room operations"
        description="Review change requests first — then validate utilization against total inventory."
      />
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <AdminOperationsCard
          title="Pending change requests"
          description="Primary queue — approve or reject before allocation shifts"
          contentClassName="!pt-3"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-4">
            <div>
              <p className={adminVisual.labelEyebrow}>Open items</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">{pendingRoomRequests.length}</p>
            </div>
            <Button size="sm" variant="outline" className="h-9 text-[11px]" type="button" onClick={() => void fetchRoomChangeRequests()}>
              Refresh queue
            </Button>
          </div>
          <div className="mt-4 space-y-2.5">
            {pendingRoomRequests.length > 0 ? (
              pendingRoomRequests.slice(0, 8).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-slate-950/60 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-50 truncate">{request.studentName}</p>
                    <p className="text-[11px] text-slate-400 truncate capitalize">{request.requestedType} room preferred</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 px-3 text-[11px]"
                    type="button"
                    onClick={() => handleViewRoomRequest(request)}
                  >
                    Review
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No pending room change requests.</p>
            )}
          </div>
        </AdminOperationsCard>
        <div className="flex flex-col gap-5">
          {[
            { label: "Total capacity", value: realTimeData.totalRooms, hint: "Inventory baseline" },
            { label: "Occupied slots", value: realTimeData.occupiedRooms, hint: "Against capacity" },
          ].map((item) => (
            <div key={item.label} className={clsx(adminVisual.secondaryPanel, "p-5")}>
              <p className={adminVisual.labelEyebrow}>{item.label}</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-100">{item.value}</p>
              <p className={clsx(adminVisual.metaQuiet, "mt-2")}>{item.hint}</p>
            </div>
          ))}
          <div className={clsx(adminVisual.tertiaryPanel, "p-4 text-xs text-slate-500")}>
            Secondary analytics for utilization trends live under <span className="text-slate-400">Analytics</span>.
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplaintsSection = () => (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Resolution"
        title="Complaint desk"
        description="Prioritize open cases — status drives downstream hostel operations and student trust."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <AdminOperationsCard
          title="Active issues"
          description="Primary queue — newest surfaced first"
          contentClassName="!px-0 !pb-0"
        >
          <div className={clsx(AdminTableClasses.container, adminVisual.dataPlate)}>
            <table className={AdminTableClasses.table}>
              <thead className={AdminTableClasses.thead}>
                <tr>
                  <th className={AdminTableClasses.th}>Issue</th>
                  <th className={AdminTableClasses.th}>Status</th>
                  <th className={AdminTableClasses.th}>Logged</th>
                  <th className={clsx(AdminTableClasses.th, "text-right")}>Action</th>
                </tr>
              </thead>
              <tbody className={AdminTableClasses.tbody}>
                {realTimeData.recentComplaints.length > 0 ? (
                  realTimeData.recentComplaints.map((complaint) => (
                    <tr key={complaint.id} className={AdminTableClasses.tr}>
                      <td className={clsx(AdminTableClasses.td, AdminTableClasses.primaryText)}>{complaint.title}</td>
                      <td className={AdminTableClasses.td}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getStatusColor(complaint.status)}`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td className={clsx(AdminTableClasses.td, "text-slate-400 tabular-nums font-medium")}>
                        {formatDate(complaint.date)}
                      </td>
                      <td className={clsx(AdminTableClasses.td, "text-right")}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-[11px]"
                          type="button"
                          onClick={() => handleReviewComplaint(complaint)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={clsx(AdminTableClasses.td, "py-10 text-center text-slate-500")}>
                      No complaints in this snapshot.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminOperationsCard>
        <div className="flex flex-col gap-5">
          <div className={clsx(adminVisual.secondaryPanel, "p-5")}>
            <p className={adminVisual.labelEyebrow}>Pending</p>
            <p className="mt-3 text-3xl font-bold text-slate-50">{realTimeData.pendingComplaints}</p>
            <p className={clsx(adminVisual.metaQuiet, "mt-2")}>Awaiting admin resolution.</p>
          </div>
          <div className={clsx(adminVisual.tertiaryPanel, "p-4 text-xs text-slate-500")}>
            Closed cases roll into analytics for trend reporting without blocking this queue.
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeesSection = () => (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Billing"
        title="Fees console"
        description="Assignment, collection signals, and ledger edits — central finance operations for the hostel."
      />
      <AdminOperationsCard
        title="Fee workflows"
        description="Assign line items, reconcile statuses, audit payments"
        contentClassName="!pt-3"
      >
        <AdminFees
          students={studentProfiles.map((s) => ({
            id: s.id,
            full_name: s.full_name,
            student_id: s.student_id,
          }))}
        />
      </AdminOperationsCard>
    </div>
  );

  const renderNoticesSection = () => (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Communications"
        title="Notices & alerts"
        description="Broadcast operational updates with controlled urgency — aligned to student notification channels."
      />
      <AdminOperationsCard
        title="Composer & delivery"
        description="Primary surface — compose, target, and verify sends"
        contentClassName="!pt-3"
      >
        <AdminNotifications />
      </AdminOperationsCard>
    </div>
  );

  const renderReportsSection = () => (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Intelligence"
        title="Reporting hub"
        description="Executive workspace — filtered datasets, exports, and the master report with print-faithful composition inside the dark shell."
        actions={
          <Button
            type="button"
            className="h-10 px-4 text-xs font-semibold"
            onClick={() => navigate("/admin/reports")}
          >
            Open reports workspace
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <AdminOperationsCard
          title="Executive exports"
          description="Primary — CSV, print, full master report"
          className={clsx(adminVisual.primaryPanel, "lg:col-span-2")}
          actionButton={{
            label: "Launch",
            onClick: () => navigate("/admin/reports"),
            variant: "primary",
          }}
        >
          <p className="text-sm leading-relaxed text-slate-400">
            Fee performance, occupancy, complaints, and roster datasets — filtered, printable, and investor-ready without leaving the dark
            operational shell.
          </p>
        </AdminOperationsCard>
        <div className={clsx(adminVisual.secondaryPanel, "flex flex-col justify-between p-5")}>
          <div>
            <p className={adminVisual.labelEyebrow}>Coverage</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="text-slate-600">—</span> Revenue & fee collection
              </li>
              <li className="flex gap-2">
                <span className="text-slate-600">—</span> Rooms & utilization
              </li>
              <li className="flex gap-2">
                <span className="text-slate-600">—</span> Complaint throughput
              </li>
            </ul>
          </div>
          <p className={clsx(adminVisual.metaQuiet, "mt-6 border-t border-white/[0.06] pt-4 text-[11px]")}>
            Secondary context only — launch the workspace for interactive filters.
          </p>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSection = () => {
    const { pipeline: cp, total: ct, maxStage: cms } = complaintDeskSnapshot;
    return (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Signals"
        title="Operational analytics"
        description="Muted cadence visualization — revenue rhythm as primary; inventory and complaint throughput as operational context."
      />
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <AdminOperationsCard title="Revenue cadence" description="Primary — monthly fee throughput (normalized)" contentClassName="!pt-2">
          <div className={clsx(adminVisual.secondaryPanel, "p-5")}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className={adminVisual.labelEyebrow}>Aggregate collected</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">
                  {formatINR(realTimeData.totalFeeCollection)}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {realTimeData.monthlyFeeCollection.map((item) => {
                const max = Math.max(...realTimeData.monthlyFeeCollection.map((i) => i.amount), 1);
                return (
                  <div key={item.month} className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{item.month}</span>
                      <span className="tabular-nums font-bold text-slate-50">{formatINR(item.amount)}</span>
                    </div>
                    <div className={adminVisual.chartTrack}>
                      <div
                        className={adminVisual.chartBarPrimary}
                        style={{ width: `${(item.amount / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AdminOperationsCard>
        <AdminOperationsCard title="Inventory mix" description="Secondary — segment counts (non-equal weight)" contentClassName="!pt-2">
          <div className={clsx(adminVisual.secondaryPanel, "space-y-4 p-5")}>
            <div>
              <p className={adminVisual.labelEyebrow}>Occupancy headline</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">{occupancyRate}%</p>
            </div>
            <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
              {[
                { label: "Single", value: realTimeData.roomOccupancy.single },
                { label: "Double", value: realTimeData.roomOccupancy.double },
                { label: "Triple", value: realTimeData.roomOccupancy.triple },
                { label: "Quad", value: realTimeData.roomOccupancy.quad },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-bold tabular-nums text-slate-50">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </AdminOperationsCard>
      </div>
      <AdminOperationsCard
        title="Complaint throughput"
        description="Desk pipeline — distribution and normalized stage load (same analytics language as revenue)"
        contentClassName="!pt-2"
      >
        <div className={clsx(adminVisual.secondaryPanel, "p-5")}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <p className={adminVisual.labelEyebrow}>Pipeline distribution</p>
              <p className={clsx(adminVisual.metaQuiet, "mt-1 max-w-md")}>Live aggregate counts — proportional strip.</p>
              <div className="mt-5 flex h-4 w-full overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.06]">
                {ct > 0 ? (
                  <>
                    <div className="h-full bg-amber-400/90" style={{ width: `${(cp.pending / ct) * 100}%` }} title="Pending" />
                    <div className="h-full bg-emerald-400/90" style={{ width: `${(cp.resolved / ct) * 100}%` }} title="Resolved" />
                    <div className="h-full bg-sky-400/90" style={{ width: `${(cp.inProgress / ct) * 100}%` }} title="In progress" />
                    <div className="h-full bg-rose-400/90" style={{ width: `${(cp.rejected / ct) * 100}%` }} title="Rejected" />
                  </>
                ) : (
                  <div className="h-full w-full bg-slate-800/60" />
                )}
              </div>
            </div>
            <div className="space-y-2.5">
              <p className={adminVisual.labelEyebrow}>Stage load</p>
              {(
                [
                  { key: "p", label: "Pending", value: cp.pending, barClass: "rounded-full bg-amber-400/90" },
                  { key: "r", label: "Resolved", value: cp.resolved, barClass: "rounded-full bg-emerald-400/90" },
                  { key: "i", label: "In progress", value: cp.inProgress, barClass: "rounded-full bg-sky-400/90" },
                  { key: "j", label: "Rejected", value: cp.rejected, barClass: "rounded-full bg-rose-400/90" },
                ] as const
              ).map((row) => (
                <div key={row.key} className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="tabular-nums font-bold text-slate-50">{row.value}</span>
                  </div>
                  <div className={adminVisual.chartTrack}>
                    <div className={`h-full ${row.barClass}`} style={{ width: `${(row.value / cms) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminOperationsCard>
    </div>
    );
  };

  const renderSystemLogsSection = () => (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Infrastructure"
        title="System logs"
        description="Tertiary observability — streaming signals without distracting from live hostel workflows."
      />
      <AdminOperationsCard title="Audit posture" description="Meta signals — reference only" contentClassName="!pt-2">
        <div className={clsx(adminVisual.secondaryPanel, "p-6 text-sm text-slate-400")}>
          <p className="text-slate-100">
            Audit trails route through the operational backend. Use exports from Reports for immutable snapshots.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className={clsx(adminVisual.tertiaryPanel, "p-4")}>
              <p className={adminVisual.labelEyebrow}>Event stream</p>
              <p className="mt-3 text-xl font-semibold text-slate-100">Live</p>
            </div>
            <div className={clsx(adminVisual.tertiaryPanel, "p-4")}>
              <p className={adminVisual.labelEyebrow}>Integrity</p>
              <p className="mt-3 text-xl font-semibold text-slate-100">Secure</p>
            </div>
          </div>
        </div>
      </AdminOperationsCard>
    </div>
  );

  const renderSettingsSection = () => (
    <div className={adminVisual.sectionStack}>
      <AdminPageHero
        eyebrow="Workspace"
        title="Admin settings"
        description="Governance and routing preferences — secondary to daily operational queues."
      />
      <AdminOperationsCard title="Control plane" description="Policies & routing — tertiary summary" contentClassName="!pt-2">
        <div className={clsx(adminVisual.secondaryPanel, "p-6 text-sm text-slate-400")}>
          <p className="text-slate-100">
            Team access, routing rules, and notification defaults consolidate here — execution remains in operational modules.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className={clsx(adminVisual.tertiaryPanel, "p-4")}>
              <p className={adminVisual.labelEyebrow}>Access</p>
              <p className="mt-3 text-xl font-semibold text-slate-100">Admin only</p>
            </div>
            <div className={clsx(adminVisual.tertiaryPanel, "p-4")}>
              <p className={adminVisual.labelEyebrow}>Notifications</p>
              <p className="mt-3 text-xl font-semibold text-slate-100">Managed</p>
            </div>
          </div>
        </div>
      </AdminOperationsCard>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeNav) {
      case "students":
        return renderStudentsSection();
      case "rooms":
        return renderRoomsSection();
      case "complaints":
        return renderComplaintsSection();
      case "fees":
        return renderFeesSection();
      case "notices":
        return renderNoticesSection();
      case "reports":
        return renderReportsSection();
      case "analytics":
        return renderAnalyticsSection();
      case "system-logs":
        return renderSystemLogsSection();
      case "settings":
        return renderSettingsSection();
      default:
        return renderOverviewContent();
    }
  };

  return (
    <>
      <AdminWorkspaceShell
        activeNav={activeNav}
        onNavigate={setActiveNav}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        adminName={adminName}
        profilePicture={null}
        topSlot={
          <AdminTopBar
            adminName={adminName}
            notificationCount={realTimeData.recentNotifications.length}
            onMobileMenuOpen={() => setMobileOpen(true)}
            onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
            onNotificationsOpen={() => setActiveNav("notices")}
          />
        }
        onLogout={handleLogout}
      >
        <div className="flex w-full flex-col gap-5">{renderSectionContent()}</div>
      </AdminWorkspaceShell>

      <AdminCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        activeNav={activeNav}
        onNavigate={handleAdminPaletteNavigate}
        onLogout={handleLogout}
      />

      {selectedStudentId && (
        <StudentDetailsDialog
          open={showStudentDetailsDialog}
          onOpenChange={setShowStudentDetailsDialog}
          student={studentProfiles.find((s) => s.id === selectedStudentId) || null}
          onEdit={() => {
            setShowStudentDetailsDialog(false);
            setShowEditStudentDialog(true);
          }}
        />
      )}

      {selectedStudentId && (
        <EditStudentDialog
          open={showEditStudentDialog}
          onOpenChange={setShowEditStudentDialog}
          student={studentProfiles.find((s) => s.id === selectedStudentId) || null}
          onSaved={async () => {
            await fetchStudentProfiles();
          }}
        />
      )}

      <ComplaintReviewDialog
        open={showComplaintReviewDialog}
        onOpenChange={setShowComplaintReviewDialog}
        complaint={selectedComplaint}
        onStatusUpdate={fetchComplaints}
      />
      <RoomRequestDetailsDialog
        open={showRoomRequestDialog}
        onOpenChange={setShowRoomRequestDialog}
        request={selectedRoomRequest}
        onApprove={handleApproveRoomRequest}
        onReject={handleRejectRoomRequest}
      />
    </>
  );
};

export default AdminDashboard;
