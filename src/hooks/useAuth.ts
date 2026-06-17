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
      router.push(ROUTES.overview);
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
