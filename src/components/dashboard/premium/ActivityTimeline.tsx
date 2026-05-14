import React, { useMemo } from "react";
import { Clock, MessageSquare, CreditCard, DoorOpen, Megaphone } from "lucide-react";
import {
  format,
  isToday,
  isYesterday,
  differenceInCalendarDays,
} from "date-fns";
import clsx from "clsx";

interface ActivityEvent {
  id: string;
  type: "complaint" | "fee" | "room" | "notice" | "system";
  status: "success" | "pending" | "error" | "info";
  title: string;
  description?: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
  className?: string;
}

function bucketLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  const days = differenceInCalendarDays(new Date(), date);
  if (days >= 2 && days < 7) return format(date, "EEEE");
  return format(date, "MMM d, yyyy");
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  const groupedEntries = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const map = new Map<string, ActivityEvent[]>();
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
          <p className="text-[13px] font-semibold tracking-tight text-slate-300">No operational events yet</p>
          <p className="mx-auto mt-1.5 max-w-[272px] text-[12px] leading-relaxed text-slate-500">
            Complaints, notices, and ledger activity will populate this stream automatically as hostel workflows
            update.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("space-y-6", className)}>
      {groupedEntries.map(({ label, items }) => (
        <div key={label} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {label}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] via-white/[0.05] to-transparent" />
          </div>

          <ul className="relative space-y-0 border-l border-white/[0.06] pl-4">
            {items.map((event) => (
              <li key={event.id} className="relative pb-5 pl-1 last:pb-0">
                <span
                  className={clsx(
                    "absolute -left-[5px] top-1.5 h-2 w-2 rounded-full border-2 border-[#0f141f] bg-slate-500",
                    event.status === "success" && "bg-slate-400",
                    event.status === "pending" && "bg-amber-600/90",
                    event.status === "error" && "bg-red-500/90",
                  )}
                  aria-hidden
                />
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 text-[13px] font-semibold leading-snug text-slate-100">{event.title}</p>
                    <time
                      dateTime={event.timestamp}
                      className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500"
                    >
                      {format(new Date(event.timestamp), "HH:mm")}
                    </time>
                  </div>
                  {event.description ? (
                    <p className="line-clamp-2 text-[12px] leading-relaxed text-slate-500">{event.description}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      <EventIcon type={event.type} className="h-3 w-3 text-slate-600" />
                      {event.type === "fee" ? "ledger" : event.type === "notice" ? "broadcast" : event.type}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span
                      className={clsx(
                        "text-[10px] font-medium uppercase tracking-wider text-slate-500",
                        event.status === "pending" && "text-amber-500/80",
                        event.status === "error" && "text-red-400/80",
                        event.status === "success" && "text-emerald-500/75",
                      )}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function EventIcon({ type, className }: { type: ActivityEvent["type"]; className?: string }) {
  const sw = 1.75;
  switch (type) {
    case "complaint":
      return <MessageSquare className={className} strokeWidth={sw} />;
    case "fee":
      return <CreditCard className={className} strokeWidth={sw} />;
    case "room":
      return <DoorOpen className={className} strokeWidth={sw} />;
    case "notice":
      return <Megaphone className={className} strokeWidth={sw} />;
    default:
      return <Clock className={className} strokeWidth={sw} />;
  }
}
