import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type FeeSummary = {
  total: number;
  remaining: number;
  paid: number;
  pct: number;
  loading: boolean;
  error: string;
};

async function requireSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("User not authenticated");
  return session;
}

/**
 * Lightweight fee totals for KPI widgets (mirrors FeePaymentCard aggregation).
 */
export function useStudentFeeSummary(viewerProfileId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fees, setFees] = useState<
    Array<{ amount: number; remaining_amount: number }>
  >([]);

  const summary: FeeSummary = useMemo(() => {
    const total = fees.reduce((s, f) => s + (Number(f.amount) || 0), 0);
    const remaining = fees.reduce((s, f) => s + (Number(f.remaining_amount) || 0), 0);
    const paid = Math.max(0, total - remaining);
    const pct = total > 0 ? (paid / total) * 100 : 0;
    return { total, remaining, paid, pct, loading, error };
  }, [fees, loading, error]);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      let studentId = viewerProfileId;
      if (!studentId) {
        const session = await requireSession();
        studentId = session.user.id;
      }
      if (!studentId) throw new Error("Missing student id");

      const { data, error: feeErr } = await supabase
        .from("fees")
        .select("amount,remaining_amount")
        .eq("student_id", studentId);

      if (feeErr) throw feeErr;
      setFees((data || []) as any);
    } catch (e: any) {
      console.warn("[useStudentFeeSummary]", e);
      setFees([]);
      setError(e?.message || "Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerProfileId]);

  return { ...summary, refresh };
}
