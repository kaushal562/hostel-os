import React, { useMemo } from "react";
import {
  Clock,
  MessageSquare,
  CreditCard,
  DoorOpen,
  Megaphone,
  Users,
  AlertCircle,
} from "lucide-react";
import {
  format,
  isToday,
  isYesterday,
  differenceInCalendarDays,
} from "date-fns";
import clsx from "clsx";
import { motion } from "framer-motion";
import { TRANSITIONS } from "@/lib/premium-motion";

interface AdminActivityEvent {
  id: string;
  type: "complaint" | "fee" | "room" | "notice" | "registration" | "maintenance" | "system";
  status: "success" | "pending" | "error" | "info" | "warning";
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, any>;
}

interface AdminActivityFeedProps {
  events: AdminActivityEvent[];
  className?: string;
  maxHeight?: string;
  compact?: boolean;
}

function bucketLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  const days = differenceInCalendarDays(new Date(), date);
  if (days >= 2 && days < 7) return format(date, "EEEE");
  return format(date, "MMM d, yyyy");
}

function getEventIcon(type: string) {
  const icons = {
    complaint: MessageSquare,
    fee: CreditCard,
    room: DoorOpen,
    notice: Megaphone,
    registration: Users,
    maintenance: AlertCircle,
    system: Clock,
  } as const;
  return icons[type as keyof typeof icons] || Clock;
}

function getStatusStyles(
  status: "success" | "pending" | "error" | "info" | "warning",
) {
  const styles = {
    success: {
      dot: "bg-emerald-400/60",
      text: "text-slate-100",
      bg: "bg-emerald-500/[0.08]",
      border: "border-emerald-400/20",
    },
    pending: {
      dot: "bg-amber-400/60",
      text: "text-slate-100",
      bg: "bg-amber-500/[0.08]",
      border: "border-amber-400/20",
    },
    error: {
      dot: "bg-rose-400/60",
      text: "text-slate-100",
      bg: "bg-rose-500/[0.08]",
      border: "border-rose-400/20",
    },
    info: {
      dot: "bg-sky-400/60",
      text: "text-slate-100",
      bg: "bg-sky-500/[0.08]",
      border: "border-sky-400/20",
    },
    warning: {
      dot: "bg-orange-400/60",
      text: "text-slate-100",
      bg: "bg-orange-500/[0.08]",
      border: "border-orange-400/20",
    },
  };
  return styles[status];
}

export function AdminActivityFeed({
  events,
  className,
  maxHeight = "max-h-[480px]",
  compact = false,
}: AdminActivityFeedProps) {
  const groupedEntries = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const map = new Map<string, AdminActivityEvent[]>();
    for (const ev of sorted) {
      const d = new Date(ev.timestamp);
      const key = format(d, "yyyy-MM-dd");
      const label = bucketLabel(d);
      const composite = `${key}::${label}`;
      const list = map.get(composite) ?? [];
      list.push(ev);
      map.set(composite, list);
    }
    return Array.from(map.entries()).map(([k, items]) => {
      const [, label] = k.split("::");
      return { label, items };
    });
  }, [events]);

  if (events.length === 0) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-12 text-center",
          className,
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <Clock className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-tight text-slate-200">
            No operational events
          </p>
          <p className="mx-auto mt-1.5 max-w-[272px] text-[12px] leading-relaxed text-slate-500">
            Complaints, notices, fee updates, and system activity will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "space-y-6 overflow-y-auto custom-scrollbar",
        maxHeight,
        className,
      )}
    >
      {groupedEntries.map(({ label, items }) => (
        <motion.div
          key={label}
          className="space-y-2"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TRANSITIONS.operational}
        >
          {/* Date bucket label */}
          <div className="px-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              {label}
            </p>
          </div>

          {/* Events for this bucket */}
          <div className="space-y-1">
            {items.map((event, idx) => {
              const Icon = getEventIcon(event.type);
              const statusStyle = getStatusStyles(event.status);

              return (
                <motion.div
                  key={event.id}
                  className={clsx(
                    "group relative rounded-lg border px-3.5 py-3 transition-colors duration-150 hover:bg-white/[0.04]",
                    statusStyle.border,
                    statusStyle.bg,
                  )}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...TRANSITIONS.operational, delay: idx * 0.02 }}
                >
                  <div className="flex items-start gap-3">
                    {/* Timeline dot & connector */}
                    <div className="relative flex flex-col items-center pt-1">
                      <div
                        className={clsx(
                          "h-2 w-2 rounded-full ring-2 ring-offset-2 ring-offset-[#0a1224]",
                          statusStyle.dot,
                        )}
                        aria-hidden
                      />
                      {idx < items.length - 1 && (
                        <div className="mt-1.5 w-0.5 flex-1 bg-white/[0.05]" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <div
                            className={clsx(
                              "mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border flex-shrink-0",
                              statusStyle.border,
                              statusStyle.bg,
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className={clsx("text-xs font-semibold truncate", statusStyle.text)}>
                              {event.title}
                            </p>
                            {event.description && (
                              <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            {event.actor && (
                              <p className="mt-1 text-[11px] text-slate-400">
                                by <span className="text-slate-100 font-bold">{event.actor}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Timestamp */}
                        {!compact && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                              {format(new Date(event.timestamp), "HH:mm")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
