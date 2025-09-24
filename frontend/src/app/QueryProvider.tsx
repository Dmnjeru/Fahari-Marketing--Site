// frontend/src/app/QueryProvider.tsx
"use client"; // Required: this is a client component

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProviderWrapper({ children }: QueryProviderProps) {
  // Initialize QueryClient only once per component lifecycle
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
