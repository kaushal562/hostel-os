import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Command, LogOut, Menu, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserAvatar from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { TRANSITIONS } from "@/lib/premium-motion";
import type { Notification } from "@/components/dashboard/NotificationTypes";

function greetingForHour(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const chromeBtn =
  "rounded-xl border border-white/[0.09] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_40px_-22px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-150";

export function StudentWorkspaceTopBar({
  studentName,
  profilePicture,
  searchQuery,
  onSearchChange,
  unreadCount,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onLogout,
  onUpdateProfile,
  onMenuClick,
  onCommandPalette,
}: {
  studentName: string;
  profilePicture?: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadCount: number;
  notifications: Notification[];
  onNotificationClick: (n: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onLogout: () => void;
  onUpdateProfile: () => void;
  onMenuClick?: () => void;
  onCommandPalette?: () => void;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const greeting = useMemo(() => greetingForHour(now), [now]);

  const timeLabel = useMemo(() => {
    return now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [now]);

  const dateLabel = useMemo(() => {
    return now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, [now]);

  const preview = notifications.slice(0, 6);

  return (
    <div className="relative px-4 py-4 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,transparent_100%)]" aria-hidden />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={TRANSITIONS.workspaceSection}
          className="min-w-0"
        >
          <div className="flex items-start gap-3">
            {onMenuClick ? (
              <button
                type="button"
                className={`mt-0.5 p-2 text-slate-200 hover:bg-white/[0.072] lg:hidden ${chromeBtn}`}
                onClick={onMenuClick}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400/90">
                Workspace
              </p>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-[-0.02em] text-slate-50 sm:text-[1.375rem] sm:leading-tight">
                {greeting},{" "}
                <span className="font-semibold text-slate-100">{studentName}</span>
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span className="text-[12px] tabular-nums leading-none text-slate-400">{dateLabel}</span>
                <span className="hidden text-[12px] leading-none text-slate-600 sm:inline">·</span>
                <span className="text-[12px] tabular-nums leading-none text-slate-500">{timeLabel}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => onCommandPalette?.()}
            className={`flex h-11 w-full items-center gap-2.5 pl-3.5 pr-3 text-left text-[13px] text-slate-400 hover:border-white/[0.13] hover:bg-white/[0.065] sm:w-[320px] lg:w-[380px] ${chromeBtn}`}
          >
            <Command className="h-4 w-4 shrink-0 text-slate-500 opacity-90" strokeWidth={1.75} />
            <span className="flex-1 text-[13px] text-slate-500">Search workspace or run a command…</span>
            <div className="hidden items-center gap-1 sm:flex">
              <kbd className="rounded-md border border-white/[0.1] bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                ⌘
              </kbd>
              <kbd className="rounded-md border border-white/[0.1] bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                K
              </kbd>
            </div>
          </button>

          <div className="flex items-center justify-end gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative h-11 w-11 text-slate-200 hover:bg-white/[0.065] ${chromeBtn}`}
                  aria-label="Notifications"
                >
                  <Bell className="h-[22px] w-[22px]" strokeWidth={1.65} />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-white/12 bg-slate-600/95 px-1 text-[10px] font-semibold tabular-nums text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[380px] border-white/[0.08] bg-slate-950/96 p-0 text-slate-100 shadow-[0_28px_64px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl"
              >
                <div className="workspace-surface-panel-header border-white/[0.06] px-4 py-3.5">
                  <p className="text-[13px] font-semibold tracking-tight text-slate-100">Notifications</p>
                  <p className="mt-1 text-[12px] leading-snug text-slate-500">
                    Latest hostel updates linked to your profile
                  </p>
                </div>
                <div className="max-h-[360px] overflow-auto">
                  {preview.length ? (
                    <div className="divide-y divide-white/[0.05]">
                      {preview.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="w-full px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04]"
                          onClick={() => onNotificationClick(n)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium leading-snug text-slate-100">
                                {n.title}
                              </p>
                              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
                                {n.message}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] tabular-nums text-slate-500">
                              {formatDate(n.date)}
                            </span>
                          </div>
                          {!n.is_read ? (
                            <button
                              type="button"
                              className="mt-2 text-[11px] font-medium text-indigo-200/85 hover:text-indigo-100/95"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(n.id);
                              }}
                            >
                              Mark read
                            </button>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                      <Bell className="h-10 w-10 text-slate-600 opacity-70" strokeWidth={1.25} />
                      <p className="text-[13px] font-medium text-slate-300">Nothing new right now</p>
                      <p className="max-w-[260px] text-[12px] leading-relaxed text-slate-500">
                        Operational notices appear here without noise—check back after admin broadcasts or room
                        decisions.
                      </p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-xl px-2 py-2 pr-3 hover:bg-white/[0.068] ${chromeBtn}`}
                >
                  <UserAvatar name={studentName} imageUrl={profilePicture} className="h-9 w-9 ring-1 ring-white/[0.08]" />
                  <span className="hidden max-w-[140px] truncate text-[13px] font-semibold tracking-tight text-slate-100 sm:block">
                    {studentName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-white/[0.08] bg-slate-950/96 text-slate-100 backdrop-blur-xl shadow-[0_28px_64px_-24px_rgba(0,0,0,0.75)]"
              >
                <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="focus:bg-white/10 focus:text-slate-50"
                  onClick={onUpdateProfile}
                >
                  <User className="mr-2 h-4 w-4 opacity-90" strokeWidth={1.75} />
                  Update profile
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-slate-50">
                  <Settings className="mr-2 h-4 w-4 opacity-90" strokeWidth={1.75} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="text-red-300 focus:bg-red-500/10 focus:text-red-100"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4 opacity-90" strokeWidth={1.75} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
