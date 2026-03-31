import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth.js";
import { Loader2 } from "lucide-react";

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isLoadingUser } = useAuth();
  const location = useLocation();

  // --- 1. Loading UI (Spinner) ---
  const LoadingScreen = () => (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying access...</p>
      </div>
    </div>
  );

  // --- 2. BLOCKING: Wait for Auth to initialize ---
  if (isLoadingUser) {
    return <LoadingScreen />;
  }

  // --- 3. AUTH CHECK: Not logged in? Go to Login ---
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- 4. ROLE CHECK: Logged in, but wrong role? ---
  // We use .includes() safely and normalize case to avoid "admin" !== "ADMIN" bugs
  const userRole = user.role?.toUpperCase() || "";
  const allowed = allowedRoles.map(r => r.toUpperCase());

  if (!allowed.includes(userRole)) {
    console.warn(`[Access Denied] User Role: ${userRole} | Allowed: ${allowed}`);
    
    // Redirect based on the role they DO have
    if (userRole === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (userRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    
    // Fallback if no role matches known types
    return <Navigate to="/unauthorized" replace />;
  }

  // --- 5. LAZY LOADING (Suspense) ---
  // This prevents the "blank screen" or flicker when child routes load chunks
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
};

export default RoleProtectedRoute;