import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts & Guards — these are tiny, eager import is fine
import StudentLayout from "@/widgets/layouts/StudentLayout";
import AdminLayout from "@/widgets/layouts/AdminLayout";
import RoleProtectedRoute from "@/shared/components/RoleProtectedRoute";

// Public — small, always needed
import LandingPage from "@/app/pages/LandingPage";

// Auth — lazy but loads fast
const LoginPage    = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const VerifyOtpPage = lazy(() => import("@/features/auth/pages/VerifyOtpPage"));

// Student — only downloaded when role=STUDENT
const OnBoardingPage    = lazy(() => import("@/features/student/pages/OnBoarding"));
const StudentDashboard  = lazy(() => import("@/features/student/pages/StudentDashboard"));
const Profile           = lazy(() => import("@/features/student/pages/Profile"));
const JobListingPage    = lazy(() => import("@/features/jobs/pages/JobListingPage"));
const JobDetailsPage    = lazy(() => import("@/features/jobs/pages/JobDetailsPage"));
const Application       = lazy(() => import("@/features/applications/pages/Application"));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage"));

// Admin — only downloaded when role=ADMIN
const AdminDashboard    = lazy(() => import("@/features/admin/pages/AdminDashboard"));
const ManageJobs        = lazy(() => import("@/features/admin/pages/ManageJobs"));
const ManageStudents    = lazy(() => import("@/features/admin/pages/ManageStudents"));
const ViewApplications  = lazy(() => import("@/features/admin/pages/ViewApplications"));
const ViewStudentProfile = lazy(() => import("@/features/admin/pages/ViewStudentProfile"));
const AdminJobDetails   = lazy(() => import("@/features/admin/pages/AdminJobDetail"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}> {/* replace with your Spinner */}
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          {/* STUDENT */}
          <Route element={<RoleProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route path="/student/onboarding" element={<OnBoardingPage />} />
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="jobs" element={<JobListingPage />} />
              <Route path="jobs/:id" element={<JobDetailsPage />} />
              <Route path="applications" element={<Application />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* ADMIN */}
          <Route element={<RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="jobs" element={<ManageJobs />} />
              <Route path="jobs/:id" element={<AdminJobDetails />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="students/:studentId" element={<ViewStudentProfile />} />
              <Route path="jobs/:jobId/applications" element={<ViewApplications />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;