import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import AdminShellLayout from "./AdminShellLayout";

export default function StudentDashboardAdminView() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId) {
      navigate("/admin/select-student-dashboard", { replace: true });
    }
  }, [studentId, navigate]);

  return (
    <AdminShellLayout activeNav="student-preview">
      <StudentDashboard mode="admin_view" targetStudentId={studentId} nestedInAdminShell />
    </AdminShellLayout>
  );
}
