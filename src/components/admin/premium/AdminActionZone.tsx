import React from "react";
import {
  Plus,
  DoorOpen,
  Megaphone,
  MessageSquare,
  BarChart3,
  DollarSign,
  LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { TRANSITIONS, STAGGER } from "@/lib/premium-motion";

interface ActionItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface AdminActionZoneProps {
  actions?: ActionItem[];
  onAddStudent?: () => void;
  onAllocateRoom?: () => void;
  onSendNotice?: () => void;
  onReviewComplaints?: () => void;
  onGenerateReports?: () => void;
  onManageFees?: () => void;
  className?: string;
  compact?: boolean;
}

const defaultActions = (props: Partial<AdminActionZoneProps>): ActionItem[] => [
  {
    id: "add-student",
    label: "Add Student",
    description: "Register new student",
    icon: Plus,
    onClick: props.onAddStudent || (() => {}),
    variant: "primary" as const,
  },
  {
    id: "allocate-room",
    label: "Allocate Room",
    description: "Assign room to student",
    icon: DoorOpen,
    onClick: props.onAllocateRoom || (() => {}),
  },
  {
    id: "send-notice",
    label: "Send Notice",
    description: "Broadcast notification",
    icon: Megaphone,
    onClick: props.onSendNotice || (() => {}),
  },
  {
    id: "review-complaints",
    label: "Review Complaints",
    description: "Check pending issues",
    icon: MessageSquare,
    onClick: props.onReviewComplaints || (() => {}),
  },
  {
    id: "generate-reports",
    label: "Generate Report",
    description: "Export analytics",
    icon: BarChart3,
    onClick: props.onGenerateReports || (() => {}),
  },
  {
    id: "manage-fees",
    label: "Manage Fees",
    description: "Fee collection & tracking",
    icon: DollarSign,
    onClick: props.onManageFees || (() => {}),
  },
];

export function AdminActionZone({
  actions,
  onAddStudent,
  onAllocateRoom,
  onSendNotice,
  onReviewComplaints,
  onGenerateReports,
  onManageFees,
  className,
  compact = false,
}: AdminActionZoneProps) {
  const actionList = actions || defaultActions({
    onAddStudent,
    onAllocateRoom,
    onSendNotice,
    onReviewComplaints,
    onGenerateReports,
    onManageFees,
  });

  return (
    <motion.div
      className={clsx(
        "grid gap-3",
        compact
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        className,
      )}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: STAGGER.small,
        },
      }}
      initial="hidden"
      animate="show"
    >
      {actionList.map((action) => (
        <motion.button
          key={action.id}
          type="button"
          onClick={action.onClick}
          className={clsx(
            "group relative rounded-xl border transition-all duration-150 overflow-hidden",
            action.variant === "primary"
              ? "border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.12] via-indigo-950/[0.08] to-slate-950/[0.12] hover:border-indigo-400/30 hover:from-indigo-500/[0.16] hover:via-indigo-950/[0.12]"
              : "border-white/[0.06] bg-gradient-to-br from-slate-950/[0.42] via-indigo-950/[0.08] to-slate-950/[0.15] hover:border-white/[0.1] hover:from-slate-950/[0.48]",
          )}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TRANSITIONS.operational}
          whileHover={{ y: -2 }}
        >
          {/* Accent wash on hover */}
          <div
            className={clsx(
              "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
              action.variant === "primary"
                ? "bg-gradient-to-br from-indigo-500/[0.1] via-indigo-950/[0.05] to-transparent"
                : "bg-gradient-to-br from-indigo-500/[0.08] via-slate-950/[0.04] to-transparent",
            )}
            aria-hidden
          />

          <div className={clsx(
            "relative z-10 flex flex-col items-center justify-center transition-all duration-150",
            compact ? "px-3 py-4" : "px-4 py-5 sm:px-5 sm:py-6",
          )}>
            <div
              className={clsx(
                "mb-3 flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-150",
                action.variant === "primary"
                  ? "border-indigo-400/25 bg-gradient-to-br from-indigo-400/15 to-indigo-900/25 text-indigo-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_24px_-10px_rgba(99,102,241,0.16)] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_32px_-8px_rgba(99,102,241,0.2)]"
                  : "border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-indigo-500/[0.04] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_20px_-10px_rgba(79,70,229,0.1)] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_28px_-8px_rgba(79,70,229,0.12)]",
              )}
            >
              <action.icon
                className={compact ? "h-4 w-4" : "h-5 w-5"}
                strokeWidth={1.8}
              />
            </div>

            <h4 className={clsx(
              "text-center font-semibold text-slate-100 transition-colors group-hover:text-slate-50",
              compact ? "text-xs" : "text-sm",
            )}>
              {action.label}
            </h4>

            {!compact && action.description && (
              <p className="mt-1.5 text-center text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                {action.description}
              </p>
            )}
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
