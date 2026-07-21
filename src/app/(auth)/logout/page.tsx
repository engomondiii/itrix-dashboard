"use client";

import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-sec text-ink-secondary">
      <Spinner /> Signing out…
    </div>
  );
}
