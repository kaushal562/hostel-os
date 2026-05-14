import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  DoorOpen,
  MessageSquareWarning,
  Megaphone,
  DollarSign,
  BarChart3,
  FileText,
  LogOut,
  Settings,
  X,
  Monitor,
  Eye,
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
  | "system-logs"
  | "settings"
  /** Admin preview of a student workspace — not a student session */
  | "student-preview";

/** Sidebar + command palette — single source of truth for admin workspace destinations */
export const ADMIN_WORKSPACE_NAV: Array<{ id: AdminNavId; label: string; icon: React.ElementType }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "complaints", label: "Complaints", icon: MessageSquareWarning },
  { id: "fees", label: "Fees", icon: DollarSign },
  { id: "notices", label: "Notices", icon: Megaphone },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "student-preview", label: "Student preview", icon: Eye },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "system-logs", label: "System Logs", icon: Monitor },
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
  onLogout,
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
  onLogout: () => void;
}) {
  const railWidth = collapsed ? "w-[72px]" : "w-[260px]";

  const NavButton = ({
    id,
    label,
    icon: Icon,
    onClick,
  }: {
    id: AdminNavId;
    label: string;
    icon: React.ElementType;
    onClick: () => void;
  }) => {
    const active = activeNav === id;
    return (
      <button
        type="button"
        onClick={onClick}
        title={label}
        className={clsx(
          "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
          active
            ? "bg-gradient-to-r from-indigo-500/[0.14] via-violet-500/[0.08] to-transparent text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "text-slate-400 hover:bg-white/[0.055] hover:text-slate-200",
        )}
      >
        {active ? (
          <span
            className="pointer-events-none absolute inset-y-1 left-0 w-0.5 rounded-full bg-gradient-to-b from-indigo-200/50 via-violet-200/40 to-indigo-300/30 shadow-[0_0_18px_-4px_rgba(129,140,248,0.18)]"
            aria-hidden
          />
        ) : null}
        <span
          className={clsx(
            "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
            active
              ? "border-white/[0.11] bg-gradient-to-br from-white/[0.07] to-indigo-500/[0.04] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "border-white/5 bg-white/[0.03] text-slate-400 group-hover:border-white/10 group-hover:text-slate-200",
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        {!collapsed ? (
          <span className="relative z-10 min-w-0 truncate text-sm font-medium tracking-tight">
            {label}
          </span>
        ) : null}
      </button>
    );
  };

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div
        className={clsx(
          "flex items-center gap-2 px-3 pb-6 pt-2",
          collapsed ? "justify-center px-2" : "",
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-indigo-500/[0.05] shadow-[0_12px_40px_-16px_rgba(79,70,229,0.22)]">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-100">HMS</span>
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">Hostel OS</p>
            <p className="truncate text-xs text-slate-500">Admin Control</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2 custom-scrollbar">
        {ADMIN_WORKSPACE_NAV.map((item) => (
          <NavButton
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            onClick={() => {
              onNavigate(item.id);
              onMobileOpenChange(false);
            }}
          />
        ))}
      </nav>

      <div className="border-t border-white/5 space-y-2 p-3">
        <div
          className={clsx(
            "flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2",
            collapsed ? "justify-center p-2" : "",
          )}
        >
          <UserAvatar name={adminName} imageUrl={profilePicture} className="h-9 w-9 shrink-0" />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{adminName}</p>
              <p className="truncate text-xs text-slate-500">Admin</p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className={clsx(
            "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 text-slate-400 hover:bg-red-500/[0.1] hover:text-red-300",
            collapsed ? "justify-center px-3" : "",
          )}
          title="Sign Out"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] transition-colors duration-150 group-hover:border-red-400/20 group-hover:bg-red-500/[0.08]">
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          {!collapsed ? (
            <span className="relative z-10 min-w-0 truncate text-sm font-medium tracking-tight">
              Sign Out
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition-colors duration-150 hover:bg-white/[0.06] lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative flex h-screen min-h-0 flex-col overflow-hidden bg-[#060913] text-slate-100">
      {/* Premium environment — static depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0b1224_0%,#070d18_42%,#050810_100%)]"
        aria-hidden
      />
      {/* Center wash + corner bloom — executive ambient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.98]"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 100% 75% at 50% -10%, rgba(71,92,140,0.36), transparent 54%),
            radial-gradient(ellipse 60% 50% at 100% 0%, rgba(99,102,241,0.16), transparent 50%),
            radial-gradient(ellipse 55% 48% at 0% 100%, rgba(56,189,248,0.13), transparent 48%),
            radial-gradient(ellipse 50% 42% at 100% 100%, rgba(139,92,246,0.14), transparent 46%)
          `,
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_88%_72%_at_50%_42%,transparent_28%,rgba(3,7,18,0.42)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.038]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.065) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.065) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside
          className={clsx(
            "relative hidden h-full shrink-0 overflow-hidden border-r border-white/[0.11] bg-gradient-to-b from-[#080f1f]/99 via-[#070d18]/98 to-[#060a14]/99 backdrop-blur-xl lg:block",
            "shadow-[inset_-1px_0_0_rgba(255,255,255,0.055),inset_-16px_0_56px_-22px_rgba(79,70,229,0.09),-4px_0_48px_-28px_rgba(0,0,0,0.55)]",
            railWidth,
            "transition-[width] duration-200 ease-out",
          )}
        >
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-indigo-300/25 via-violet-400/15 to-transparent opacity-75"
            aria-hidden
          />
          <div className="relative flex h-full flex-col px-2 py-4">{sidebarInner}</div>
        </aside>

        {/* Mobile drawer */}
        <div
          className={clsx(
            "fixed inset-0 z-40 lg:hidden",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <button
            type="button"
            aria-label="Close menu"
            className={clsx(
              "absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200",
              mobileOpen ? "opacity-100" : "opacity-0",
            )}
            onClick={() => onMobileOpenChange(false)}
          />
          <div
            className={clsx(
              "absolute left-0 top-0 h-full w-[280px] border-r border-white/[0.08] bg-gradient-to-b from-[#0e1526] to-[#0a101a] shadow-2xl shadow-black/50 transition-transform duration-200 ease-out",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <p className="text-sm font-semibold">Control Center</p>
              <button
                type="button"
                className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5"
                onClick={() => onMobileOpenChange(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-[calc(100%-52px)] px-2 py-4">{sidebarInner}</div>
          </div>
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-l border-white/[0.06] bg-gradient-to-br from-[#0a1224]/92 via-[#080f1c]/88 to-[#070c14]/92 shadow-[inset_1px_0_0_rgba(255,255,255,0.045)] lg:border-l-0">
          {/* Workspace focal column */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_52%_at_50%_12%,rgba(129,140,248,0.16),transparent_55%),radial-gradient(ellipse_58%_48%_at_50%_85%,rgba(59,130,246,0.1),transparent_52%),radial-gradient(ellipse_45%_38%_at_92%_72%,rgba(99,102,241,0.09),transparent_50%)]"
            aria-hidden
          />
          <header className="relative z-30 shrink-0 border-b border-white/[0.09] bg-[#0c1428]/65 backdrop-blur-2xl">
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.03)_42%,transparent_100%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-90"
              aria-hidden
            />
            <div className="relative">{topSlot}</div>
          </header>

          <main className="custom-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-auto">
            <div className="relative mx-auto flex w-full max-w-[1720px] flex-col px-4 py-5 sm:px-6 lg:px-11 lg:py-7">
              {/* Soft studio light on content rail */}
              <div
                className="pointer-events-none absolute left-1/2 top-[-40px] z-0 h-[min(520px,58vh)] w-[min(1200px,118%)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(147,158,255,0.13)_0%,rgba(59,130,246,0.07)_38%,transparent_68%)] blur-3xl"
                aria-hidden
              />
              <div className="relative z-[1]">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
