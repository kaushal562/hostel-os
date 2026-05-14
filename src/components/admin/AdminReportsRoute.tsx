import React from "react";
import AdminReports from "./AdminReports";
import AdminShellLayout from "./AdminShellLayout";

const AdminReportsRoute = () => {
  return (
    <AdminShellLayout activeNav="reports">
      <AdminReports embedded />
    </AdminShellLayout>
  );
};

export default AdminReportsRoute;
