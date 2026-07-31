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
authenticated pass-through. [`BACKEND_GAPS.md`](./BACKEND_GAPS.md) is the current
dashboard ↔ backend gap register.

## Stack

- **Next.js 16** (App Router, TypeScript) · **React 19**
- **Tailwind CSS v4** (CSS-first) + **shadcn/ui**, themed with **itriX Brand Manual v1.5 EN**
- **Zustand** (client state) · **TanStack Query v5** (server state) · **Recharts** (analytics)
- **pnpm**

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev                     # http://localhost:3001  (3000 belongs to itrix-web)
```

Other scripts: `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm typecheck`.

## Against the real Django backend, always

The dashboard develops against the real backend. In `../itrix-backend`:

```bash
python manage.py migrate
python manage.py seed_demo --flush   # demo@itrix.ai / demo12345
python manage.py runserver 8000
```

The `app/api/*` route handlers forward each request (with the session JWT) to
Django. A route whose backend counterpart has not shipped answers a calm 501
naming the endpoint it waits for — `rg "notImplementedOnBackend" src/app/api`
is the switch-on checklist, and [`BACKEND_GAPS.md`](./BACKEND_GAPS.md) is the
current gap register.

There is no mock layer. The backend is the single source of data, in
development and in production alike — the oversight surfaces (threads,
customers, support, guard hits) render their empty states until `seed_demo`
grows the corresponding objects.

```env
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
  config/            site / navigation / dashboard
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

Surface 2 is current with **Surface 2 v7.1** and runs against the real backend:
the shell contract, the four-class health board, content-pane oversight, the
guard-hit console with role-filtered `matchedText`, provenance badges and the
accounts area are built and verified live. Remaining work is the **switch-on
tail** — deleting each remaining `notImplementedOnBackend` guard as its
backend route lands — tracked route-by-route in
[`BACKEND_GAPS.md`](./BACKEND_GAPS.md).
