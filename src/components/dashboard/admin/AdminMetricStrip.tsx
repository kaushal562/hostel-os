import React from "react";

// --- AdminMetricStrip ---
// Premium glassmorphic metric strip for admin KPIs
// Use restrained accent, premium density, and executive rhythm

interface AdminMetricStripProps {
  metrics: Array<{
    label: string;
    value: string | number;
    accent?: "primary" | "success" | "warning" | "danger" | "info";
    sublabel?: string;
  }>;
}

export const AdminMetricStrip: React.FC<AdminMetricStripProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
      {metrics.map((m, i) => (
        <div
          key={i}
          className={
            "glass-card px-4 py-3 flex flex-col items-start justify-center min-h-[64px] shadow-sm " +
            (m.accent === "success"
              ? "border-l-2 border-emerald-400/60"
              : m.accent === "warning"
              ? "border-l-2 border-amber-400/60"
              : m.accent === "danger"
              ? "border-l-2 border-red-400/60"
              : m.accent === "info"
              ? "border-l-2 border-cyan-400/60"
              : "border-l-2 border-indigo-400/40")
          }
        >
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">{m.label}</span>
          <span className="text-[1.35rem] font-bold text-slate-50 tabular-nums leading-tight">{m.value}</span>
          {m.sublabel && (
            <span className="text-[10px] text-slate-500 mt-0.5">{m.sublabel}</span>
          )}
        </div>
      ))}
    </div>
  );
};
