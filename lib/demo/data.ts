/**
 * Demo-mode fixtures: the signed-in staff user and their credentials.
 * Domain seeds (leads, threads, deals, ...) live in `today.ts`.
 */

export const DEMO_USER = {
  id: 'demo-user-0001',
  name: 'Demo User',
  email: 'demo@example.com',
  // Friendly team-role label for display; permissionRole drives gates.
  role: 'Operations',
  permissionRole: 'ADMIN',
  avatarUrl: null,
  is_active: true,
};

export const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo1234',
};
