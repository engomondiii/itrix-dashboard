"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isNotImplemented } from "@/lib/api/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            /**
             * A 501 means the backend route does not exist. Retrying it, or
             * polling it on the live cadence the thread and support views use,
             * just fills the network tab with red and costs the browser work
             * for an answer that cannot change until the backend ships.
             *
             * These two rules turn "not built yet" into a single request that
             * settles into a calm empty state.
             */
            retry: (failureCount, error) =>
              isNotImplemented(error) ? false : failureCount < 1,
            refetchInterval: (query) =>
              isNotImplemented(query.state.error) ? false : undefined,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={300}>{children}</TooltipProvider>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
