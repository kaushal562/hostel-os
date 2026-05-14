import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import { Search, ArrowRight } from "lucide-react";
import clsx from "clsx";
import AdminShellLayout from "./AdminShellLayout";
import { AdminPageHero } from "./premium/AdminPageHero";
import { AdminTableClasses } from "./premium/AdminOperationsCard";
import { adminVisual } from "./premium/admin-visual-system";

type StudentRow = {
  id: string;
  full_name: string | null;
  student_id: string | null;
  room_number: string | null;
  role: string | null;
  profile_picture?: string | null;
};

export default function StudentDashboardSelector() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.full_name || "").toLowerCase();
      const sid = (s.student_id || "").toLowerCase();
      const room = (s.room_number || "").toLowerCase();
      return name.includes(q) || sid.includes(q) || room.includes(q);
    });
  }, [query, students]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) {
          navigate("/admin/login", { replace: true });
          return;
        }

        const { data, error: studentsError } = await supabase
          .from("profiles")
          .select("id, full_name, student_id, room_number, role, profile_picture")
          .eq("role", "student")
          .order("full_name", { ascending: true });

        if (studentsError) throw studentsError;
        setStudents((data || []) as StudentRow[]);
      } catch (e: any) {
        console.error("Failed to load students:", e);
        setError(e?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate]);

  return (
    <AdminShellLayout activeNav="student-preview">
      <div className={adminVisual.sectionStack}>
        <AdminPageHero
          eyebrow="Preview"
          title="Select student workspace"
          description="Choose a resident to open their dashboard in read-oriented admin preview. This is not a student login session."
          actions={
            <Button
              type="button"
              variant="outline"
              className="h-10 border-white/[0.08] bg-white/[0.03] px-4 text-xs font-semibold text-slate-200 hover:bg-white/[0.06]"
              onClick={() => navigate("/admin")}
            >
              Admin home
            </Button>
          }
        />

        <div className={clsx(adminVisual.secondaryPanel, "p-5")}>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, student ID, or room…"
              className="h-10 border-white/[0.08] bg-slate-950/40 pl-9 text-sm text-slate-100 placeholder:text-slate-600"
            />
          </div>

          <div className={clsx(AdminTableClasses.container, adminVisual.dataPlate)}>
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading students…</div>
            ) : error ? (
              <div className="py-12 text-center text-sm text-rose-300">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">No students match.</div>
            ) : (
              <table className={AdminTableClasses.table}>
                <thead className={AdminTableClasses.thead}>
                  <tr>
                    <th className={AdminTableClasses.th}>Student</th>
                    <th className={AdminTableClasses.th}>ID</th>
                    <th className={AdminTableClasses.th}>Room</th>
                    <th className={clsx(AdminTableClasses.th, "w-12 text-right")} />
                  </tr>
                </thead>
                <tbody className={AdminTableClasses.tbody}>
                  {filtered.map((s) => (
                    <tr key={s.id} className={AdminTableClasses.tr}>
                      <td className={AdminTableClasses.td}>
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={s.full_name}
                            imageUrl={s.profile_picture || null}
                            seed={s.student_id || s.id}
                            className="h-8 w-8"
                          />
                          <span className="font-medium text-slate-50">{s.full_name || "Unnamed"}</span>
                        </div>
                      </td>
                      <td className={clsx(AdminTableClasses.td, "tabular-nums text-slate-400")}>
                        {s.student_id || "—"}
                      </td>
                      <td className={clsx(AdminTableClasses.td, "text-slate-400")}>{s.room_number || "—"}</td>
                      <td className={clsx(AdminTableClasses.td, "text-right")}>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 border-white/[0.08] px-2 text-[11px] text-slate-100"
                          onClick={() => navigate(`/admin/student-view/${s.id}`)}
                          aria-label={`Open preview for ${s.full_name || "student"}`}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
}
