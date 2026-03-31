import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/app/styles/index.css";
import App from "@/app/router/App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/ui/sonner"; // Import from shadcn component
import { ThemeProvider } from "@/shared/components/ThemeProvider.jsx";

// 2. Create the client instance outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Optional: sensible defaults
      refetchOnWindowFocus: false,
    },
  },
});
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-center" richColors />
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
