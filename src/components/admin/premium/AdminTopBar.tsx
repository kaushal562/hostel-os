import React from "react";
import {
  Menu,
  Bell,
  Search,
  Command,
} from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { TRANSITIONS } from "@/lib/premium-motion";

interface AdminTopBarProps {
  adminName: string;
  notificationCount?: number;
  onMobileMenuOpen: () => void;
  onCommandPaletteOpen?: () => void;
  onNotificationsOpen?: () => void;
}

export function AdminTopBar({
  adminName,
  notificationCount = 0,
  onMobileMenuOpen,
  onCommandPaletteOpen,
  onNotificationsOpen,
}: AdminTopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
      {/* Left: Mobile menu + Title */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <motion.button
          type="button"
          onClick={onMobileMenuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors lg:hidden hover:bg-white/[0.06]"
          whileHover={{ scale: 1.05 }}
          transition={TRANSITIONS.operational}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" strokeWidth={1.8} />
        </motion.button>

        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-100 truncate">
            Control Center
          </h1>
          <p className="text-xs text-slate-500">Welcome back, {adminName}</p>
        </div>
      </div>

      {/* Right: Search, Command, Notifications */}
      <div className="flex items-center gap-2">
        {/* Command palette trigger */}
        <motion.button
          type="button"
          onClick={() => onCommandPaletteOpen?.()}
          className="hidden md:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
          whileHover={{ scale: 1.02 }}
          transition={TRANSITIONS.operational}
        >
          <Command className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span>Quick nav</span>
          <span className="text-[10px] text-slate-600">Cmd K</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          type="button"
          onClick={onNotificationsOpen}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.06]"
          whileHover={{ scale: 1.05 }}
          transition={TRANSITIONS.operational}
          aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount})` : ""}`}
        >
          <Bell className="h-4 w-4" strokeWidth={1.8} />
          {notificationCount > 0 && (
            <motion.span
              className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 text-[10px] font-bold text-slate-950"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={TRANSITIONS.snappy}
            >
              {notificationCount > 9 ? "9+" : notificationCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
