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
`lib/leads/journey-labels.ts`). Brand: itriX mathematical-glass light theme
matching itrix.co.kr, with a derived dark theme (`app/globals.css`).

Built on [Fronted_Web_Template](https://github.com/Nrad8394/Fronted_Web_Template);
its conventions are documented in `PATTERNS.md`.
