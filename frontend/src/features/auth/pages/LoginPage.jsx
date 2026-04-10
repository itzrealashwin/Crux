import React, { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/useAuth.js";
import { useStudentProfile } from "@/features/student/hooks/useStudent.js";

// --- Login Page Component ---

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingGuestRole, setLoadingGuestRole] = useState(null);
  const { user, login, loginError, isLoggingIn, isAuthenticated, guestLogin, isGuestLoggingIn, guestLoginError } = useAuth();
  const { profile: studentProfile, isLoading: isLoadingProfile } =
    useStudentProfile({
      enabled: !!(isAuthenticated && user && user.role === "STUDENT" && !user.isGuest)
    });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isVerified === false) {
        navigate("/verify-otp", { state: { email: user.email } });
        return;
      }

      if (user.role === "STUDENT") {
        // Check if student has completed profile
        if (isLoadingProfile) return; // Wait for profile to load

        if (!studentProfile && !user.isGuest) {
          // No profile data, send to onboarding
          navigate("/student/onboarding");
        } else {
          // Profile exists (or guest), go to dashboard
          navigate("/student/dashboard");
        }
      } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        navigate("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate, studentProfile, isLoadingProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login({ email, password });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGuestLogin = async (role) => {
    setLoadingGuestRole(role);
    try {
      await guestLogin({ role });
    } catch (err) {
      console.error("Guest Login failed:", err);
    } finally {
      setLoadingGuestRole(null);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* 1. Background Texture & Ambient Glow */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>

      <div className="absolute top-0 z-[-2] h-screen w-screen bg-background bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-4 md:top-8 md:left-8"
      >
        <Link
          to="/"
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shadow-sm group-hover:border-primary/50 transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </div>
          Back to Home
        </Link>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px]"
      >
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div
                onClick={() => navigate("/")}
                className="flex items-center cursor-default "
              >
                {/* Logo Icon */}
                <div className="relative flex items-center justify-center text-2xl text-primary rounded-md shadow-sm">
                  <span className="font-['Outfit'] font-bold text-2xl">C</span>
                </div>

                {/* Logo Text - Using 'Outfit' font */}
                <div className="flex items-baseline font-['Outfit'] font-bold text-2xl tracking-tight text-foreground">
                  rux
                  {/* Subtle Dot Accent */}
                  <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1 animate-pulse" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {loginError.message}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 bg-background/50 border-input transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 pr-10 bg-background/50 border-input transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or try our tools
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleGuestLogin("STUDENT")}
                className="w-full h-11 mb-2 transition-all duration-200 border-primary/20 hover:bg-primary/5 hover:text-primary"
                disabled={isGuestLoggingIn}
              >
                {isGuestLoggingIn && loadingGuestRole === "STUDENT" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Continuing...
                  </>
                ) : (
                  "Continue as Guest Student"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleGuestLogin("ADMIN")}
                className="w-full h-11 transition-all duration-200 border-primary/20 hover:bg-primary/5 hover:text-primary"
                disabled={isGuestLoggingIn}
              >
                {isGuestLoggingIn && loadingGuestRole === "ADMIN" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Continuing...
                  </>
                ) : (
                  "Continue as Guest TPO"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/40 p-6 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
