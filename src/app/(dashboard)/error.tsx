"use client";

import { useEffect } from "react";
import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Error boundary for the whole dashboard section. Without this, an unexpected
 * render throw on any page takes down the entire shell.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlertIcon}
      title="Something went wrong"
      description="This page failed to render. Try again — if it keeps happening, the backend may be unavailable."
      action={
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
