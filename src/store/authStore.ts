import { create } from "zustand";

import type { SessionUser } from "@/types/auth";

interface AuthState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  clear: () => void;
}

/** Synchronous mirror of the session (TanStack Query is the source of truth). */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
