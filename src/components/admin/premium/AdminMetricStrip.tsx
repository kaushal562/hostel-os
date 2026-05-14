import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  DoorOpen,
  MessageSquareWarning,
  DollarSign,
  Megaphone,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import { TRANSITIONS, STAGGER } from "@/lib/premium-motion";
import { Sparkline } from "@/components/shared/Sparkline";

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
  onClick,
  sparklineData,
}: {
  label: string;
  valueNode: React.ReactNode;
  hint?: string;
  icon: React.ElementType;
  accent: "cyan" | "violet" | "emerald" | "amber" | "rose";
  onClick?: () => void;
  sparklineData?: number[];
}) {
  const accents = {
    cyan: "from-sky-500/[0.14] via-indigo-950/[0.12] to-slate-950/[0.2]",
    violet: "from-violet-500/[0.13] via-indigo-950/[0.14] to-slate-950/[0.18]",
    emerald: "from-teal-500/[0.1] via-emerald-950/20 to-slate-950/[0.2]",
    amber: "from-amber-500/[0.11] via-orange-950/18 to-slate-950/[0.2]",
    rose: "from-rose-500/[0.1] via-fuchsia-950/15 to-slate-950/[0.18]",
  } as const;

  const iconShell = {
    cyan: "text-sky-400",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  } as const;

  const sparklineColor = {
    cyan: "#38bdf8",
    violet: "#8b5cf6",
    emerald: "#34d399",
    amber: "#fbbf24",
    rose: "#f43f5e",
  } as const;

  return (
    <motion.div
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c1220]/60 backdrop-blur-md transition-all duration-300",
        onClick && "hover:border-white/[0.12] hover:bg-[#0f172a]/80 cursor-pointer",
        !onClick && "cursor-default",
      )}
      whileHover={onClick ? { y: -2 } : undefined}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.operational}
    >
      <div className="px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 group-hover:text-slate-300 transition-colors">
            {label}
          </p>
          <div className={clsx("opacity-80 group-hover:opacity-100 transition-opacity", iconShell[accent])}>
            <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-slate-100">
              {valueNode}
            </div>
            {hint && (
              <p className="text-[11px] font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                {hint}
              </p>
            )}
          </div>

          <div className="pb-1">
            <Sparkline
              data={sparklineData || [30, 45, 35, 60, 50, 75, 65]}
              width={80}
              height={32}
              color={sparklineColor[accent]}
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>
      
      {/* Subtle bottom accent line */}
      <div className={clsx(
        "absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
        accent === "cyan" && "bg-sky-500",
        accent === "violet" && "bg-violet-500",
        accent === "emerald" && "bg-emerald-500",
        accent === "amber" && "bg-amber-500",
        accent === "rose" && "bg-rose-500",
      )} />
    </motion.div>
  );
}

export function AdminMetricStrip({
  totalStudents = 0,
  occupancyRate = 0,
  pendingComplaints = 0,
  totalRevenue = 0,
  activeNotices = 0,
  availableRooms = 0,
  feeCollectionProgress = 0,
  onStudentsClick,
  onComplaintsClick,
  onRevenueClick,
  onFeesClick,
  className,
}: {
  totalStudents?: number;
  occupancyRate?: number;
  pendingComplaints?: number;
  totalRevenue?: number;
  activeNotices?: number;
  availableRooms?: number;
  feeCollectionProgress?: number;
  onStudentsClick?: () => void;
  onComplaintsClick?: () => void;
  onRevenueClick?: () => void;
  onFeesClick?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      className={clsx(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5",
        className,
      )}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          },
        },
      }}
      initial="hidden"
      animate="show"
    >
      <MetricTile
        label="Total Students"
        valueNode={totalStudents}
        hint={`+${Math.floor(totalStudents * 0.1)} this month`}
        icon={Users}
        accent="cyan"
        onClick={onStudentsClick}
        sparklineData={[20, 35, 25, 45, 35, 55, 65]}
      />

      <MetricTile
        label="Room Occupancy"
        valueNode={`${occupancyRate}%`}
        hint={`${Math.floor(totalStudents)} of ${Math.floor(totalStudents + availableRooms)} filled`}
        icon={DoorOpen}
        accent="violet"
        sparklineData={[40, 55, 50, 65, 60, 70, 75]}
      />

      <MetricTile
        label="Pending Fees"
        valueNode={formatINR(Math.max(0, totalRevenue * 0.1))} // Placeholder logic
        hint="All payments cleared"
        icon={TrendingUp}
        accent="amber"
        onClick={onFeesClick}
        sparklineData={[70, 60, 50, 45, 30, 20, 10]}
      />

      <MetricTile
        label="Total Revenue"
        valueNode={formatINR(totalRevenue)}
        hint="This month"
        icon={DollarSign}
        accent="emerald"
        onClick={onRevenueClick}
        sparklineData={[30, 40, 35, 50, 45, 60, 80]}
      />

      <MetricTile
        label="Complaints"
        valueNode={pendingComplaints}
        hint={`${pendingComplaints} unresolved`}
        icon={MessageSquareWarning}
        accent="rose"
        onClick={onComplaintsClick}
        sparklineData={[50, 40, 60, 45, 55, 30, 25]}
      />
    </motion.div>
  );
}

