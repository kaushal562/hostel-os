import { supabase } from "@/lib/supabase";
import { waitForSupabaseSession } from "@/lib/auth";

/**
 * Secure admin check via Supabase auth + RLS metadata.
 * Admin access is granted only when:
 *  - user is authenticated (auth.uid() exists)
 *  - public.profiles.role === 'admin'
 *
 * @returns Object with admin check result and debug info
 */
export async function isAdminUser(): Promise<{
  isAdmin: boolean;
  userId: string | null;
  role: string | null;
  redirectReason: string | null;
}> {
  console.group("[adminAuth] isAdminUser()");
  try {
    // Ensure session is available before role check.
    await waitForSupabaseSession();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("[adminAuth] sessionError:", sessionError);
      return { isAdmin: false, userId: null, role: null, redirectReason: "session_error" };
    }

    const userId = session?.user?.id ?? null;
    const email = session?.user?.email ?? null;

    console.log("[adminAuth] session userId:", userId);
    console.log("[adminAuth] session user email:", email);

    if (!userId) {
      console.warn("[adminAuth] redirect reason: no authenticated session userId");
      return { isAdmin: false, userId: null, role: null, redirectReason: "no_session_user_id" };
    }

    // Only derive admin access from profiles.role.
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[adminAuth] profiles select error:", error);
      return { isAdmin: false, userId, role: null, redirectReason: "profiles_query_error" };
    }

    const role = (data?.role ?? null) as string | null;
    console.log("[adminAuth] profiles.role:", role);

    const isAdmin = role === "admin";
    console.log("[adminAuth] adminAuth result:", isAdmin);
    if (!isAdmin) {
      console.warn("[adminAuth] redirect reason: profiles.role !== 'admin'");
      return { isAdmin: false, userId, role, redirectReason: "not_admin_role" };
    }

    return { isAdmin: true, userId, role, redirectReason: null };
  } finally {
    console.groupEnd();
  }
}



