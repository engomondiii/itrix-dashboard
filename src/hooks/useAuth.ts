"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { API, ROUTES } from "@/constants/routes";
import type { LoginRequest, SessionUser } from "@/types/auth";

async function fetchMe(): Promise<SessionUser | null> {
  const r = await fetch(API.me, { cache: "no-store" });
  if (r.status === 401) return null;
  if (!r.ok) throw new Error("Failed to load session");
  return (await r.json()).user as SessionUser;
}

/**
 * The proxy sends an unauthenticated visitor to `/login?next=<path>` so they
 * can land back where they were headed. Honor it on sign-in — but only for
 * same-origin paths: an absolute URL or a protocol-relative `//host` in `next`
 * would turn the login page into an open redirect, and `/login` itself would
 * loop. Anything unsafe falls back to the overview.
 */
function safeNextPath(): string | null {
  if (typeof window === "undefined") return null;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) {
    return null;
  }
  return next;
}

export function useAuth() {
  const qc = useQueryClient();
  const router = useRouter();

  const meQuery = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const login = useMutation({
    mutationFn: async (creds: LoginRequest) => {
      const r = await fetch(API.authLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });
      if (!r.ok) throw new Error("Invalid email or password");
      return (await r.json()).user as SessionUser;
    },
    onSuccess: (user) => {
      qc.setQueryData(["me"], user);
      router.push(safeNextPath() ?? ROUTES.overview);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch(API.authLogout, { method: "POST" });
    },
    onSuccess: () => {
      qc.setQueryData(["me"], null);
      qc.clear();
      router.push(ROUTES.login);
    },
  });

  return {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    login,
    logout,
  };
}
