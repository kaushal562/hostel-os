import React from "react";
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  MessageSquareWarning,
  IndianRupee,
  Megaphone,
  FileBarChart2,
  BarChart3,
  ServerCog,
  Settings,
} from "lucide-react";
import clsx from "clsx";
import UserAvatar from "@/components/ui/UserAvatar";

export type AdminNavId =
  | "overview"
  | "students"
  | "rooms"
  | "complaints"
  | "fees"
  | "notices"
  | "reports"
  | "analytics"
  | "system"
  | "settings";

const NAV: Array<{ id: AdminNavId; label: string; icon: React.ElementType }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "complaints", label: "Complaints", icon: MessageSquareWarning },
  { id: "fees", label: "Fees", icon: IndianRupee },
  { id: "notices", label: "Notices", icon: Megaphone },
  { id: "reports", label: "Reports", icon: FileBarChart2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "system", label: "System Logs", icon: ServerCog },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AdminWorkspaceShell({
  activeNav,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileOpenChange,
  adminName,
  profilePicture,
  topSlot,
  children,
}: {
  activeNav: AdminNavId;
  onNavigate: (id: AdminNavId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  adminName: string;
  profilePicture?: string | null;
  topSlot: React.ReactNode;
  children: React.ReactNode;
}) {
  // --- Sidebar and layout logic mirrors StudentWorkspaceShell, but denser and more operational ---
  // ...existing code structure, adapted for admin...
  return (
    <div>
      {/* TODO: Implement admin shell layout, mirroring student shell but with admin nav and density */}
      {children}
    </div>
  );
}
