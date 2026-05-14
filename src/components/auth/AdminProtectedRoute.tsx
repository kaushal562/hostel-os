import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminUser } from "@/lib/adminAuth";
import { waitForSupabaseSession } from "@/lib/auth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [hasSessionUser, setHasSessionUser] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        console.log("[AdminProtectedRoute] start admin check");

        // Debug requirement:
        //   - current authenticated user id
        //   - fetched profile role
        //   - redirect reason
        const session = await waitForSupabaseSession();
        const currentUserId = session?.user?.id ?? null;
        console.log("[AdminProtectedRoute][Debug] currentUserId:", currentUserId);

        // route-level guard: rely ONLY on Supabase session + profiles.role
        const {
          isAdmin,
          userId,
          role,
          redirectReason,
        } = await isAdminUser();

        console.log("[AdminProtectedRoute][Debug] fetched profile role:", {
          userId,
          role,
        });
        console.log("[AdminProtectedRoute][Debug] redirectReason:", {
          redirectReason,
          path: location.pathname,
        });

        if (!cancelled) {
          setAdminAuthenticated(isAdmin);
          setHasSessionUser(!!userId);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Unauthenticated users go to admin login.
  if (!hasSessionUser) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Authenticated but non-admin users are denied and redirected away.
  if (!adminAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, error: "Access denied: Admins only" }}
      />
    );
  }


  return <>{children}</>;
};

export default AdminProtectedRoute;


