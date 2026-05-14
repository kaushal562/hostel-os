import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  DoorOpen,
  IndianRupee,
  MessageSquareWarning,
  Wallet,
} from "lucide-react";
import clsx from "clsx";
import { TRANSITIONS } from "@/lib/premium-motion";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function MetricTile({
  label,
  valueNode,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  valueNode: React.ReactNode;
  hint?: string;
  icon: React.ElementType;
  accent: "cyan" | "violet" | "emerald" | "amber" | "rose";
}) {
  const accents = {
    cyan: "from-sky-500/[0.14] via-indigo-950/[0.12] to-slate-950/[0.2]",
    violet: "from-violet-500/[0.13] via-indigo-950/[0.14] to-slate-950/[0.18]",
    emerald: "from-teal-500/[0.1] via-emerald-950/20 to-slate-950/[0.2]",
    amber: "from-amber-500/[0.11] via-orange-950/18 to-slate-950/[0.2]",
    rose: "from-rose-500/[0.1] via-fuchsia-950/15 to-slate-950/[0.18]",
  } as const;

  const iconShell = {
    cyan: "border-sky-400/18 bg-gradient-to-br from-sky-400/12 to-cyan-900/25 text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_26px_-10px_rgba(56,189,248,0.14)]",
    violet:
      "border-violet-400/18 bg-gradient-to-br from-violet-400/12 to-indigo-900/25 text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_26px_-10px_rgba(139,92,246,0.13)]",
    emerald:
      "border-teal-400/16 bg-gradient-to-br from-emerald-400/11 to-teal-900/25 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_24px_-10px_rgba(52,211,153,0.12)]",
    amber:
      "border-amber-400/17 bg-gradient-to-br from-amber-400/11 to-orange-900/22 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_24px_-10px_rgba(251,191,36,0.11)]",
    rose: "border-rose-400/16 bg-gradient-to-br from-rose-400/11 to-fuchsia-900/22 text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_24px_-10px_rgba(244,114,182,0.1)]",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={TRANSITIONS.workspaceSection}
      className="workspace-surface-panel group relative overflow-hidden p-5"
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-[0.82] transition-opacity duration-300 group-hover:opacity-[0.94] bg-gradient-to-br",
          accents[accent],
        )}
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-50 sm:text-[1.875rem] sm:leading-snug">
            {valueNode}
          </div>
          {hint ? <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{hint}</p> : null}
        </div>
        <div
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            iconShell[accent],
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-85" />
    </motion.div>
  );
}

export function StudentMetricStrip({
  roomLabel,
  feeTotalInr,
  feeRemainingInr,
  feePct,
  openComplaints,
  unreadNotifications,
  loadingFees,
}: {
  roomLabel: string;
  feeTotalInr: number;
  feeRemainingInr: number;
  feePct: number;
  openComplaints: number;
  unreadNotifications: number;
  loadingFees: boolean;
}) {
  const animTotal = useAnimatedNumber(feeTotalInr, { durationMs: 950 });
  const animDue = useAnimatedNumber(feeRemainingInr, { durationMs: 950 });
  const animComplaints = useAnimatedNumber(openComplaints, { durationMs: 700 });
  const animUnread = useAnimatedNumber(unreadNotifications, { durationMs: 700 });

  const feeHint = useMemo(() => {
    if (loadingFees) return "Syncing fee ledger…";
    if (!feeTotalInr && !feeRemainingInr) return "No fee records yet";
    if (feeRemainingInr <= 0) return "Settlement complete";
    return `${Math.round(feePct)}% cleared overall`;
  }, [feeRemainingInr, feePct, feeTotalInr, loadingFees]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        label="Room assignment"
        valueNode={<span className="font-mono tracking-tight">{roomLabel}</span>}
        hint="Live allocation"
        icon={DoorOpen}
        accent="cyan"
      />
      <MetricTile
        label="Fee exposure"
        valueNode={
          loadingFees ? (
            <span className="text-lg font-medium text-slate-400">…</span>
          ) : (
            formatINR(animTotal)
          )
        }
        hint={feeHint}
        icon={IndianRupee}
        accent="violet"
      />
      <MetricTile
        label="Due now"
        valueNode={
          loadingFees ? (
            <span className="text-lg font-medium text-slate-400">…</span>
          ) : (
            formatINR(animDue)
          )
        }
        hint={
          loadingFees
            ? " "
            : feeRemainingInr > 0
              ? "Prioritize before due date"
              : "No outstanding balance"
        }
        icon={Wallet}
        accent="amber"
      />
      <MetricTile
        label="Operations"
        valueNode={
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl sm:text-2xl">
            <span className="font-mono">{animComplaints}</span>
            <span className="text-[13px] font-medium text-slate-500">complaints</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono">{animUnread}</span>
            <span className="text-[13px] font-medium text-slate-500">unread</span>
          </span>
        }
        hint="Signal queue across hostel workflows"
        icon={openComplaints > 0 ? MessageSquareWarning : Bell}
        accent="rose"
      />
    </div>
  );
}
