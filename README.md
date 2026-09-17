# itriX Staff Console

The internal dashboard for the itriX team — a deliberate rethink of the old
71-page Surface 2 into eight staff-shaped destinations. Organized by job, not
by spec surface: *what needs me now* → *work the thing* → *check the numbers*.

| Destination | What it is |
|---|---|
| **Today** | One prioritized work queue: approvals, overdue follow-ups, waiting conversations, new leads, NDAs in flight, support heads-ups, files to review. Scope toggle for multi-staff use. |
| **Leads** | Filterable list + the pipeline board; lead detail carries deal signals, notes, history, conversations, and the NDA panel on one page. |
| **Conversations** | Live board of AI conversations (Active / Waiting / Quiet), full transcripts (held drafts visible), step in as a person. |
| **Approvals** | Messages the AI won't send without a human OK — approve, edit-then-approve, reject with reason; L4/L5 need a second OK. |
| **Customers** | Health board (worst first) + accounts, and evaluations/PoCs editable in place. |
| **Insights** | The one analytics page: funnel, response time, trend, breakdowns. |
| **Library** | Message templates (`{{variables}}`) and the internal-only buyer profiles. |
| **Settings** | Profile, appearance (light/dark/system), read-only team roster. |

The old dashboard is retired to
[itrix-dashboard-legacy](https://github.com/Nrad8394/itrix-dashboard-legacy);
its governance admin pages (claim-card editor, audit) live only there.

## Run it

```bash
cp .env.example .env.local   # required — see the comments inside
npm install
npm run dev                  # http://localhost:3002
```

- **Demo mode** (`NEXT_PUBLIC_DEMO_MODE=true`): the whole app runs against
  in-browser MSW mocks that speak the real backend's exact contracts. Sign in
  with `demo@example.com` / `demo1234`. No backend needed.
- **Real backend**: set `NEXT_PUBLIC_DEMO_MODE=false` and point
  `NEXT_PUBLIC_API_URL` at the Django host (dev: `http://localhost:8000` —
  host only; `/api/v1` is supplied by the endpoint paths and stripped if you
  paste it anyway).

`npm run check` = lint + typecheck + unit tests. `npm run test:e2e` runs the
Playwright smoke against demo mode.

## How it talks to the backend

Direct axios calls with a Bearer team-JWT (`lib/api/client.ts`: refresh mutex,
per-request base-URL resolution). The wire contracts were extracted from the
Django source and validated live — the traps are documented where they're
handled:

- error envelope `{error:{detail,code,fields?}}` → `lib/api/errors.ts`
- three envelope families (bare arrays, `{results,count}`, full pagination),
  path-segment follow-up scopes, cockpit paths → `lib/today/api.ts`
- lead actions return full detail but with one-write-stale prefetched
  relations → `lib/leads/hooks.ts`
- held message bodies are blank on the console plane (transcript shows them) →
  `lib/conversations/types.ts`

Staff-facing language is a design rule: no spec jargon in the UI (claim level
→ "Risk level", personas → "Buyer profiles", journey codes →
`copy.status.journeyLabel`). Brand: itriX mathematical-glass light theme
matching itrix.co.kr, with a derived dark theme (`app/globals.css`).

## Two sites, one clock

The business runs on Korean time; the staff do not all sit in Korea. So there
is one operating clock — **KST** — and it is named wherever a time is shown
(`lib/time/zones.ts`). The top bar carries it, with the viewer's own zone and
its offset beside it when they differ. Every timestamp renders through
`<Stamp>` (`components/shared/timestamp.tsx`): relative text by default,
exact KST instant on hover, machine-readable in the DOM either way.

Handing a lead to *another person* is a team-leader action; self-claim stays
open to everyone. Both policies live in one file, `lib/auth/roles.ts` — the
backend has no TEAM_LEAD role, so "team leader" currently means ADMIN, and
that mapping is a single edit when it changes.

## Two languages

English and Korean (`lib/i18n/`). English is the source of truth; Korean is a
full translation of it, covering every screen — the shell, all seven
destinations, settings, login and the error pages.

Switch language from the top bar (next to the theme toggle), from
Settings → Appearance, or from the command palette (Ctrl+K, "Language").

The preference lives in a **cookie** (`itrix-locale`), not localStorage. That
is the whole design: `app/layout.tsx` reads it while it is still a Server
Component, so the HTML that leaves the server already has the right `lang`
attribute and the right strings. Surface 1 stores its locale in localStorage
and pays for it — an English first paint that flips after hydration, and
`:lang(ko)` CSS that never applies to the first frame.

To add a user-facing string:

1. Add the key to `lib/i18n/messages/en.ts`.
2. Add it to `ko.ts`. **The build fails until you do** — `ko` is annotated
   `: Messages`, which is the only translation-coverage check this stack has.
   Never silence it with `as Messages`.
3. Read it with `useCopy()` in a Client Component, `await getCopy()` in a
   Server Component.

Interpolation is a plain function (`nothingMatches: (q) => …`), not an ICU
template, so TypeScript checks the call site. Brand and protected identifiers
— itriX, ALPHA Compute, NDA, PoC, KPI, KST — are never translated.

Three things stay in English on purpose:

- the **operating clock** (en-GB, 24-hour, so "15:04 KST" reads identically in
  Seoul and Nairobi — only relative times localize)
- `app/global-error.tsx`, which replaces the root layout and so renders outside
  every provider
- **backend-supplied prose** — account health `reasons`, next-action text,
  activity descriptions. These arrive already-written from the API; translating
  them is a backend concern, not a frontend one.

Wire values from the API are never translated in place either. `LeadStatus`,
journey states and funnel stages stay as the API sends them and are mapped to
display text in `copy.status.*` / `copy.insights.funnelStage`, so the contract
and the wording stay separable.

Built on [Fronted_Web_Template](https://github.com/Nrad8394/Fronted_Web_Template);
its conventions are documented in `PATTERNS.md`.
