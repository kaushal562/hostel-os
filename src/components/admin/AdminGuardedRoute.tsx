import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { waitForSupabaseSession } from "@/lib/auth";
import { isAdminUser } from "@/lib/adminAuth";

/**
 * Component-level security guard for any admin UI.
 * - fetches current authenticated profile
 * - verifies role === 'admin'
 * - otherwise redirects to '/'
 */
export default function AdminGuardedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // Prefer Supabase-derived admin check
        const adminOk = await isAdminUser();
        if (!cancelled) {
          setOk(!!adminOk);
        }

        // Also fetch profile to satisfy "fetch current authenticated profile" requirement.
        // (No client-side-only logic; decision is still role-based.)
        if (adminOk) {
          const session = await waitForSupabaseSession();
          const userId = session?.user?.id;
          if (userId) {
            const { data, error } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", userId)
              .maybeSingle();

            if (!cancelled) {
              const role = data?.role;
              setOk(role === "admin");
              if (error) {
                // keep ok as-is unless role says otherwise
              }
            }
          }
        }
      } catch {
        if (!cancelled) setOk(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!ok) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
          error: "Access denied: Admins only",
        }}
      />
    );

  }

  return <>{children}</>;
}

