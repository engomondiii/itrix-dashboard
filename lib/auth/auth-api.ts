'use client';

/**
 * Auth endpoint wrappers for the itriX team plane.
 *
 * Thin on purpose: no state, no toasts, no navigation. Every function either
 * returns data or throws. The context above decides what that means for the
 * UI, and the caller decides what to show.
 *
 * The backend contract (itrix-backend `apps/authentication/views.py`):
 *
 *     POST  auth/login/           {email, password}  -> {access, refresh, user}
 *     POST  auth/logout/          {refresh}          -> 205 (blacklists refresh)
 *     GET   auth/me/                                 -> {user}   (wrapped!)
 *     GET   auth/profile/                            -> SessionUser (bare)
 *     PATCH auth/profile/         {name?, avatarUrl?}-> SessionUser (bare)
 *     POST  auth/token/refresh/   {refresh}          -> {access, refresh?}
 *
 * No register / password-reset / verify-email: staff accounts are
 * provisioned by an admin. See `lib/auth/types.ts`.
 */

import { plainApi, http, setLoggingOut } from '@/lib/api/client';
import { Endpoints } from '@/lib/api/endpoints';
import {
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './token-store';
import type { AuthTokens, AuthUser, LoginCredentials } from './types';

/** Persist whatever the server returned (rotation may include a new refresh). */
function storeTokens(tokens: AuthTokens): void {
  if (tokens.access) setAccessToken(tokens.access);
  if (tokens.refresh) setRefreshToken(tokens.refresh);
}

export const AuthAPI = {
  /**
   * Sign in.
   *
   * Uses `plainApi`: there is no token to attach yet, and a 401 here means
   * "wrong password", not "session expired". Sending it through the
   * authenticated client would trigger the refresh interceptor and turn a
   * bad-password response into a confusing forced logout.
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const data = await plainApi
      .post<AuthTokens & { user: AuthUser }>(Endpoints.Auth.Login, credentials)
      .then((r) => r.data);

    storeTokens(data);
    return data.user;
  },

  /**
   * Sign out.
   *
   * Local tokens are cleared in `finally`, so a failing server call still
   * signs the user out of this browser. The refresh token is sent so the
   * server can blacklist it (best-effort; already-expired is still success).
   */
  async logout(): Promise<void> {
    setLoggingOut(true);
    try {
      const refresh = getRefreshToken();
      await http.post(Endpoints.Auth.Logout, refresh ? { refresh } : {});
    } catch {
      // Already-expired token, or the server is down. Nothing to do: the
      // local teardown below is what matters to the user.
    } finally {
      clearTokens();
      setLoggingOut(false);
    }
  },

  /** `auth/me/` wraps the payload: `{user: SessionUser}`. */
  async getCurrentUser(): Promise<AuthUser> {
    const data = await http.get<{ user: AuthUser }>(Endpoints.Auth.Me);
    return data.user;
  },

  /** `auth/profile/` accepts `{name?, avatarUrl?}` and returns the bare user. */
  async updateProfile(payload: Partial<AuthUser> | FormData): Promise<AuthUser> {
    return http.patch<AuthUser>(Endpoints.Auth.Profile, payload);
  },

  /**
   * Exchange the refresh credential for a new access token.
   *
   * Called on app mount to restore a session after a page reload — the access
   * token lives in memory only, so a refresh is how the session survives.
   * Throws when there is no valid refresh credential, which is the normal
   * "not signed in" case and must be handled, not logged as an error.
   */
  async refreshSession(): Promise<AuthTokens> {
    const stored = getRefreshToken();
    const data = await plainApi
      .post<AuthTokens>(Endpoints.Auth.TokenRefresh, stored ? { refresh: stored } : {})
      .then((r) => r.data);

    storeTokens(data);
    return data;
  },
};

export default AuthAPI;
