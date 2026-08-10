/**
 * Auth types — the itriX team plane.
 *
 * `AuthUser` mirrors the backend's `SessionUser` exactly
 * (itrix-backend `apps/authentication/serializers.py` → UserSerializer):
 * camelCase `avatarUrl`, `role` = friendly team role label, `permissionRole` =
 * the ADMIN / ASSESSMENT / SPECIALIST / VIEWER permission value.
 *
 * There is deliberately no RegisterPayload: staff accounts are provisioned by
 * an admin, not self-registered — the backend's team plane exposes no
 * register / password-reset / verify-email endpoints. (Those routes exist on
 * the backend but belong to the public self-serve account plane.)
 */

export interface AuthTokens {
  access: string;
  /** SimpleJWT returns the (possibly rotated) refresh token in the body. */
  refresh?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  /** Friendly team role label, for display. */
  role?: string;
  /** ADMIN | ASSESSMENT | SPECIALIST | VIEWER — drives permission gates. */
  permissionRole?: string;
  avatarUrl?: string | null;
  is_active?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  /** True only while the initial session restore is running. */
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  updateProfile: (payload: Partial<AuthUser> | FormData) => Promise<AuthUser>;

  /**
   * Permission-role gate. Checks `user.permissionRole` against the given
   * role(s); ADMIN passes every check.
   */
  hasPermission: (role: string | string[]) => boolean;
}
