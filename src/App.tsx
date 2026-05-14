import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import AdminRoute from "./components/admin/AdminRoute";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import AdminLoginPage from "./components/auth/AdminLoginPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import routes from "tempo-routes";
import StudentPortal from "./components/student/StudentPortal";
import StudentDashboardSelector from "./components/admin/StudentDashboardSelector";
import StudentDashboardAdminView from "./components/admin/StudentDashboardAdminView";
import AdminReportsRoute from "./components/admin/AdminReportsRoute";


function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          {/* Student Portal */}
          <Route path="/" element={<StudentPortal />} />

          {/* Admin student-dashboard view tooling */}
          <Route
            path="/admin/select-student-dashboard"
            element={
              <AdminProtectedRoute>
                <StudentDashboardSelector />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/student-view/:studentId"
            element={
              <AdminProtectedRoute>
                <StudentDashboardAdminView />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminRoute />
              </AdminProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Dedicated Admin Reports Route */}
          <Route
            path="/admin/reports"
            element={
              <AdminProtectedRoute>
                <AdminReportsRoute />
              </AdminProtectedRoute>
            }
          />

          {/* Tempo Routes */}

          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
