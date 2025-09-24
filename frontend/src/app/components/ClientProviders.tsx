"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/app/context/SocketContext";// create this context if you have real-time features

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000, // 1 minute cache
    },
  },
});

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {/* Global toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontSize: "0.9rem",
                borderRadius: "10px",
              },
              success: {
                style: { background: "#d1fae5", color: "#065f46" },
              },
              error: {
                style: { background: "#fee2e2", color: "#991b1b" },
              },
            }}
          />
          {children}
        </SocketProvider>

        {/* React Query Devtools - visible in development only */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
