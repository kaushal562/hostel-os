import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { logout } from "@/lib/auth";
import RoomDetailsCard from "@/components/dashboard/RoomDetailsCard";
import FeePaymentCard from "@/components/dashboard/FeePaymentCard";
import ComplaintsCard from "@/components/dashboard/ComplaintsCard";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import QuickActions from "@/components/dashboard/QuickActions";
import RoomChangeForm from "@/components/dashboard/RoomChangeForm";
import ComplaintForm from "@/components/dashboard/ComplaintForm";
import StudentForm from "@/components/dashboard/StudentForm";
import NotificationDetail from "@/components/dashboard/NotificationDetail";
import { Button } from "@/components/ui/button";
import { PremiumAlert } from "@/components/shared/PremiumDashboardComponents";
import {
  StudentWorkspaceShell,
  STUDENT_SECTION_NAV,
  type StudentNavId,
} from "@/components/dashboard/premium/StudentWorkspaceShell";
import { StudentWorkspaceTopBar } from "@/components/dashboard/premium/StudentWorkspaceTopBar";
import { StudentMetricStrip } from "@/components/dashboard/premium/StudentMetricStrip";
import { useStudentFeeSummary } from "@/hooks/useStudentFeeSummary";
import { TRANSITIONS } from "@/lib/premium-motion";
import { CommandPalette } from "@/components/dashboard/premium/CommandPalette";
import { ActivityTimeline } from "@/components/dashboard/premium/ActivityTimeline";
import clsx from "clsx";
import { format } from "date-fns";

export type StudentDashboardMode = "self" | "admin_view";

function StudentDashboardShell({
  enabled,
  shellProps,
  children,
}: {
  enabled: boolean;
  shellProps: Omit<React.ComponentProps<typeof StudentWorkspaceShell>, "children">;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return <StudentWorkspaceShell {...shellProps}>{children}</StudentWorkspaceShell>;
}


interface StudentProfile {
  id: string;
  full_name: string;
  student_id: string;
  course: string;
  year: string;
  room_number: string;
  room_type: string;
  block: string;
  floor: string;
  contact_number?: string;
  emergency_contact?: string;
  profile_picture?: string;
  role?: string;
}

export default function StudentDashboard({
  mode,
  targetStudentId,
  nestedInAdminShell = false,
}: {
  mode: StudentDashboardMode;
  /**
   * Required only for admin_view mode (admin viewing a student).
   * In self mode the target is derived from the authenticated session.
   */
  targetStudentId?: string;
  /** When true with admin_view, content renders inside shared AdminShellLayout (no student portal chrome). */
  nestedInAdminShell?: boolean;
}) {
  const navigate = useNavigate();

  const [showRoomChangeForm, setShowRoomChangeForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showNotificationDetail, setShowNotificationDetail] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null,
  );
  const [complaints, setComplaints] = useState<any[]>([]);
  const [latestRoomRequest, setLatestRoomRequest] = useState<any>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<StudentNavId>("overview");
  const [portalSearch, setPortalSearch] = useState("");

  const [roomActionBanner, setRoomActionBanner] = useState<{
    id: string;
    kind: "approved" | "rejected";
    title: string;
    message: string;
  } | null>(null);

  const [roomActionBannerVisible, setRoomActionBannerVisible] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Mock activity events for the timeline
  const activityEvents = useMemo(() => {
    return [
      {
        id: "1",
        type: "system" as const,
        status: "info" as const,
        title: "Workspace session opened",
        description: "Authenticated session for " + (studentProfile?.full_name || "resident"),
        timestamp: new Date().toISOString(),
      },
      ...complaints.map(c => ({
        id: `c-${c.id}`,
        type: "complaint" as const,
        status: (c.status === "resolved" ? "success" : "pending") as any,
        title: `Complaint: ${c.title}`,
        description: c.description,
        timestamp: c.created_at,
      })),
      ...notifications.slice(0, 3).map((n) => ({
        id: `n-${n.id}`,
        type: "notice" as const,
        status: "info" as any,
        title: n.title,
        description: n.message,
        timestamp: (n as { date?: string }).date ?? "",
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [studentProfile, complaints, notifications]);


  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdminView = mode === "admin_view";

  useEffect(() => {
    if (isAdminView && !targetStudentId) {
      navigate("/admin/select-student-dashboard", { replace: true });
    }
  }, [isAdminView, targetStudentId, navigate]);

  useEffect(() => {
    if (isAdminView && nestedInAdminShell) {
      setActiveNav("overview");
    }
  }, [isAdminView, nestedInAdminShell, targetStudentId]);

  const feeSummary = useStudentFeeSummary(isAdminView ? targetStudentId : undefined);

  const dashboardUserId = useMemo(() => {
    if (isAdminView) return targetStudentId ?? "";
    return "";
  }, [isAdminView, targetStudentId]);

  const requireSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("User not authenticated");
    return session;
  };

  const fetchStudentProfile = async () => {
    try {
      setIsLoading(true);
      setError("");

      const session = await requireSession();

      const profileId = isAdminView ? targetStudentId : session.user.id;
      if (!profileId) throw new Error("Missing target student id");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!data) throw new Error("Student profile not found");

      // Enforce: admin view target must be student-only.
      if (isAdminView && (data as any)?.role !== "student") {
        throw new Error("Admin view target is not a student");
      }

      // Enforce: admin profile must never behave like a student.
      if (!isAdminView && (data as any)?.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      setStudentProfile(data as StudentProfile);

      // In self mode, incomplete profile prompts the student form.
      if (!isAdminView && (!data.full_name || !data.student_id || !data.room_number)) {
        setShowStudentForm(true);
      }
    } catch (e: any) {
      console.error("Error fetching student profile:", e);
      setError(e?.message || "Failed to load student profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const session = await requireSession();
      const profileId = isAdminView ? targetStudentId : session.user.id;
      if (!profileId) return;

      const { data, error: complaintsError } = await supabase
        .from("complaints")
        .select("id, title, description, created_at, status, user_id")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (complaintsError) throw complaintsError;

      const mapped = (data || []).map((c: any) => ({
        ...c,
        date: c.created_at,
      }));
      setComplaints(mapped);
    } catch (e) {
      console.error("Error fetching complaints:", e);
      setComplaints([]);
    }
  };

  const fetchLatestRoomRequest = async () => {
    try {
      const session = await requireSession();
      const profileId = isAdminView ? targetStudentId : session.user.id;
      if (!profileId) return;

      const { data, error: reqError } = await supabase
        .from("room_change_requests")
        .select("*")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reqError) throw reqError;
      setLatestRoomRequest(data);
    } catch (e) {
      console.error("Error fetching room request:", e);
    }
  };

  const startNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError("");

      const session = await requireSession();
      const profileId = isAdminView ? targetStudentId : session.user.id;
      if (!profileId) return;

      const { data, error: notifError } = await supabase
        .from("notifications")
        .select("id,title,message,type,is_read,created_at,user_id")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (notifError) throw notifError;

      setNotifications(
        (data || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          is_read: !!n.is_read,
          date: n.created_at,
          user_id: n.user_id,
        })),
      );
    } catch (e: any) {
      console.error("Error fetching notifications:", e);
      setNotificationsError(e?.message || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
    fetchComplaints();
    fetchLatestRoomRequest();
    startNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, targetStudentId]);

  const markNotificationRead = async (id: string) => {
    if (isAdminView) return;
    try {
      const session = await requireSession();
      const userId = session.user.id;
      setNotifications((prev) => prev.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
      const { error: markError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", userId)
        .select("id");
      if (markError) throw markError;
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
  };

  // Drive temporary success/rejection banner from unread notification state
  useEffect(() => {
    if (isAdminView) return;

    const unread = (notifications || []).filter((n) => !n.is_read);
    if (!unread.length) {
      setRoomActionBanner(null);
      setRoomActionBannerVisible(false);
      return;
    }

    const approved = [...unread].find((n) => String(n.title || "").toLowerCase().includes("room change request approved"));
    const rejected = [...unread].find((n) => String(n.title || "").toLowerCase().includes("room change request rejected"));

    const next = approved
      ? ({ id: approved.id, kind: "approved" as const, title: approved.title, message: approved.message } as const)
      : rejected
        ? ({ id: rejected.id, kind: "rejected" as const, title: rejected.title, message: rejected.message } as const)
        : null;

    // Only show if we have an unread notification event we haven't already shown.
    if (next && (!roomActionBanner || roomActionBanner.id !== next.id)) {
      setRoomActionBanner(next);
      setRoomActionBannerVisible(true);

      const t = window.setTimeout(() => {
        setRoomActionBannerVisible(false);
        void markNotificationRead(next.id);
      }, 4500);

      return () => window.clearTimeout(t);
    }

    // If it's already the same event, do nothing.
  }, [notifications, isAdminView]);

  // Quick open command menu (ignore when typing in fields)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (
        el?.closest("input, textarea, select, [contenteditable=true]") ||
        el?.getAttribute("role") === "textbox"
      ) {
        return;
      }
      e.preventDefault();
      setCommandPaletteOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Realtime: notifications for this student
  useEffect(() => {
    let isMounted = true;

    const start = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const profileId = isAdminView ? targetStudentId : session.user.id;
        if (!profileId) return;

        const channel = supabase
          .channel(`student-dashboard-notifications-${profileId}`)
          .on(
            "postgres_changes",
            { schema: "public", table: "notifications", event: "*", filter: `user_id=eq.${profileId}` },
            () => {
              if (!isMounted) return;
              void startNotifications();
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (e) {
        console.warn("[StudentDashboard] realtime notifications subscription failed:", e);
      }
    };

    let cleanup: void | (() => void) = undefined;
    void start().then((c) => {
      cleanup = c;
    });

    return () => {
      isMounted = false;
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, targetStudentId]);

  // Realtime: keep profile/room info consistent after admin edits.
  useEffect(() => {
    let isMounted = true;

    const start = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const profileId = isAdminView ? targetStudentId : session.user.id;
        if (!profileId) return;

        const channel = supabase
          .channel(`student-dashboard-profile-${profileId}`)
          .on(
            "postgres_changes",
            { schema: "public", table: "profiles", event: "*", filter: `id=eq.${profileId}` },
            () => {
              if (!isMounted) return;
              void fetchStudentProfile();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (e) {
        console.warn("[StudentDashboard] realtime profile subscription failed:", e);
      }
    };

    let cleanup: void | (() => void) = undefined;
    void start().then((c) => {
      cleanup = c;
    });

    return () => {
      isMounted = false;
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, targetStudentId]);

  const getFormattedProfileData = () => {
    if (!studentProfile) return null;
    return {
      fullName: studentProfile.full_name || "",
      studentId: studentProfile.student_id || "",
      course: studentProfile.course || "",
      year: studentProfile.year || "",
      roomNumber: studentProfile.room_number || "",
      roomType: studentProfile.room_type || "",
      block: studentProfile.block || "",
      floor: studentProfile.floor || "",
      contactNumber: studentProfile.contact_number || "",
      emergencyContact: studentProfile.emergency_contact || "",
    };
  };

  const openComplaints = useMemo(() => {
    return complaints.filter((c: any) => {
      const s = String(c.status || "").toLowerCase();
      return s !== "resolved" && s !== "rejected";
    }).length;
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const q = portalSearch.trim().toLowerCase();
    if (!q) return complaints;
    return complaints.filter((c: any) => {
      const t = String(c.title || "").toLowerCase();
      const d = String(c.description || "").toLowerCase();
      return t.includes(q) || d.includes(q);
    });
  }, [complaints, portalSearch]);

  const filteredNotifications = useMemo(() => {
    const q = portalSearch.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter((n: any) => {
      const t = String(n.title || "").toLowerCase();
      const m = String(n.message || "").toLowerCase();
      return t.includes(q) || m.includes(q);
    });
  }, [notifications, portalSearch]);

  const roomKpiLabel = studentProfile?.room_number?.trim()
    ? studentProfile.room_number.trim()
    : "Unassigned";

  const navigateToSection = (id: StudentNavId) => {
    // Workspace-focused navigation: no scroll jumps.
    setActiveNav(id);
    setMobileNavOpen(false);
  };


  // Initialize to overview on first load
  useEffect(() => {
    if (!isLoading && activeNav === "overview") {
      // Keep overview as initial section
    }
  }, [isLoading]);

  const adminViewHeader =
    isAdminView && !nestedInAdminShell ? (
      <PremiumAlert
        type="warning"
        title="Admin viewing student workspace"
        message={`You are previewing ${studentProfile?.full_name || "this student"}${
          studentProfile?.student_id ? ` (${studentProfile.student_id})` : ""
        }. Actions that mutate data may still use your admin session.`}
        action={
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400/40 bg-transparent text-amber-100 hover:bg-amber-500/10"
            onClick={() => navigate("/admin/select-student-dashboard", { replace: true })}
          >
            Exit view
          </Button>
        }
      />
    ) : null;

  const adminPreviewStrip =
    isAdminView && nestedInAdminShell ? (
      <div className="flex flex-col gap-3 rounded-lg border border-amber-400/25 bg-amber-950/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-100">
          <span className="font-semibold text-amber-50">Admin-controlled preview</span>
          <span className="text-amber-100/90">
            {" "}
            — {studentProfile?.full_name || "Student"}
            {studentProfile?.student_id ? ` (${studentProfile.student_id})` : ""}. Not a resident session.
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/[0.12] bg-transparent text-xs text-slate-200 hover:bg-white/[0.06]"
            type="button"
            onClick={() => navigate("/admin/select-student-dashboard")}
          >
            Student list
          </Button>
          <Button variant="outline" size="sm" className="text-xs" type="button" onClick={() => navigate("/admin")}>
            Admin home
          </Button>
        </div>
      </div>
    ) : null;

  if (isLoading) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#060913]">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/12 border-t-slate-300/80" />
      </div>
    );
  }

  const renderSectionHeader = (label: string, title: string, description: string) => (
    <div className="max-w-[54ch]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <h2 className="mt-1.5 text-[1.0625rem] font-semibold tracking-tight text-slate-50">{title}</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{description}</p>
    </div>
  );

  const useStudentPortalChrome = !(isAdminView && nestedInAdminShell);

  const studentShellProps: Omit<React.ComponentProps<typeof StudentWorkspaceShell>, "children"> = {
    activeNav,
    onNavigate: navigateToSection,
    collapsed: sidebarCollapsed,
    onToggleCollapse: () => setSidebarCollapsed((v) => !v),
    mobileOpen: mobileNavOpen,
    onMobileOpenChange: setMobileNavOpen,
    studentName: studentProfile?.full_name || "Student",
    profilePicture: studentProfile?.profile_picture || null,
    topSlot: (
      <StudentWorkspaceTopBar
        onMenuClick={() => setMobileNavOpen(true)}
        studentName={studentProfile?.full_name || "Student"}
        profilePicture={studentProfile?.profile_picture || null}
        searchQuery={portalSearch}
        onSearchChange={setPortalSearch}
        unreadCount={unreadCount}
        notifications={filteredNotifications}
        onNotificationClick={(n) => {
          setSelectedNotification(n);
          setShowNotificationDetail(true);
        }}
        onMarkAsRead={(id) => void handleMarkRead(id)}
        onLogout={async () => {
          await logout();
          navigate(isAdminView ? "/admin/login" : "/login");
        }}
        onUpdateProfile={() => {
          if (isAdminView) return;
          setShowStudentForm(true);
        }}
        onCommandPalette={() => setCommandPaletteOpen(true)}
      />
    ),
  };

  const nestedMotion =
    isAdminView && nestedInAdminShell
      ? ({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } } as const)
      : ({
          initial: { opacity: 0, scale: 0.994 },
          animate: { opacity: 1, scale: 1 },
          transition: TRANSITIONS.workspaceSection,
        } as const);

  return (
    <>
      <StudentDashboardShell enabled={useStudentPortalChrome} shellProps={studentShellProps}>
        <motion.div
          key={activeNav}
          {...nestedMotion}
          className="space-y-6"
        >
          {adminPreviewStrip}
          {isAdminView && nestedInAdminShell ? (
            <nav
              className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-3"
              aria-label="Student workspace sections"
            >
              {STUDENT_SECTION_NAV.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigateToSection(id)}
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    activeNav === id
                      ? "border-white/[0.12] bg-white/[0.06] text-slate-100"
                      : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
          ) : null}
          {/* Status Alerts - Always shown */}
          {adminViewHeader ? <>{adminViewHeader}</> : null}
          {error ? <PremiumAlert type="error" title="Unable to load workspace" message={error} /> : null}
          {latestRoomRequest && latestRoomRequest.status === "pending" ? (
            <PremiumAlert
              type="info"
              title="Room change pending"
              message={`Your request for a ${latestRoomRequest.preferred_room_type} room is awaiting review.`}
            />
          ) : null}
          {roomActionBannerVisible && roomActionBanner?.kind === "approved" ? (
            <PremiumAlert
              type="success"
              title="Room change approved"
              message={`Your room change request has been approved. ${roomActionBanner.message}`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-400/40 bg-transparent text-emerald-100 hover:bg-emerald-500/10"
                  onClick={() => {
                    setRoomActionBannerVisible(false);
                    if (roomActionBanner) void markNotificationRead(roomActionBanner.id);
                  }}
                >
                  Dismiss
                </Button>
              }
            />
          ) : null}
          {roomActionBannerVisible && roomActionBanner?.kind === "rejected" ? (
            <PremiumAlert
              type="error"
              title="Room change rejected"
              message={`Your room change request was rejected. ${roomActionBanner.message}`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-400/40 bg-transparent text-red-100 hover:bg-red-500/10"
                  onClick={() => {
                    setRoomActionBannerVisible(false);
                    if (roomActionBanner) void markNotificationRead(roomActionBanner.id);
                  }}
                >
                  Dismiss
                </Button>
              }
            />
          ) : null}
          {!isAdminView && !studentProfile?.full_name && !showStudentForm ? (
            <PremiumAlert
              type="warning"
              title="Complete your profile"
              message="Add your core details so hostel operations can route requests accurately."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-400/40 bg-transparent text-amber-100 hover:bg-amber-500/10"
                  onClick={() => setShowStudentForm(true)}
                >
                  Update profile
                </Button>
              }
            />
          ) : null}

          {/* OVERVIEW SECTION */}
          {activeNav === "overview" && (
            <section id="student-section-overview" className="relative space-y-6">
              {/* Overview focal wash — anchors KPI + grid without changing layout */}
              <div
                className="pointer-events-none absolute left-1/2 top-[-60px] z-0 h-[min(480px,52vh)] w-[min(960px,125%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(129,140,248,0.15)_0%,rgba(59,130,246,0.06)_45%,transparent_70%)] blur-2xl"
                aria-hidden
              />
              <StudentMetricStrip
                roomLabel={roomKpiLabel}
                feeTotalInr={feeSummary.total}
                feeRemainingInr={feeSummary.remaining}
                feePct={feeSummary.pct}
                openComplaints={openComplaints}
                unreadNotifications={unreadCount}
                loadingFees={feeSummary.loading}
              />

              <div className="relative z-[1] grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                  <div className="workspace-surface-panel p-5 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[13px] font-semibold tracking-tight text-slate-100">Activity</h3>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">Recent hostel events for your account</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveNav("notices")}
                        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors duration-150 hover:text-slate-300"
                      >
                        Notices
                      </button>
                    </div>
                    <ActivityTimeline events={activityEvents} />
                  </div>
                </div>
                <div className="space-y-5 lg:col-span-4">
                  <div className="workspace-surface-panel p-5 sm:p-6">
                    <div className="mb-4">
                      <h3 className="text-[13px] font-semibold tracking-tight text-slate-100">Signals</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">Operational snapshot pulled from live data</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.05] py-2.5">
                        <span className="text-[11px] font-medium text-slate-500">Active complaints</span>
                        <span className="text-[13px] font-semibold tabular-nums text-amber-400">{openComplaints}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/[0.05] py-2.5">
                        <span className="text-[11px] font-medium text-slate-500">Fee status</span>
                        <span className={clsx(
                          "text-[13px] font-semibold tracking-tight",
                          feeSummary.pct >= 100 ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {feeSummary.pct >= 100 ? "Cleared" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-[11px] font-medium text-slate-500">Last notice</span>
                        <span className="text-[13px] font-semibold tabular-nums text-slate-200">
                          {notifications[0]
                            ? format(new Date((notifications[0] as { date?: string }).date ?? 0), "MMM d")
                            : "None"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="workspace-surface-panel p-5 sm:p-6">
                    <div className="mb-4">
                      <h3 className="text-[13px] font-semibold tracking-tight text-slate-100">Keyboard</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">Shortcuts for faster navigation</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-500">Command palette</span>
                        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-400 font-sans">⌘ K</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Command menu</span>
                        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-400 font-sans">/</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ROOM SECTION */}
          {activeNav === "room" && (
            <section id="student-section-room" className="space-y-4">
              <div>{renderSectionHeader("Allocation", "Room details", "Live assignment, roommates, and move workflows.")}</div>
              <div className="mt-4">
                <RoomDetailsCard
                  roomNumber={studentProfile?.room_number}
                  roomType={studentProfile?.room_type}
                  floor={studentProfile?.floor}
                  block={studentProfile?.block}
                  viewerProfileId={isAdminView ? studentProfile?.id : undefined}
                  onRoomChangeRequest={() => {
                    if (isAdminView) return;
                    setShowRoomChangeForm(true);
                  }}
                />
              </div>
            </section>
          )}

          {/* FEES SECTION */}
          {activeNav === "fees" && (
            <section id="student-section-fees" className="space-y-4">
              <div>{renderSectionHeader("Ledger", "Fees & settlements", "Track dues, record settlements, and retain receipts.")}</div>
              <div className="mt-4">
                <FeePaymentCard
                  viewerProfileId={isAdminView ? studentProfile?.id : undefined}
                  canPay={!isAdminView}
                />
              </div>

            </section>
          )}

          {/* COMPLAINTS SECTION */}
          {activeNav === "complaints" && (
            <section id="student-section-complaints" className="space-y-4">
              <div>{renderSectionHeader("Care desk", "Complaints", "Track issues with transparent status.")}</div>
              <ComplaintsCard
                complaints={filteredComplaints}
                onNewComplaint={() => {
                  if (isAdminView) return;
                  setShowComplaintForm(true);
                }}
                onViewComplaint={(id) => console.log(`View complaint ${id}`)}
              />
            </section>
          )}

          {/* NOTICES SECTION */}
          {activeNav === "notices" && (
            <section id="student-section-notices" className="space-y-4">
              <div>{renderSectionHeader("Signals", "Notices", "Every hostel update, prioritized.")}</div>
              <NotificationCenter
                notifications={filteredNotifications}
                onNotificationClick={(n) => {
                  setSelectedNotification(n);
                  setShowNotificationDetail(true);
                }}
                onMarkAsRead={(id) => void handleMarkRead(id)}
                onFilterChange={(filter) => console.log(`Filter changed to ${filter}`)}
              />
            </section>
          )}

          {/* QUICK ACTIONS SECTION */}
          {activeNav === "actions" && (
            <section id="student-section-actions" className="space-y-4">
              <div>{renderSectionHeader("Workflows", "Quick actions", "Fast access to common operations.")}</div>
              <QuickActions
                onPayFees={() => {
                  if (isAdminView) return;
                  setActiveNav("fees");
                  // Workspace switch only (no scrollIntoView)
                  

                }}
                onSubmitComplaint={() => {
                  if (isAdminView) return;
                  setShowComplaintForm(true);
                }}
                onRequestRoomChange={() => {
                  if (isAdminView) return;
                  setShowRoomChangeForm(true);
                }}
                onUpdateProfile={() => {
                  if (isAdminView) return;
                  setShowStudentForm(true);
                }}
              />
            </section>
          )}
        </motion.div>

        {notificationsLoading ? (
          <div className="pointer-events-none fixed bottom-4 right-4 z-50 rounded-full border border-white/10 bg-slate-950/90 px-3 py-1.5 text-xs text-slate-400 shadow-lg backdrop-blur">
            Syncing notices…
          </div>
        ) : null}
        {notificationsError ? (
          <div className="pointer-events-none fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-red-500/30 bg-red-950/80 px-3 py-2 text-xs text-red-200 shadow-lg backdrop-blur">
            {notificationsError}
          </div>
        ) : null}
      </StudentDashboardShell>

      <RoomChangeForm
        open={showRoomChangeForm}
        onOpenChange={setShowRoomChangeForm}
        onSubmit={(values) => {
          console.log("Room change form submitted:", values);
          setShowRoomChangeForm(false);
        }}
      />

      <ComplaintForm
        open={showComplaintForm}
        onOpenChange={setShowComplaintForm}
        onSubmit={(data) => {
          console.log("Complaint submitted:", data);
          setShowComplaintForm(false);
        }}
      />

      <StudentForm
        open={showStudentForm}
        onOpenChange={setShowStudentForm}
        initialData={getFormattedProfileData()}
        onSubmit={(values) => {
          console.log("Student profile updated:", values);
        }}
      />

      {selectedNotification && (
        <NotificationDetail
          isOpen={showNotificationDetail}
          onOpenChange={setShowNotificationDetail}
          notification={{
            id: selectedNotification.id,
            title: selectedNotification.title,
            description: selectedNotification.message,
            date: selectedNotification.date,
            time: "09:00 AM",
            location: "All Blocks",
            isImportant: selectedNotification.type === "urgent",
          }}
          onMarkAsRead={() => {
            if (!selectedNotification || isAdminView) return;
            void handleMarkRead(selectedNotification.id);
          }}
        />
      )}

      <CommandPalette
        isOpen={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNavigate={navigateToSection}
        onLogout={async () => {
          await logout();
          navigate(isAdminView ? "/admin/login" : "/login");
        }}
        onUpdateProfile={() => setShowStudentForm(true)}
        onRequestRoomChange={() => setShowRoomChangeForm(true)}
        onSubmitComplaint={() => setShowComplaintForm(true)}
        onPayFees={() => setActiveNav("fees")}
      />
    </>
  );
}

