# Next.js Starter Template

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 (Oxide) ·
TypeScript · TanStack Query 5 · react-hook-form + zod 4 · vitest 4 + MSW.

A production-shaped frontend starter, harvested from a real product and
stripped of everything domain-specific. It pairs with the Django starter
template (`../../django_starter_template`) — the two share one error
contract, one pagination shape, and one auth flow — but any DRF-style
backend fits.

## Run it

**With no backend at all (demo mode):**

```bash
cp .env.example .env.local        # then set NEXT_PUBLIC_DEMO_MODE=true
npm install
npm run dev
```

Sign in with **demo@example.com / demo1234**. An in-browser mock backend
(`lib/demo/`, powered by MSW) speaks the Django starter's exact wire
contracts, so every feature below is live: auth flows including failure
states, entity CRUD, search/filter/sort/pagination, trash & restore, bulk
actions, CSV export. Creates and edits survive a reload (per-tab). Delete
`lib/demo/` and its wiring in `components/providers.tsx` when you have a
real API.

**Against the Django starter:**

```bash
cp .env.example .env.local        # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                       # with the Django template running on :8000
```

**Checks:** `npm run check` (lint + typecheck + tests) · `npm run build` ·
`npm run test:e2e` (Playwright over demo mode — no backend needed) ·
`npm run test:coverage`. CI (`.github/workflows/ci.yml`) runs all three
gates with zero secrets, because demo mode needs no backend.

## What's inside

### Auth — the full workflow, not just login

| Flow | Where |
|---|---|
| Sign in (field-level API errors, safe `?next=` redirect) | `app/(auth)/login` |
| Registration | `app/(auth)/register` |
| Forgot / reset password (enumeration-safe) | `app/(auth)/forgot-password`, `reset-password/[uid]/[token]` |
| Email verification + resend (auto-submits the key) | `app/(auth)/verify-email/[key]` |
| Settings area: Profile / Security / Appearance | `app/(app)/settings/*` |

The settings area is the expansion pattern for account/config surfaces: one
layout with config-driven sub-navigation (`settings/layout.tsx`), one route
per section, every panel built from `<SettingsSection>` cards
(`components/ui/settings-section.tsx`). Adding "Billing" or "API keys" is a
page file plus one nav entry. Appearance is the non-form exemplar — theme
radio cards with a View-Transitions circle reveal (`theme-provider.tsx`)
that expands from the click point and respects reduced motion.

State lives in `lib/auth/`: an `AuthProvider` with a three-state `status`
(no login-page flash on reload), an in-memory access token with refresh-based
session restore (`token-store.ts` explains the trade), and thin endpoint
wrappers (`auth-api.ts`) that return data or throw — never toast.
`components/auth/protected-route.tsx` provides `ProtectedRoute` /
`GuestRoute`, and is explicit that client guards are UX, not security.

### HTTP layer — `lib/api/`

- **Runtime-configurable host** (`lib/env.ts` + `docker-entrypoint.sh`):
  one Docker image serves every environment; the API URL is injected at
  container start via `window.__ENV__`, read lazily so nothing freezes the
  build-time value.
- **Axios client with a refresh mutex** (`client.ts`): concurrent 401s
  produce one refresh, not a stampede; failures funnel through a single
  auth-failure handler.
- **One error contract** (`errors.ts`): every failure normalizes to
  `{ type, message, fieldErrors }` — forms attach field errors to inputs
  with no status-code branching anywhere.
- **Typed react-query resources** (`hooks.ts`): `createResource<T>(path)`
  yields list/detail/create/update/delete/bulk hooks with cache keys derived
  from the endpoint path, so mutations invalidate the right lists for free.

### Entity layer — `lib/entity/` + `components/entity/`

A declarative CRUD engine: describe a resource once (`EntityConfig<T>` —
columns, filters, form fields, detail sections, row/bulk actions, all keyed
`keyof T` so typos are compile errors) and get a searchable, filterable,
sortable, paginated table with URL-persisted state, a table/cards view
toggle, a zod-validated create *and edit* form, a detail view,
trash/restore, CSV/XLSX export, and a four-step spreadsheet import wizard
(`EntityImport`: drag-drop upload → instant client-side CSV preview →
progress → per-row error report).

`app/(app)/products/page.tsx` is the worked example: a complete admin screen
— including edit, duplicate, archive, import, and toast feedback — in pure
configuration. `lib/entity/ANALYSIS.md` documents the 21,892-line original
this layer replaces, and why each cut was made.

### Theming & shell

- Tailwind v4 CSS-first config: **`app/globals.css` is the entire theming
  surface** — semantic HSL tokens (shadcn convention) + an `@theme inline`
  block. Re-theme by editing token values only.
- Class-based dark mode with a pre-paint inline script (no flash), an OS
  `system` mode that tracks live, and a three-state toggle.
- App shell: collapsible icon sidebar (`components/layout/`), cookie-persisted
  state, mobile drawer, config-driven nav shared with the **command palette**
  (Ctrl+K / ⌘K: navigation, theme, sign-out, recents) and a **notification
  center** (bell + unread badge, polling hooks in `lib/notifications/` with a
  documented websocket swap-point).
- Feedback primitives: a hand-rolled toast system (`components/ui/toast.tsx`,
  aria-live done correctly), KPI `StatCard`/`StatGrid`
  (`components/ui/stat-card.tsx`, demonstrated on the dashboard), and
  route-level error boundaries (`app/error.tsx`, `global-error.tsx`,
  `not-found.tsx`).
- Interaction layer: one `Button` primitive (`components/ui/button.tsx` —
  five variants, hover/focus-visible/press states decided once) used
  everywhere, motion tokens in `globals.css` (`animate-fade-in` etc., enter
  animations only, with the reasoning), hover transitions across tables,
  cards, and menus, and a global `prefers-reduced-motion` guard.
- System font stack by design — `next/font/google` breaks hermetic Docker/CI
  builds; the reasoning is in `app/layout.tsx`.

### Security defaults

CSP and friends in `next.config.ts` (each directive annotated), HSTS opt-in
with a ramp warning, open-redirect-safe login, enumeration-safe reset,
`X-Robots-Tag` on authenticated routes, standalone Docker output with
runtime env injection.

## Documentation map

Every non-obvious decision is documented **in the file that makes it** —
start at any file's header comment. The deepest write-ups:

- `lib/api/endpoints.ts` — why endpoint paths are relative (a real bug story)
- `lib/auth/token-store.ts` — where tokens live and why
- `lib/env.ts` — build-time vs runtime config, and the same-origin default
- `lib/entity/ANALYSIS.md` — the full audit of the original entity manager
- `lib/demo/handlers.ts` — the mock backend's contract-fidelity rules

## Deliberately not included (yet)

The source project has more that may get harvested when a consuming project
needs it — kept out for now because each adds real weight and the template
optimizes for being understandable in one sitting:

- Google OAuth (+ account-linking conflict resolution) and phone-OTP login —
  need real credentials, so they cannot be demo-functional
- Multi-role accounts with role switching — needs backend support
- WebSocket client (reconnect/backoff/offline queue) and realtime hooks —
  needs a Channels backend; `lib/notifications/` marks the swap-point
- Kanban/gallery/timeline list views (near-zero usage in the source project),
  per-channel notification preferences, charting kit, sliding detail panels

If you need one of these, harvest the *pattern* from the source, not the
code wholesale — that rule is what keeps this template small.
