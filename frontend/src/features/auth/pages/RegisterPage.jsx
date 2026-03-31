import React, { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Import Shadcn components from your project structure
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth.js";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const { register, isRegistering } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("otpAPPLIED", "true");
      localStorage.setItem("otpEmail", formData.email);
      localStorage.setItem("password", formData.password);

      navigate("/verify-otp", {
        state: { email: formData.email },
      });
    } catch (err) {
      console.error("Registration failed:", err);
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
        className="w-full max-w-[480px]"
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
              Create an account
            </CardTitle>
            <CardDescription className="text-base">
              Enter your email to get started with Project Crux
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="h-11 pl-10 bg-background/50 border-input transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-offset-0"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="h-11 pl-10 bg-background/50 border-input transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-offset-0"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="h-11 pl-10 bg-background/50 border-input transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-offset-0"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Notice Box */}
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-md flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We'll send an OTP to verify your email. You can complete your
                  profile details later.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/40 p-6 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
