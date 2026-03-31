import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { authService } from '../api/auth.service.js';

const TRANSIENT_STORAGE_KEYS = ["otpAPPLIED", "otpEmail", "password", "tempPassword"];

export const useAuth = () => {
    const queryClient = useQueryClient();

    const userQuery = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authService.me,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    });

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: () => {
            toast.success("Login Successful", {
                description: "Welcome back to Project Crux!",
            });

            queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        },
        onError: (error) => {
            toast.error("Login Failed", {
                description: error.message || "Invalid email or password.",
            });
        },
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: () => {
            toast.success("Account Created", {
                description: "Please check your email for the OTP verification code.",
                duration: 5000,
            });
        },
        onError: (error) => {
            toast.error("Registration Failed", {
                description: error.message || "Something went wrong. Please try again.",
                duration:2000
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onMutate: async () => {
            await queryClient.cancelQueries();
        },
        onSuccess: () => {
            toast.success("Logged out", {
                description: "See you next time!",
            });

            queryClient.clear();

            sessionStorage.clear();
            TRANSIENT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
        },
        onError: (error) => {
            toast.error("Logout Error", {
                description: "Could not log out securely.",
            });
        },
    });

    return {
        user: userQuery.data,
        isAuthenticated: !!userQuery.data,
        isLoading: userQuery.isLoading,
        isLoadingUser: userQuery.isLoading,
        isErrorUser: userQuery.isError,
        userError: userQuery.error,

        login: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,

        register: registerMutation.mutateAsync,
        isRegistering: registerMutation.isPending,
        registerError: registerMutation.error,

        logout: logoutMutation.mutateAsync,
        isLoggingOut: logoutMutation.isPending,
        logoutError: logoutMutation.error,
    };
};