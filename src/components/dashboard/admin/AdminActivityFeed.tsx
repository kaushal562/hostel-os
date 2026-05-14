import React from "react";

// --- AdminActivityFeed ---
// Premium, audit-log-inspired operational feed for admin

interface AdminActivityEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "success" | "info" | "warning" | "danger";
  meta?: string;
}

interface AdminActivityFeedProps {
  events: AdminActivityEvent[];
}

export const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({ events }) => {
  return (
    <div className="glass-card p-4 mb-6">
      <h3 className="text-[13px] font-semibold tracking-tight text-slate-100 mb-3">Operations Feed</h3>
      <ul className="divide-y divide-white/5">
        {events.map((e) => (
          <li key={e.id} className="py-2 flex items-start gap-3">
            <span className={
              "mt-1 w-2 h-2 rounded-full block " +
              (e.status === "success"
                ? "bg-emerald-400"
                : e.status === "warning"
                ? "bg-amber-400"
                : e.status === "danger"
                ? "bg-red-400"
                : "bg-cyan-400")
            } />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-50 text-[13px]">{e.title}</span>
                {e.meta && <span className="ml-2 text-[10px] text-slate-500">{e.meta}</span>}
              </div>
              {e.description && <div className="text-[12px] text-slate-400 mt-0.5">{e.description}</div>}
            </div>
            <span className="text-[10px] text-slate-500 ml-2 whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
