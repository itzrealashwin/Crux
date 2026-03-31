import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { Loader2, ArrowLeft, Mail, Timer, AlertCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// 1. Import Hooks

// 2. Import Shadcn Components
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useOtp } from "@/features/auth/hooks/useOtp.js";
import { useAuth } from "@/features/auth/hooks/useAuth.js";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  // 3. Integrate the Hook
  const { verifyOtp, isVerifyingOtp, verifyOtpError, sendOtp, isSendingOtp } =
    useOtp();
  const { login } = useAuth();

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otpSentByPreviousPage = location.state?.otpSent; // <--- Check this
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    // Only send if we have email AND it wasn't already sent by the previous page
    if (email && !hasFetchedRef.current && !otpSentByPreviousPage) {
      sendOtp(email);
      hasFetchedRef.current = true;
    }
  }, [email, sendOtp, otpSentByPreviousPage]);
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // --- Timer Logic ---
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Handlers ---

  const handleResend = async () => {
    // Reset UI states immediately
    setTimer(59);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    // Call API via Hook
    try {
      await sendOtp(email);
      // Success toast is handled inside the hook
    } catch (err) {
      // Error toast is handled inside the hook
      // You can add specific UI logic here if needed (e.g. stop timer)
    }
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((val) => val === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    if (inputRefs.current[focusIndex]) inputRefs.current[focusIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;

    try {
      // Verify OTP
      await verifyOtp({ email, otp: otpString });

      // For registration flow - password was stored in localStorage
      const password = localStorage.getItem("tempPassword");
      if (password) {
        await login({ email, password });
        localStorage.removeItem("tempPassword");
        navigate("/student/onboarding", { state: { email } });
      } else {
        // For verification after login, just invalidate queries
        // The LoginPage useEffect will handle navigation
        navigate(-1); // Go back to login
      }
    } catch (error) {
      inputRefs.current[0]?.focus();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isVerifyDisabled = otp.some((digit) => digit === "") || isVerifyingOtp;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Background Texture */}
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
          to="/register"
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shadow-sm group-hover:border-primary/50 transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </div>
          Back to Register
        </Link>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center ring-4 ring-primary/5">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Check your email
            </CardTitle>
            <CardDescription className="text-base">
              We've sent a 6-digit verification code to <br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Display (Using Hook Error) */}
              {verifyOtpError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-center gap-2 justify-center"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {verifyOtpError?.response?.data?.message ||
                    verifyOtpError.message ||
                    "Invalid OTP"}
                </motion.div>
              )}

              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={cn(
                      "flex h-12 w-10 sm:h-14 sm:w-12 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 text-center text-xl font-bold placeholder:text-muted-foreground/50",
                      digit && "border-primary text-primary",
                      // Add error styling to inputs if there is an error
                      verifyOtpError &&
                        "border-destructive text-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                    )}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  disabled={isVerifyDisabled}
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </Button>

                <div className="mt-6 text-center text-sm">
                  {canResend ? (
                    <p className="text-muted-foreground">
                      Didn't get the code?{" "}
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isSendingOtp}
                        className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 disabled:opacity-50"
                      >
                        {isSendingOtp ? "Sending..." : "Click to resend"}
                      </button>
                    </p>
                  ) : (
                    <div className="text-muted-foreground flex items-center justify-center gap-2 bg-muted/30 py-2 rounded-full w-fit mx-auto px-4">
                      <Timer className="h-4 w-4" />
                      Resend code in{" "}
                      <span className="font-mono font-medium text-foreground">
                        {formatTime(timer)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
