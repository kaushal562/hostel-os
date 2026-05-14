import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AdminWorkspaceShell, type AdminNavId } from "./premium/AdminWorkspaceShell";
import { AdminTopBar } from "./premium/AdminTopBar";
import { AdminCommandPalette } from "./premium/AdminCommandPalette";

/**
 * Shared chrome for all full-page admin routes (reports, student preview, etc.).
 * Keeps navigation + logout consistent with `/admin`.
 */
export default function AdminShellLayout({
  children,
  activeNav,
  notificationCount = 0,
}: {
  children: React.ReactNode;
  activeNav: AdminNavId;
  notificationCount?: number;
}) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const meta = data.user?.user_metadata as { full_name?: string } | undefined;
      const name = meta?.full_name?.trim() || data.user?.email?.split("@")[0] || "Admin";
      if (!cancelled) setAdminName(name);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }, [navigate]);

  const onNavigate = useCallback(
    (id: AdminNavId) => {
      if (id === activeNav) {
        if (id === "reports" || id === "student-preview") return;
      }
      if (id === "reports") {
        navigate("/admin/reports");
        return;
      }
      if (id === "student-preview") {
        navigate("/admin/select-student-dashboard");
        return;
      }
      navigate("/admin", { state: { adminNav: id } });
    },
    [navigate, activeNav],
  );

  return (
    <>
    <AdminWorkspaceShell
      activeNav={activeNav}
      onNavigate={onNavigate}
      collapsed={sidebarCollapsed}
      onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      mobileOpen={mobileOpen}
      onMobileOpenChange={setMobileOpen}
      adminName={adminName}
      profilePicture={null}
      topSlot={
        <AdminTopBar
          adminName={adminName}
          notificationCount={notificationCount}
          onMobileMenuOpen={() => setMobileOpen(true)}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          onNotificationsOpen={() => navigate("/admin", { state: { adminNav: "notices" } })}
        />
      }
      onLogout={handleLogout}
    >
      {children}
    </AdminWorkspaceShell>

    <AdminCommandPalette
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      activeNav={activeNav}
      onNavigate={onNavigate}
      onLogout={handleLogout}
    />
  </>
  );
}
