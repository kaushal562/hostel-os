import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { waitForSupabaseSession } from "@/lib/auth";


interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      // Wait once for supabase-js to restore session from storage
      const session = await waitForSupabaseSession();
      setAuthenticated(!!session);
      setLoading(false);

      // Subscribe to subsequent auth changes
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthenticated(!!session);
      }).data.subscription;
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
