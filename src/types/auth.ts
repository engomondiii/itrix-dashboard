import type { Role } from "@/constants/roles";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: SessionUser;
  /** Tokens are set as httpOnly cookies by the Next proxy; not exposed to JS. */
  ok: true;
}
