# itrix-dashboard

**Surface 2 — itriX Internal Operations Dashboard.** The internal, JWT-authenticated
console where the IWL team works every lead from the itriX AI Sales Engine: list &
detail, pipeline board, follow-up SLAs, NDA tracking, evaluations, PoCs, analytics,
templates, monthly reporting, and settings.

Since **Surface 2 v5.0** it is also the only place any human can watch Surface 1's
live conversations: thread oversight from a visitor's first sentence, attachment
review, customer success and support, the persona registry, and streaming
governance.

It is a **display + proxy** frontend. All business logic — scoring, AI/RAG, CRM writes,
email, Knowledge Core — lives in the Django backend; every `app/api/**/route.ts` is a thin
authenticated pass-through. See [`SCAFFOLD_PLAN.md`](./SCAFFOLD_PLAN.md) for the full plan
and the Backend v6.0 / Surface 2 v5.0 cutover checklist (§9–§10).

## Stack

- **Next.js 16** (App Router, TypeScript) · **React 19**
- **Tailwind CSS v4** (CSS-first) + **shadcn/ui**, themed with **itriX Brand Manual v1.5 EN**
- **Zustand** (client state) · **TanStack Query v5** (server state) · **Recharts** (analytics)
- **pnpm**

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then set NEXT_PUBLIC_USE_MOCKS=true for offline dev
pnpm dev                     # http://localhost:3001  (3000 belongs to itrix-web)
```

Other scripts: `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm typecheck`.

## Mock-first

The dashboard runs fully without the backend. With `NEXT_PUBLIC_USE_MOCKS=true` (default),
the `app/api/*` route handlers serve fixtures from `src/mocks/`. To point at the real
Django backend, set `NEXT_PUBLIC_USE_MOCKS=false` and `NEXT_PUBLIC_API_URL` to the API base
— the route handlers then forward each request (with the session JWT) to Django.

```env
NEXT_PUBLIC_USE_MOCKS=true
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=iTrix Operations
```

## Project layout

```
src/
  app/
    (auth)/          login / logout (no shell)
    (dashboard)/     overview, leads, pipeline, follow-up, nda, evaluations,
                     pocs, analytics, templates, reporting, settings
    api/             thin proxy route handlers (auth, leads, pipeline, follow-up,
                     nda, evaluations, pocs, analytics, templates, reporting, …)
  components/        ui/ (shadcn primitives) + layout/ + one folder per domain
  hooks/             data + UI hooks (useLeads, useSLATimer, usePolling, …)
  store/             Zustand stores            context/   React contexts
  lib/               api/ · sla/ · formatting/ · export/ · server/
  types/             DTOs mirroring the backend            constants/  enums & routes
  config/            site / navigation / dashboard         mocks/      fixtures + handlers
  app/globals.css    Atelier Indigo tokens (Tailwind v4 @theme)
```

## Theming notes (Atelier Indigo on Tailwind v4)

- The palette lives in a single `@theme` block in `globals.css` as `--color-*` /
  `--text-*` / `--shadow-*` tokens, so utilities like `bg-canvas`, `text-ink-900`,
  `bg-tier-1-soft`, `shadow-1` generate automatically.
- Tailwind v4 shares the `text-*` namespace for font sizes **and** colors. A custom
  font-size token must never share a name with a color token — e.g. the 13px size is
  `text-sec` (not `text-secondary`, which would collide with shadcn's `--color-secondary`).
- Single light system — no dark mode.

## Status

Surface 2 build-out is complete and runs against the mock layer. Remaining work is
**backend cutover** (reconcile the `// v3:` proxy branches and expand enums once the
Django models exist) — tracked in `SCAFFOLD_PLAN.md` §9.
