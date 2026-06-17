"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

/**
 * Client-side guard. The (dashboard) layout already redirects unauthenticated
 * users server-side; this catches a session that expires mid-session.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace(ROUTES.login);
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-5" />
      </div>
    );
  }

  return <>{children}</>;
}
