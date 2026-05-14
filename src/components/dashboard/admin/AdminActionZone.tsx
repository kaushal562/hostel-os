import React from "react";

// --- AdminActionZone ---
// Premium operational quick actions for admin

interface AdminAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  accent?: "primary" | "success" | "warning" | "danger" | "info";
}

interface AdminActionZoneProps {
  actions: AdminAction[];
}

export const AdminActionZone: React.FC<AdminActionZoneProps> = ({ actions }) => {
  return (
    <div className="glass-card p-4 flex flex-wrap gap-3 items-center justify-start mb-6">
      {actions.map((action, i) => (
        <button
          key={i}
          type="button"
          className={
            "premium-btn px-4 py-2 rounded-md font-semibold text-sm transition focus:outline-none " +
            (action.accent === "success"
              ? "bg-emerald-700/80 hover:bg-emerald-600/90 text-emerald-50"
              : action.accent === "warning"
              ? "bg-amber-700/80 hover:bg-amber-600/90 text-amber-50"
              : action.accent === "danger"
              ? "bg-red-700/80 hover:bg-red-600/90 text-red-50"
              : action.accent === "info"
              ? "bg-cyan-700/80 hover:bg-cyan-600/90 text-cyan-50"
              : "bg-indigo-700/80 hover:bg-indigo-600/90 text-indigo-50")
          }
          onClick={action.onClick}
        >
          {action.icon && <span className="mr-2 align-middle">{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );
};
