import { supabase } from "@/lib/supabase";

export async function isAdminUserDebug(): Promise<{
  ok: boolean;
  userId: string | null;
  role: string | null;
  error: string | null;
}> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return {
        ok: false,
        userId: null,
        role: null,
        error: sessionError.message,
      };
    }

    const userId = session?.user?.id ?? null;
    if (!userId) {
      return { ok: false, userId: null, role: null, error: "No session user" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return { ok: false, userId, role: null, error: error.message };
    }

    const role = (data?.role ?? null) as string | null;
    return { ok: role === "admin", userId, role, error: null };
  } catch (e: any) {
    return {
      ok: false,
      userId: null,
      role: null,
      error: e?.message ?? String(e),
    };
  }
}

