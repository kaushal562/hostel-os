import React, { useEffect, useMemo, useState } from "react";
import Home from "@/components/home";
import { waitForSupabaseSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Navigate, useLocation } from "react-router-dom";

export default function StudentPortal() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const redirectedError = useMemo(() => {
    const s = location.state as any;
    return typeof s?.error === "string" ? s.error : "";
  }, [location.state]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    const init = async () => {
      const session = await waitForSupabaseSession();
      if (!cancelled) {
        setAuthenticated(!!session);
        setLoading(false);
      }

      // If authenticated, determine role so admins never render student dashboard UI.
      if (session?.user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        if (!cancelled) setRole((data?.role as string) ?? null);
      }

      subscription = supabase.auth
        .onAuthStateChange((_event, session2) => {
          setAuthenticated(!!session2);
        })
        .data.subscription;
    };

    init();
    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (authenticated) {
    if (role === "admin") {
      // Admin profile must NEVER behave like a student profile.
      // Redirect admins to the admin console.
      window.location.href = "/admin";
      return null;
    }
    return <Home />;
  }

  return <Navigate to="/login" replace state={redirectedError ? { error: redirectedError } : undefined} />;
}

