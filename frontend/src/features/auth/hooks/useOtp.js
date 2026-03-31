import { useMutation } from '@tanstack/react-query';

import { toast } from "sonner";
import { otpService } from '../api/otp.service.js';

export const useOtp = () => {
    const sendOtpMutation = useMutation({
        mutationFn: otpService.sendOTP,
        onSuccess: (data) => {
            toast.success("OTP Sent", {
                description: data?.message || "Please check your inbox for the verification code.",
                duration: 4000,
            });
        },
        onError: (error) => {
            toast.error("Failed to send OTP", {
                description: error.message || "Could not send email. Please check the address and try again.",
            });
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: otpService.verifyOTP,
        onSuccess: (data) => {
            toast.success("Verification Successful", {
                description: "Your email has been verified successfully.",
            });
        },
        onError: (error) => {
            toast.error("Invalid OTP", {
                description: error.message || "The code is invalid or has expired.",
            });
        },
    });

    return {
        sendOtp: sendOtpMutation.mutateAsync,
        isSendingOtp: sendOtpMutation.isPending,
        sendOtpError: sendOtpMutation.error,

        verifyOtp: verifyOtpMutation.mutateAsync,
        isVerifyingOtp: verifyOtpMutation.isPending,
        verifyOtpError: verifyOtpMutation.error,
    };
};