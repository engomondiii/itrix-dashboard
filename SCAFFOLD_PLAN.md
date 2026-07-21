# itrix-dashboard — Scaffold Plan

**Surface 2 — itriX Internal Operations Dashboard**
The internal CRM/operations console for the itriX AI Sales Engine. Operators review
AI-qualified leads, work the pipeline, track NDAs / paid evaluations / PoCs, monitor
SLAs, manage templates, and generate reports.

> Source of truth: `04_AI Sales Engine (Product)/itriX Complete Surface 2 — Internal Operations Dashboard Structure.docx`
> Theme: `05_Website/iTrix_Atelier_Indigo_Theme_System_v2.docx`
> Architecture context: `itriX_AI_Sales_Engine_Master_Architecture_Flow_Document_v1.0.docx`

---

## 1. Guiding principles (from the specs)

- **Display + proxy only.** This frontend renders data and proxies requests. All
  business logic — scoring, AI/RAG, CRM writes, email sends, Knowledge Core — lives in
  the Django backend. Every `app/api/**/route.ts` is a thin authenticated pass-through.
- **Internal, auth-required.** Unlike Surface 1 (public), every dashboard route requires
  a valid session (JWT issued by Django).
- **Compact, operational UI.** Atelier Indigo: warm paper canvas, deep-indigo sidebar,
  sapphire actions, gold signature accents. 20px page titles, 24px KPI numerals, soft-bg
  badges, SLA traffic-light discipline. No dark theme.
- **MVP first.** Build the lead → pipeline → follow-up core before analytics/reporting polish.

---

## 2. Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) | Scaffolded via `create-next-app`; route groups `(auth)` / `(dashboard)`. |
| Styling | **Tailwind CSS v4** (CSS-first, no config file) | Atelier Indigo palette ported into an `@theme` block in `globals.css`; the theme doc's v3 `tailwind.config.ts` colors map to v4 `--color-*` tokens. |
| Client state | **Zustand** | Per spec: `authStore`, `leadStore`, `filterStore`, `pipelineStore`, `notificationStore`, `uiStore`. |
| Server state | **TanStack Query v5** | Caching, polling (`usePolling`, SLA timers), optimistic lead actions. Wraps the `lib/api` fetchers. |
| Fonts | **Inter** + **JetBrains Mono** via `next/font/google` | Per theme typography spec; replaces the default Geist fonts. No manual woff2 hosting needed. |
| Charts | **Recharts** | Funnel, tier donut, submission trend, SLA compliance; use the `chart-1…6` palette. |
| Forms | **React Hook Form + Zod** | Settings, notes, SLA config. |
| Icons | **lucide-react** | Lightweight, matches enterprise tone. |
| Auth transport | JWT from Django, held in **httpOnly cookie**, set/cleared by the Next `api/auth/*` proxy | Token never touches client JS. |
| Package manager | **pnpm** | Fast, disk-efficient. |

### Backend-not-ready strategy
`itrix-backend` (Django) does not exist yet, and the public site (`itrix-web`) is separate.
To build Surface 2 independently:
- Define all DTOs in `src/types/*` first (they mirror the backend API map).
- Ship a **mock data layer** — fixtures + MSW (Mock Service Worker) — behind a
  `NEXT_PUBLIC_USE_MOCKS` flag, so every screen is demoable before Django is live.
- `lib/api/*` fetchers point at `/api/...` Next routes; those routes proxy to
  `process.env.DJANGO_API_URL` (or return mocks when the flag is on).
- Cutover to the real backend later is a config change, not a rewrite.

---

## 3. Target structure (condensed)

```
itrix-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx  globals.css (@theme tokens)  error.tsx  loading.tsx  not-found.tsx
│   │   ├── (auth)/login  (auth)/logout
│   │   ├── (dashboard)/
│   │   │   ├── overview/
│   │   │   ├── leads/  [leadId]/  tier-1..4/
│   │   │   ├── pipeline/  [stageId]/
│   │   │   ├── follow-up/  overdue/  today/
│   │   │   ├── nda/  [leadId]/
│   │   │   ├── evaluations/  [evaluationId]/
│   │   │   ├── pocs/  [pocId]/
│   │   │   ├── analytics/  funnel/ leads/ response-time/ bottlenecks/
│   │   │   ├── templates/  emails/ follow-up/ evaluation/ poc/ handoff/
│   │   │   ├── reporting/  [reportId]/
│   │   │   └── settings/  team/ notifications/ sla/ profile/
│   │   └── api/                  thin proxy route handlers (auth, leads, follow-up,
│   │                             email, analytics, pipeline, templates, reporting)
│   ├── components/  layout/ auth/ overview/ leads/ lead-detail/ pipeline/
│   │                follow-up/ nda/ evaluations/ pocs/ analytics/ templates/
│   │                reporting/ settings/ ui/
│   ├── hooks/       useAuth, useLeads, useLeadDetail, useLeadActions, usePipeline,
│   │                useFollowUpQueue, useNDAQueue, useEvaluations, usePoCs,
│   │                useAnalytics, useTemplates, useReporting, useNotifications,
│   │                useTeam, useSLATimer, usePolling, useToast, usePagination,
│   │                useTableSort, useSearch, useLocalStorage, useMediaQuery
│   ├── context/     AuthContext, NotificationContext, DashboardContext
│   ├── store/       authStore, leadStore, filterStore, pipelineStore,
│   │                notificationStore, uiStore
│   ├── lib/         api/* (typed fetchers)  formatting/*  validation/*
│   │                sla/* (calculator, checker, constants)  export/* (csv, report)
│   ├── types/       auth, lead, pipeline, followUp, nda, evaluation, poc,
│   │                analytics, template, report, team, notification, api
│   ├── constants/   routes, tiers, statuses, roles, sla, scoring, products
│   ├── config/      site.config, navigation.config, dashboard.config
│   └── mocks/       handlers.ts + fixtures/  (MSW; dev/demo only)
├── .env.local  .env.example  .gitignore
├── next.config.ts  tsconfig.json  postcss.config.mjs  eslint.config.mjs
└── package.json   (Tailwind v4 → no tailwind.config.ts; tokens live in globals.css)
```

---

## 4. Atelier Indigo wiring (Phase 1, non-negotiable)

Tailwind v4 is CSS-first, so the theme doc's `tailwind.config.ts` colors block and
`tokens/*.css` are ported into a single **`@theme`** block in `globals.css`. Naming is
preserved so utilities generate exactly as expected:

- Every palette entry becomes a `--color-*` token → utilities like `bg-canvas`,
  `text-ink-900`, `border-line`, `bg-indigo-950`, `text-oni`, `bg-sapphire-600`,
  `bg-tier-1-soft`, `text-success-text`, `bg-chart-1` all work, and the same value is
  reachable in raw CSS via `var(--color-*)`.
- Foundations (`canvas`, `canvas-deep`, `surface`, `surface-warm`, `surface-sunken`),
  indigo 700–950 + `oni`/`oni-muted`, sapphire 50–700, gold 50–600, ink 300–900,
  line/line-subtle/line-strong, status + `-soft`/`-text` companions, tier 1–4 + `-soft`,
  chart 1–6, warm-umber `--shadow-1..3` + `--shadow-gold`, radius, motion, layout vars.
- Type scale via `--text-*` tokens + `--font-sans` (Inter) / `--font-mono` (JetBrains Mono).
- `body { background: var(--color-canvas); color: var(--color-ink-900); }`; **no dark
  `prefers-color-scheme` block** (Atelier Indigo is a single light-majority system).
- Shell rules baked into components from day one: 240px `indigo-950` sidebar, active item
  = `indigo-800` fill + **3px `gold-500` left bar**; white topbar with bottom border;
  warm-paper page canvas; cards = `surface` + 1px `line` + `shadow-1`; **badges always
  soft-bg + strong-text, never solid**; focus ring `2px sapphire-600` (`gold-400` on indigo).

---

## 5. Build phases (mirrors the spec's 10-phase plan)

Each phase ends with a runnable, reviewable increment.

| Phase | Scope | Exit criteria |
|---|---|---|
| **0 — Init** | `create-next-app` (TS, App Router, Tailwind), pnpm, ESLint/Prettier, fonts, base configs, MSW skeleton | App boots; lint/typecheck pass; warm-paper canvas renders. |
| **1 — Foundation & tokens** | Atelier Indigo tokens, `base.css`/`dashboard.css`, `constants/*`, `types/*`, `lib/sla` + `lib/formatting`, `config/*` | Tokens applied; types compile; SLA calculator unit-tested. |
| **2 — UI primitives** | `components/ui/*` (Button, Badge, Card, DataCard, Table set, Modal, ConfirmDialog, Toast, Input/Select/Checkbox/Toggle, Tabs, Avatar, Pagination, SearchInput…) + `useToast/useMediaQuery/usePagination/useTableSort/useSearch` | Primitives render to theme; badge = soft-bg+strong-text enforced. |
| **3 — Auth & shell** | `(auth)/login`, `api/auth/{login,logout}` proxy, httpOnly cookie, `AuthGuard`, `DashboardShell` (Sidebar + Topbar + NotificationBell + UserMenu + Breadcrumb + PageHeader), `authStore`, `useAuth` | Login → cookie set → guarded dashboard shell with working sidebar nav. |
| **4 — Leads list & filtering** | `leads/` + tier views, `LeadTable` + row/badges/filters/search/sort, `LeadBulkActions`, CSV export, `leadStore`/`filterStore`, `useLeads`/`useLeadFilters`, `api/leads` proxy | Filter/sort/paginate/search/export over mock leads; tier + route + status badges correct. |
| **5 — Lead detail** | `leads/[leadId]`, full `lead-detail/*` (summary, bottleneck, Q1–Q9, score breakdown, route, timeline, notes, status/owner controls, escalate/NDA/eval/PoC buttons, special-rights flag, AI follow-up draft, send-email, meeting, handoff memo), `useLeadDetail`/`useLeadActions` | View a lead; actions optimistically update via mock proxies. |
| **6 — Pipeline board** | `pipeline/` kanban + `[stageId]`, board/column/card components, `pipelineStore`, `usePipeline` | Stage columns render with counts; overdue cards flagged (3px `error-600` bar). |
| **7 — Follow-up & NDA** | `follow-up/` (overdue/today), `nda/` + `[leadId]`, SLA timers, complete/snooze, NDA checklist, `useFollowUpQueue`/`useNDAQueue`/`useSLATimer`/`usePolling` | SLA countdown + breach states (24h T1 / 48h T2); complete/snooze work. |
| **8 — Evaluations & PoCs** | `evaluations/` + `pocs/` lists & detail, package badges, status/milestone/KPI/risk trackers | Eval & PoC records viewable with milestone/KPI displays. |
| **9 — Overview & analytics** | `overview/` (4 KPI cards, alerts, recent feed, tier donut, route bar, weekly trend, pending follow-ups), `analytics/` (funnel, histogram, tier, route, industry, trend, SLA, bottlenecks, conversion table, date range), Recharts on `chart-*` palette | Overview + analytics render charts from mock aggregates. |
| **10 — Templates, reporting, settings** | `templates/*` (email/follow-up/eval/poc/handoff viewers + copy), `reporting/*` (builder + sections + export), `settings/*` (team/notifications/sla/profile), `NotificationContext`/`notificationStore` | Templates copyable; report builder assembles sections; SLA thresholds configurable. |

**Cutover phase (later):** flip `NEXT_PUBLIC_USE_MOCKS=false`, point `DJANGO_API_URL` at the
real backend, reconcile DTOs against the live `/api/v1` map, retest the 22-criteria flows.

---

## 6. API surface (Next proxy → Django)

Thin handlers under `app/api/`, forwarding the cookie's JWT as a Bearer token to Django
(`/api/v1/...` per the Backend Structure doc). No logic beyond auth + shape pass-through:
`auth/{login,logout}`, `leads` + `leads/[leadId]/{assign,status,note,escalate,nda}`,
`follow-up` + `[taskId]`, `email/send`, `analytics/{overview,funnel,response-time}`,
`pipeline`, `templates` + `[templateId]`, `reporting` + `[reportId]`.

---

## 7. Conventions

- **One component per file**, named after the spec; co-locate nothing that the doc lists separately.
- **No `fetch` in components** — only via `hooks/*` → `lib/api/*`.
- **Server Components by default**; mark `"use client"` only for interactive leaves.
- **Tokens, never hex** in components — use Tailwind classes mapped to the theme palette.
- **Conventional Commits**; one phase ≈ one PR.
- `pnpm lint && pnpm typecheck && pnpm build` green before each phase closes.

---

## 8. Decisions (confirmed)

1. **Repo init** — ✅ fresh `git init` in `itrix-dashboard/` (standalone repo for now).
2. **Tailwind** — ✅ **v4**, CSS-first; tokens in `globals.css` `@theme` (not a config file).
3. **Mock-first** — ✅ build against MSW mocks now, cut over to Django later via config flag.
4. **Auth** — ✅ JWT; Next `api/auth/*` proxy holds the token in an httpOnly cookie and
   forwards it as Bearer to Django (`/api/v1/auth/login` assumed; reconcile at cutover).

---

## 9. Cutover reconciliation — Backend Structure v3 / Surface 2 v2 (2026-06-12)

The dashboard was built mock-first against the original specs. The v2/v3 docs are a
**re-plan (10 phases → 3), not a redesign** — same file set. Reconciled so far:

**Applied (a):** dev/start on **port 3001**; env `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_APP_NAME`
(`site.config` reads `NEXT_PUBLIC_API_URL`, falls back to `DJANGO_API_URL`).

**Applied (b) — real-mode proxy paths aligned to v3** (mock mode unchanged; untestable
until Django runs, marked with `// v3:` comments):
- **Analytics** is ONE endpoint `GET /analytics/?days=30` returning all 7 blocks; the 4 proxy
  routes now fetch it and extract `overview`/`funnel`/`sla_compliance`/`patterns`+`industry_breakdown`.
  ⚠️ exact serializer field names must be confirmed at cutover.
- **Follow-up**: `GET /follow-up/overdue/` & `/today/` (not `?filter=`); actions `POST {id}/complete/` & `{id}/snooze/`.
- **NDA**: keyed by NDA-record id; sign via `POST /nda/{id}/sign/`.

**Deferred (c) — enum expansions (kept current/given values per direction; need the actual
lists from the backend `models.py` before applying):**
- Lead **statuses 8 → 12** (the 12 also = the pipeline columns) — keep the 8 given; 4 unknown left out.
- Special-rights **5 → 7** — keep 5 given; 2 unknown left out.
- Follow-up **statuses 3 → 5** + **6 task types**; lead **activity types 9 → 10** — keep given values.
- Available-but-not-applied (values *are* given in v3, deferred pending confirmation):
  NDA states add `DECLINED`/`EXPIRED`; auth roles → `ADMIN`/`ASSESSMENT`/`SPECIALIST`/`VIEWER` (4).

**Not yet built (v3 lists, lower priority for the dashboard MVP):** `leads/{id}/paid-eval`,
`{id}/poc`, `{id}/summary`, `{id}/handoff`, `approval-checklist`; `emails/send` route; reporting
`generate`/`html`/`json_export`; notifications `read`/`read-all`/`unread-count` write endpoints.

---

## 10. Surface 2 v5.0 — implemented (2026-07-21)

Built against **Surface 2 Structure v5.0**, which folds in Master Technical Architecture v2.6 and
Backend Structure v6.0. All three phases are in the tree. Nothing shipped was removed except the
retired token names and the two legacy journey values.

### Unflagged corrections (they are corrections, not features)

1. **Mock mode is fail-closed twice over** — `site.config.ts` requires the exact string `"true"`
   **and** `NODE_ENV !== "production"`; `api/auth/login` repeats the production test on the one
   route where getting it wrong means a junk login is accepted. The old default (`!== "false"`)
   meant a deploy that forgot the variable shipped with an unauthenticated ADMIN session.
2. **Brand Manual v1.5 token rename** — ~475 call sites. Atelier names are gone and
   `eslint-rules/no-atelier-tokens.mjs` (wired as `itrix/no-atelier-tokens`) keeps them gone.
   Two deviations from `itrix-web`, both argued in `globals.css`: `signature` instead of `accent`
   (shadcn owns `--color-accent`), and `line-strong → border-medium` (mapped by rendered value).

### Ten-state journey

`ENGAGED` split into **ASSESSMENT (7) / POC (8) / INTEGRATION (9)**, `CLIENT → NDA_REVIEW (6)`,
`CUSTOMER_SUCCESS (10)` added. Both retired values are still accepted on the wire by
`normalizeState`, which falls back to `ARRIVED` — the most restrictive state — on anything
unknown, so vocabulary drift under-states progress rather than over-stating it.
`MigrationReportPanel` renders the ENGAGED-split **dry run** for review before
`0003_migrate_engaged_split` is applied; unjustified rows sort to the top.

`nda_signed` is modelled as a **self-transition** on NDA_REVIEW: reveal ④ raises the ceiling in
place without moving the subject, so `EVENT_REVEAL` exists alongside `STATE_REVEAL` and
`advanceChangesState` distinguishes "no state change" from "nothing happened".

### New areas

| Area | Routes | Notes |
|---|---|---|
| Threads | `/threads`, `/threads/[threadId]`, `/threads/coverage` | Anonymous threads are first-class — a conversation exists before a Lead does. Blocked and live threads sort first. |
| Attachments | `/attachments`, `/attachments/[attachmentId]` | Quarantined files have **no** download control (absent, not disabled). Release is ADMIN/ASSESSMENT + a logged reason. |
| Customers | `/customers`, `/customers/[clientId]`, `/customers/outcomes`, `/customers/reviews` | Population starts at **first payment** (state 7), not license-out. |
| Support | `/support`, `/support/[requestId]` | Reuses `useSLATimer`. A blocking request suppresses commercial actions for that customer. |
| Personas | `/personas`, `/personas/[personaId]` | Read-only registry browser. Team plane only. |
| Governance | `/governance/streaming` | Guard halts with matched pattern, envelope downgrades, blocking-approval banner. |
| Analytics | six new tabs | Reuse the operational hooks so a chart cannot disagree with the queue it summarises. |

### The customer-first rule

`mocks/nbaDb.ts` implements the five-step precedence rule for real rather than returning a
fixture — a mock that always returned a commercial action would let the acceptance test pass
against nothing. Verified in mock mode: a customer with an open blocking request gets
`primary=support, suppressionReason=blocking_support_issue`; adoption below 60% gets
`enablement`; a pulse ≤ 3 gets `human_outreach`; only a clean customer gets `commercial`.
Suppressed candidates are **shown struck through**, not hidden — a rule nobody can see is a rule
nobody trusts. `CommercialOverrideDialog` logs an exception with a reason and does **not** clear
the condition.

### Flags

`src/config/features.config.ts` — all default off, navigation pruned at module scope.
`.env.local` enables all six for local development; `.env.example` ships them off.
A frontend flag may only be enabled once its backend counterpart is on.

### Verified

`pnpm lint && pnpm typecheck && pnpm build` green; dev server smoke-tested — all 16 new pages
200, all 9 new API endpoints 200, release-without-reason 409, release-as-VIEWER 403,
override-without-reason 409, audit trail records the release with actor and reason.

### Still open

- **`itriX Brand Manual v1.5 EN` is not in OneDrive.** Token values were mirrored from
  `itrix-web/src/styles/tokens/brand.css`. Confirm against the real manual when it lands.
- Real-mode branches are marked `// v6:` and are untestable until Django runs.
- WebSocket cutover is **not** done: the live views poll (10–30s) and the spec's Phase 3 swaps
  these to sockets with GET as the fallback. Poll intervals are in the hooks, not the fetchers,
  for exactly that reason.
- The v5.0 Playwright specs named in the doc (`no-commercial-during-support-issue.spec.ts`
  et al.) are **not** written — this repo still has no test runner.

---

*Plan authored against the organized source docs in `OneDrive/Documents/IWL/ITRIX`.
Updated for the actual scaffold (Next.js 16 + Tailwind v4 + TypeScript + pnpm) and reconciled
with Master Technical Architecture v2.6 / Backend v6.0 / Surface 2 v5.0.*
