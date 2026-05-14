import React from "react";

// --- AdminDataTable ---
// Premium, dense, glassmorphic data table for admin

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
}

interface AdminDataTableProps {
  columns: Column[];
  data: Array<Record<string, React.ReactNode>>;
  title?: string;
}

export const AdminDataTable: React.FC<AdminDataTableProps> = ({ columns, data, title }) => {
  return (
    <div className="glass-card p-4 mb-6 overflow-x-auto">
      {title && <h3 className="text-[13px] font-semibold tracking-tight text-slate-100 mb-3">{title}</h3>}
      <table className="min-w-full text-[13px] text-slate-200">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={
                  "px-3 py-2 font-semibold text-slate-400 text-left border-b border-white/10 " +
                  (col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left")
                }
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="transition hover:bg-white/3 border-b border-white/5 last:border-b-0"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={
                    "px-3 py-2 " +
                    (col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left")
                  }
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
