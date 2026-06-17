"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";

/** Shown when a client request 401s mid-session. */
export function SessionExpiredBanner() {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 border-b border-warning/30 bg-warning-soft px-4 py-2 text-sec text-warning-text"
    >
      <span>Your session has expired.</span>
      <Link href={ROUTES.login} className="font-medium underline underline-offset-2">
        Sign in again
      </Link>
    </div>
  );
}
