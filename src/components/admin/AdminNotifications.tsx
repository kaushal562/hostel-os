import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { adminVisual } from "./premium/admin-visual-system";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send, Bell, Users, User, CheckCircle, AlertCircle, Info, AlertTriangle, Clock } from "lucide-react";
import { NotificationType } from "@/components/dashboard/NotificationTypes";

type TargetMode = { type: "broadcast" } | { type: "user"; userId: string };

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at?: string | null;
  user_id?: string | null;
};

type StudentProfileLite = { id: string; full_name: string | null; role: string | null };

const NOTIFICATION_TYPES: NotificationType[] = ["info", "warning", "urgent"];

const typeBadgeVariant = (type: NotificationType) => {
  switch (type) {
    case "urgent":
      return "destructive" as const;
    case "warning":
      return "secondary" as const;
    case "info":
    default:
      return "default" as const;
  }
};

const typeIcon = (type: NotificationType) => {
  switch (type) {
    case "urgent":
      return <AlertTriangle className="h-4 w-4" />;
    case "warning":
      return <AlertCircle className="h-4 w-4" />;
    case "info":
    default:
      return <Info className="h-4 w-4" />;
  }
};

const formatTime = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

const AdminNotifications: React.FC = () => {
  const { toast } = useToast();

  const [adminUsers, setAdminUsers] = useState<StudentProfileLite[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("info");
  const [targetMode, setTargetMode] = useState<TargetMode>({ type: "broadcast" });

  const [sending, setSending] = useState(false);
  const [recent, setRecent] = useState<NotificationRow[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  // Temporary console logs for state tracking
  useEffect(() => {
    console.log("[AdminNotifications] State Update:", {
      studentCount: adminUsers.length,
      fetchedStudents: adminUsers,
      selectedTargetMode: targetMode
    });
  }, [adminUsers, targetMode]);

  const unreadCountBadge = useMemo(() => {
    // Not used in admin UI, but useful for future.
    return recent.filter((n) => !n.is_read).length;
  }, [recent]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      // Log the exact Supabase response as requested
      const exactResponse = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
      console.log("[AdminNotifications] EXACT SUPABASE RESPONSE for .eq('role', 'student'):", exactResponse);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .order("full_name", { ascending: true })
        .limit(2000);

      console.log("[AdminNotifications] ALL PROFILES FETCHED:", data);
      console.log("[AdminNotifications] Supabase fetch error (if any):", error);

      if (error) throw error;

      // Robust local filtering for 'student' role AND non-empty full_name
      const students = (data || []).filter(u => {
        const r = ((u as any).role || "").toLowerCase().trim();
        const isStudent = r === "student" || r.includes("student");
        const hasName = u.full_name && u.full_name.trim().length > 0;
        return isStudent && hasName;
      });

      console.log("[AdminNotifications] LOCALLY FILTERED STUDENTS:", students);

      // Ensure frontend state matches backend query exactly.
      setAdminUsers(students.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        role: (u as any).role ?? null,
      })));

      console.log("[AdminNotifications] adminUsers roles distribution:", {
        total: students.length,
        uniqueRoles: Array.from(new Set(students.map((r: any) => r.role))),
      });
      
    } catch (e: any) {
      console.error("fetchUsers error:", e);
      toast({
        variant: "destructive",
        title: "Failed to load students",
        description: e?.message || "Unable to fetch student list",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRecent = async () => {
    try {
      setLoadingRecent(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("id,title,message,type,is_read,created_at")
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      setRecent((data || []).map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        is_read: !!n.is_read,
        created_at: n.created_at,
      })));
    } catch (e: any) {
      console.error("fetchRecent error:", e);
      toast({
        variant: "destructive",
        title: "Failed to load recent notifications",
        description: e?.message || "Unable to fetch notifications",
      });
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRecent();

    const sub = supabase
      .channel("admin-notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchRecent();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const t = title.trim();
    const m = message.trim();
    if (!t) return { ok: false, reason: "Title is required" };
    if (!m) return { ok: false, reason: "Message is required" };
    if (t.length > 120) return { ok: false, reason: "Title must be <= 120 characters" };
    if (m.length > 2000)
      return { ok: false, reason: "Message must be <= 2000 characters" };
    return { ok: true as const };
  };

  const handleSend = async () => {
    const v = validate();
    if (!v.ok) {
      toast({ 
        variant: "destructive", 
        title: "Invalid input", 
        description: v.reason,
        duration: 3000,
      });
      return;
    }

    try {
      setSending(true);

      const cleanTitle = title.trim();
      const cleanMessage = message.trim();

      // Debug: Check current auth user and admin status
      const { data: { user } } = await supabase.auth.getUser();
      let isAdminResult = null;
      try {
        const rpcRes = await supabase.rpc('is_admin');
        isAdminResult = rpcRes.data;
      } catch (err) {
        console.warn("Could not call is_admin RPC:", err);
      }

      console.log("[AdminNotifications] DEBUG SEND PRE-CHECK:", {
        currentAuthUid: user?.id,
        isAdminRpcResult: isAdminResult,
        targetMode: targetMode,
      });

      if (targetMode.type === "broadcast") {
        // Create one notification per student to keep RLS simple and enable per-user mark-as-read.
        const userIds = adminUsers.map((u) => u.id);
        if (userIds.length === 0) {
          toast({
            variant: "destructive",
            title: "No students found",
            description: "Broadcast requires student profiles to be present.",
            duration: 3000,
          });
          return;
        }

        const rows = userIds.map((userId) => ({
          title: cleanTitle,
          message: cleanMessage,
          type,
          is_read: false,
          user_id: userId,
        }));

        console.log("[AdminNotifications] DEBUG INSERT PAYLOAD (Broadcast):", rows);

        const insertResponse = await supabase.from("notifications").insert(rows);
        console.log("[AdminNotifications] DEBUG INSERT RESPONSE:", insertResponse);

        if (insertResponse.error) throw insertResponse.error;

        // Show success toast
        toast({
          title: "Success! ✓",
          description: `Notification sent to ${userIds.length} students`,
          duration: 4000,
          className: "bg-green-50 border-green-200",
        });
      } else {
        if (!targetMode.userId) {
          toast({
            variant: "destructive",
            title: "Select a user",
            description: "Choose a student to send this notification to.",
            duration: 3000,
          });
          return;
        }

        const payload = {
          title: cleanTitle,
          message: cleanMessage,
          type,
          is_read: false,
          user_id: targetMode.userId,
        };

        console.log("[AdminNotifications] DEBUG INSERT PAYLOAD (Single User):", payload);

        const insertResponse = await supabase.from("notifications").insert(payload);
        console.log("[AdminNotifications] DEBUG INSERT RESPONSE:", insertResponse);

        if (insertResponse.error) throw insertResponse.error;

        // Show success toast
        const student = adminUsers.find((u) => u.id === targetMode.userId);
        const studentName = student?.full_name || "student";
        const studentRole = student?.role;

        console.log("[AdminNotifications] send user debug:", {
          targetUserId: targetMode.userId,
          resolvedName: studentName,
          resolvedRole: studentRole,
        });

        toast({
          title: "Success! ✓",
          description: `Notification sent to ${studentName}`,
          duration: 4000,
          className: "bg-green-50 border-green-200",
        });
      }

      // Clear form after successful send
      setTitle("");
      setMessage("");
      setType("info");
      setTargetMode({ type: "broadcast" });
      setSelectedUserId("");

      // Refresh recent notifications
      await fetchRecent();
    } catch (e: any) {
      console.error("handleSend error:", e);
      
      // Check if it's an RLS policy error
      const message = e?.message || "Unexpected error";
      const isRLSError = message.includes("row level security");
      
      toast({
        variant: "destructive",
        title: isRLSError ? "RLS Policy Error" : "Failed to send notification",
        description: isRLSError 
          ? "Admin doesn't have permission to send notifications. Verify admin profile role is set to 'admin'."
          : message,
        duration: 5000,
      });
    } finally {
      setSending(false);
    }
  };

  const chipActive =
    "border-indigo-400/35 bg-indigo-500/[0.12] text-indigo-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
  const chipIdle =
    "border-white/[0.08] bg-slate-950/40 text-slate-300 hover:border-white/[0.12] hover:bg-white/[0.04]";

  return (
    <div className={clsx(adminVisual.sectionStack, "w-full")}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className={clsx(adminVisual.primaryPanel, "p-5 sm:p-6")}>
            <div className="mb-5 flex items-center gap-2 border-b border-white/[0.06] pb-4">
              <Bell className="h-4 w-4 text-indigo-300/90" strokeWidth={1.75} />
              <h3 className="text-[13px] font-semibold tracking-tight text-slate-100">Compose</h3>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Primary</span>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className={adminVisual.labelEyebrow}>Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Hostel maintenance notice"
                  disabled={sending || usersLoading}
                  className="h-10 border-white/[0.08] bg-slate-950/50 text-sm text-slate-100 placeholder:text-slate-600"
                  maxLength={120}
                />
                <p className="text-[11px] text-slate-500">{title.length}/120</p>
              </div>

              <div className="space-y-2">
                <label className={adminVisual.labelEyebrow}>Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Operational detail students must see..."
                  disabled={sending}
                  className="min-h-[96px] resize-none border-white/[0.08] bg-slate-950/50 text-sm text-slate-100 placeholder:text-slate-600"
                  maxLength={2000}
                />
                <p className="text-[11px] text-slate-500">{message.length}/2000</p>
              </div>

              <div className="space-y-3">
                <label className={adminVisual.labelEyebrow}>Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {NOTIFICATION_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      disabled={sending}
                      className={clsx(
                        "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors",
                        type === t ? chipActive : chipIdle,
                        sending && "cursor-not-allowed opacity-50",
                      )}
                    >
                      {typeIcon(t)}
                      <span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <label className={adminVisual.labelEyebrow}>Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetMode({ type: "broadcast" });
                      setSelectedUserId("");
                    }}
                    disabled={sending}
                    className={clsx(
                      "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium transition-colors",
                      targetMode.type === "broadcast" ? chipActive : chipIdle,
                      sending && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>All students</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserDialogOpen(true)}
                    disabled={sending}
                    className={clsx(
                      "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium transition-colors",
                      targetMode.type === "user" ? chipActive : chipIdle,
                      sending && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span>Single user</span>
                  </button>
                </div>

                {targetMode.type === "user" && targetMode.userId && (
                  <div className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-500/[0.08] px-4 py-3 text-sm text-indigo-100">
                    <span className="font-medium text-slate-200">Sending to:</span>{" "}
                    {adminUsers.find((u) => u.id === targetMode.userId)?.full_name || "Selected student"}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSend}
                  disabled={sending || usersLoading}
                  className="h-10 w-full font-semibold"
                  size="lg"
                >
                  {sending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send notification
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className={clsx(adminVisual.secondaryPanel, "p-5")}>
            <p className={adminVisual.labelEyebrow}>Audience scale</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[11px] text-slate-500">Students reachable</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-100">{adminUsers.length}</p>
              </div>
              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[11px] text-slate-500">Recent feed items</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-100">{recent.length}</p>
              </div>
            </div>
          </div>

          <div className={clsx(adminVisual.tertiaryPanel, "p-4 text-xs leading-relaxed text-slate-500")}>
            <p className={clsx(adminVisual.labelEyebrow, "mb-2")}>Operational notes</p>
            <ul className="space-y-2">
              <li>Use urgent sparingly — it elevates banner priority.</li>
              <li>Broadcast fans out to all indexed students in one commit.</li>
              <li>Verify delivery in the recent queue below.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={adminVisual.labelEyebrow}>Verification queue</p>
            <p className="text-sm font-medium text-slate-200">Recent notifications</p>
          </div>
          {loadingRecent ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : null}
        </div>

        {loadingRecent ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-slate-500" />
              <p className="text-sm text-slate-500">Loading notifications…</p>
            </div>
          </div>
        ) : recent.length === 0 ? (
          <div
            className={clsx(
              adminVisual.secondaryPanel,
              "flex flex-col items-center justify-center border-dashed py-12 text-center",
            )}
          >
            <div className="mb-3 rounded-full border border-white/[0.08] bg-slate-950/60 p-3">
              <Bell className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">No notifications yet</p>
            <p className="mt-1 max-w-sm text-xs text-slate-500">Send your first announcement — it will appear here for audit.</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {recent.map((n) => (
              <div
                key={n.id}
                className={clsx(
                  adminVisual.secondaryPanel,
                  "flex gap-4 p-4 transition-colors hover:border-white/[0.09]",
                )}
              >
                <div className="flex-shrink-0 pt-0.5">
                  <div
                    className={clsx(
                      "rounded-lg border p-2",
                      n.type === "urgent"
                        ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-200"
                        : n.type === "warning"
                          ? "border-amber-400/20 bg-amber-500/[0.08] text-amber-200"
                          : "border-sky-400/20 bg-sky-500/[0.08] text-sky-200",
                    )}
                  >
                    {typeIcon(n.type)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4 className="truncate font-medium text-slate-100">{n.title}</h4>
                    <Badge
                      variant={typeBadgeVariant(n.type)}
                      className="shrink-0 border-white/[0.08] bg-slate-950/60 capitalize text-[10px] text-slate-200"
                    >
                      {n.type}
                    </Badge>
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm text-slate-400">{n.message}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(n.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      {n.user_id && adminUsers.length > 1 ? (
                        <>
                          <User className="h-3 w-3" />
                          <span>{adminUsers.find((u) => u.id === n.user_id)?.full_name || "Single student"}</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-3 w-3" />
                          <span>Broadcast</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md border-white/[0.08] bg-[#0c1428] text-slate-100">
          <DialogHeader>
            <DialogTitle>Select Student</DialogTitle>
            <DialogDescription>Choose a single student to send this notification to.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Search by name or ID..."
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={usersLoading}
              className="h-10 border-white/[0.08] bg-slate-950/50 text-slate-100"
            />

            <ScrollArea className="h-[350px] rounded-lg border border-white/[0.08] bg-slate-950/30">
              {usersLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-slate-500" />
                    <p className="text-sm text-slate-500">Loading students...</p>
                  </div>
                </div>
              ) : adminUsers.length === 0 ? (
                <div className="flex h-full items-center justify-center p-4">
                  <p className="text-center text-sm text-slate-500">No students found</p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {adminUsers
                    .filter((u) => {
                      const q = selectedUserId.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        (u.full_name || "").toLowerCase().includes(q) ||
                        u.id.includes(q)
                      );
                    })
                    .map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setTargetMode({ type: "user", userId: u.id });
                          setUserDialogOpen(false);
                        }}
                        disabled={sending}
                        className={clsx(
                          "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                          targetMode.type === "user" && targetMode.userId === u.id
                            ? chipActive
                            : chipIdle,
                          sending && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <p className="font-medium text-slate-100">{u.full_name || "Unnamed Student"}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{u.id}</p>
                      </button>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
            <Button
              variant="outline"
              onClick={() => setUserDialogOpen(false)}
              className="h-9 border-white/[0.08] bg-transparent text-slate-200 hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotifications;

