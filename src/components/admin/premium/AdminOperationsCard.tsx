import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface AdminOperationsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  loading?: boolean;
  error?: string;
}

export function AdminOperationsCard({
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  actionButton,
  loading = false,
  error,
}: AdminOperationsCardProps) {
  return (
    <motion.div
      className={clsx(
        "group relative rounded-[1.25rem] border border-white/[0.06] bg-slate-950/[0.38] transition-colors duration-150 hover:border-white/[0.09]",
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      {/* Header */}
      <div className="relative z-10 border-b border-white/[0.05] px-5 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-semibold tracking-tight text-slate-100 truncate">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                {description}
              </p>
            )}
          </div>
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className={clsx(
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 whitespace-nowrap",
                actionButton.variant === "primary"
                  ? "bg-indigo-500/[0.2] text-indigo-100 hover:bg-indigo-500/[0.3] border border-indigo-400/20 hover:border-indigo-400/30"
                  : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12]",
              )}
            >
              {actionButton.label}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={clsx(
          "relative z-10 px-5 py-4 text-[13px] leading-snug",
          contentClassName,
        )}
      >
        {error ? (
          <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/[0.08] px-4 py-3">
            <div className="flex h-2 w-2 rounded-full bg-rose-400" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.1s" }} />
              <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
            </div>
            <span className="text-xs text-slate-500">Loading...</span>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {footer && !error && !loading && (
        <div className="relative z-10 border-t border-white/[0.05] px-5 py-3 bg-white/[0.01]">
          <div className="text-xs text-slate-500">{footer}</div>
        </div>
      )}
    </motion.div>
  );
}

// Premium table cell styling — enterprise operational density
export const AdminTableClasses = {
  container: "overflow-x-auto rounded-[1.25rem] border border-white/[0.06] bg-slate-950/[0.38] backdrop-blur-sm",
  table: "w-full text-[13px] border-collapse",
  thead: "border-b border-white/[0.08] bg-white/[0.04]",
  th: "px-5 py-3 text-left text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] select-none",
  tbody: "divide-y divide-white/[0.04]",
  td: "px-5 py-3.5 align-middle text-slate-100 font-medium",
  tr: "transition-colors duration-150 hover:bg-white/[0.035] group/row",
  // Specific semantic overrides — AGGRESSIVE CONTRAST for operational scanning
  primaryText: "text-slate-50 font-bold group-hover/row:text-white transition-colors duration-100", // Names/Main Titles — maximum contrast
  monoText: "font-mono text-[11px] text-slate-400 uppercase tracking-tighter",      // IDs/Hashes — metadata contrast
  secondaryText: "text-slate-300 font-medium",                                      // Metadata — raised for clarity

  badge: {
    pending: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20",
    completed: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    error: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20",
    info: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20",
  },
};
