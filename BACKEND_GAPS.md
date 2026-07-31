# BACKEND_GAPS.md — dashboard ↔ backend gap register (second edition)

**Written against:** `itrix-backend 89541f6` · `itrix-dashboard 51e39b0`
**Verified how:** not by reading documents — the backend was run locally
(sqlite, `manage.py migrate && manage.py seed_demo --flush`) and every
dashboard proxy was driven against it with a real team JWT on 31 July 2026.
Everything below is what the wire actually did.

The first edition of this register was folded into Backend v7.0 and closed by
v7.1 Phases 1–3. This edition records what the v7.1/v7.2 documents claim
shipped but the tree does not carry, plus the contract drift found live.
Same convention as before: **the tree binds, not the document.** Where the
shipped tree merely *named* something differently, the dashboard adapted and
no backend work is needed — those are recorded in §3 so nobody "fixes" them
back.

Companion: Surface 2 v7.1 §03 (the 501 switch-on plan). Every route in §1
currently answers `501 { detail, unimplemented: true, expectedEndpoint }`
from the dashboard proxy, and `rg "notImplementedOnBackend" src/app/api` is
the always-current checklist.

---

## 1 · Routes the documents say exist and the tree does not mount

Each row unblocks a built, styled, fixture-tested dashboard view the moment it
lands. Ordered by operator value.

| # | Missing route | Spec | What it unblocks | Notes |
|---|---|---|---|---|
| 1 | `POST cockpit/support/queue/{id}/assign/` · `resolve/` · `escalate/` | Backend v7.0 §7.3 (P2) | Working a support request — today the queue is read-only | A resolution is a team→customer message and must pass the claim checker: a support question may never be answered with a commercial claim (v7.0 §7.5) |
| 2 | `GET cockpit/customers/{id}/next-action/` + `POST` (logged override) | v7.0 §7.3 (P3) | Customer-plane NBA + `CommercialOverrideDialog` | The lead-plane NBA (`cockpit/leads/{id}/next-action/`) is mounted; the customer-plane one is not. Must route through the same `nba_precedence` as the portal. The POST records an exception and must NOT clear the suppression |
| 3 | `GET cockpit/threads/coverage/` | v7.0 §7.4 (P2) | Loop-productivity page (book-wide) | Per-thread coverage (`cockpit/threads/{id}/coverage/`) is mounted; the across-the-book read is not. This is the "is the question bank weak?" signal |
| 4 | `GET cockpit/customers/outcomes/` | v7.0 §7.3 (P3) | Outcomes across the book | |
| 5 | `GET success/reviews/` | v7.0 §7.3 (P3) | Success-review schedule with worst-first agenda | |
| 6 | `GET journey/migration-report/` | v7.0 §7.3 (P1) | Migration report panel | v7.0 says drop it if `0003_migrate_engaged_split` already ran — if so, say so and the dashboard route gets deleted instead of unguarded |
| 7 | `GET cockpit/accounts/` | Surface 2 v7.1 §03 | The `/accounts` page — "Accounts · no conversation yet" | The silent self-serve population (R70). Row shape the dashboard expects: `clientId, leadId, email, fullName, organization, accountOrigin, emailVerified, emailVerifiedAt, registeredAt, lastSignInAt`, in a `{ results, count }` envelope |
| 8 | `POST cockpit/accounts/{id}/resend-verification/` | Surface 2 v7.1 §04.9 | The reasoned resend | Reason REQUIRED at the API (409 without), logged with operator identity, rate-limited per address. The dashboard already enforces the reason on its side too |

## 2 · Fields the dashboard reads the moment a serializer exposes them

The models carry these; the serializers do not (verified live — key absent
from the JSON). No dashboard change needed when they appear; the badges and
columns render on arrival.

| Field | Where it's missing | Dashboard consumer |
|---|---|---|
| `leadSource` | lead list + detail serializers (`Lead.lead_source` exists since `20d2570`) | `LeadSourceBadge` on the lead table and detail (S2 v7.1 §04.7) |
| `accountOrigin`, `emailVerified`, `emailVerifiedAt` | `cockpit/customers/` rows | `AccountOriginBadge` + `VerificationBadge` on the health board and customer detail |
| `shell`, `journeyNumber`, `stateKey` on `journey/leads/{id}/` | — **PRESENT and working** ✅ | recorded here only because the first edition listed it; it is closed |

## 3 · Naming drift — already adapted, do NOT "fix" back

The shipped names bind (the same rule Backend v7.2 §14 applies to
`client/auth/*`). The dashboard proxies now call these; renaming them to match
the documents would break the deployed dashboard to satisfy a PDF.

| Document says | Tree serves | Status |
|---|---|---|
| `GET support/queue/` (+ `{id}/`) | `GET cockpit/support/queue/` (+ `{id}/`) | adapted ✅ |
| `GET cockpit/attachments/queue/` | `GET cockpit/attachments/` (the bare name IS the row-level queue once the aggregate moved to `analytics/attachments/`) | adapted ✅ |

## 4 · Contract drift on routes that DO exist

### 4.1 `shell.for_subject` is snake_case, and the alias window already closed

`journey/leads/{id}/` serves the shell as `shell_mode`,
`conversation_rail_sections`, `content_pane_sections`, a snake_case
`conversation_header` — while the cockpit envelopes (`healthClasses`,
`matchedTextVisible`) are camelCase. `sidebar_sections` is already absent
(the v7.1 Phase 3 alias removal ran).

The dashboard normalises at the boundary and reads **both** casings, so
nothing is broken — but one convention should win platform-wide, and v7.0 §2
("the backend already returns camelCase… nothing changes that") currently
describes an intention, not the wire. If the shell is camelised later, the
dashboard needs no change (camelCase wins in its normaliser).

### 4.2 `cockpit/streaming/guard-hits/` — thinner than its spec

Shipped envelope: `{ results, count, matchedTextVisible, interpretation }`.
Shipped row: `id, kind, category, pattern, agentKey, plane, journeyState,
threadId, at` (+ `matchedText`/`matchedTextNotice` for ADMIN/ASSESSMENT — and
the role filter with the key **absent** for everyone else is verified working;
good).

Missing vs Backend v7.0 §3.2, rendered by the dashboard the moment they
appear (fields are typed optional and the UI omits their sections until then):

- per row: `threadTitle`, `discardedChars`, `requestedClaimLevel`,
  `allowedClaimLevel`, `matchedPass` (`"raw" | "normalized"` — which matcher
  pass caught it; the marker-normalised pass shipped in `03afab9`, so the
  fact exists)
- on the read: `guardHitRate` (halts per 100 streamed turns — the drift
  signal), envelope `downgrades`, `blocking` approvals with visitor wait

### 4.3 The v7.1 row-level rows are THINNER than the v7.0 §3.1 shapes — adapted, crash fixed (31 Jul 2026)

The §6 caveat bit in production: the seed creates no customers/threads/support/
attachments, so every row-level board was verified against its EMPTY state.
With real rows, four pages crashed to the route error boundary ("this page
failed to render") because the dashboard cast the wire unchecked and then
dereferenced nested objects the v7.1 rows do not carry:

| Route | Shipped row (tree) | Dashboard expected (v7.0 §3.1) |
|---|---|---|
| `cockpit/customers/` | flat: `outcomesOffPlan, blockingSupport, negativePulse, degradedDeployments` | `outcomes{…}`, `journeyNumber`, `stateLabel`, `openSupportCount`, `slaBreaching`, `adoptionPercent`, `nextReviewDate`, `owner`, `firstPaymentAt` |
| `cockpit/customers/{id}/` | the flat row + `contractState` | `{ customer, outcomes, deployments, plan, team, feedback, changes }` |
| `cockpit/threads/` | flat: `threadId, anonymous, company, journeyState, turnCount, visitorTurns, working` | `id`, `identityState`, `state`, `live`, `coverage{…}`, `loop{…}`, `attachments{…}`, `blocking`, `guardHalted`, `humanOwner` |
| `cockpit/attachments/` | flat: `attachmentId, scanVerdict, scanDetail, declaredMime…` | `id`, `scan{…}`, `threadTitle`, `identityState` |
| `cockpit/support/queue/` | `requestId`, status `in_progress\|waiting_on_customer`, urgency `critical` + separate `blocking` bool | `id`, status `assigned\|waiting`, urgency `blocking` as top rank |

The dashboard now normalises ALL of these at the boundary (`src/lib/api/
{customers,threads,attachments,support}Api.ts`): shipped names map to surface
names, shipped vocabularies map to rendered vocabularies, and fields the wire
does not carry stay `undefined` — the boards render "—" for them rather than
fabricating zeros. **Do not "fix" the dashboard back to the §3.1 cast.**

Still open backend-side (columns light up on arrival, no dashboard change
needed): the customer board's outcome counts/adoption/owner/SLA fields, the
thread board's coverage/loop/attachment overlay and `live`, the detail reads'
panel arrays (`outcomes, deployments, plan, team, feedback, changes`), thread
detail's `disclosureCeiling`, attachment rows' `threadTitle`/`identityState`/
`extraction`, and support rows' `body` on the queue row.

### 4.4 Older serializer gaps (carried from WORKFLOW_AUDIT.md, still open)

- `ApprovalRequest` → no `conversationId`; `Conversation` summary → no
  `leadId`. The approval-queue ⇄ thread ⇄ lead cross-links silently vanish in
  real mode.
- `journey/overview` — the dashboard hardcodes `total: 0` in real mode
  because no endpoint serves the distribution. The Overview widget renders
  null in production forever until one does.

## 5 · Capabilities with no route at all yet

| Capability | Why it matters |
|---|---|
| An audit-write for `matchedText` copy events | Surface 2 v6.0 §05: "copying is permitted but logged." The dashboard's reveal is collapsed/role-gated/labelled, but copy-logging is deferred — there is nowhere truthful to send the event, and a toast claiming "logged" over a no-op would be worse |
| Aggregate sign-in / registration telemetry | S2 v7.1 §08: if it exists at all it is aggregate and carries no address. Optional; the dashboard renders nothing today |

## 6 · Not a route — the demo seed

`seed_demo` predates the conversation spine: it creates leads, NDAs,
evaluations, PoCs and follow-ups, but **no threads, no customers (state 7+
with contracts), no support requests, no attachments, no guard hits**. Every
row-level cockpit surface therefore renders its empty state against the seed,
which reads as a fault the first time someone demos the thread board. Worth
extending the seed to the v7.x objects before any live demo of the oversight
surfaces.

---

*Maintained in itrix-dashboard. When a row above lands, the matching guard
comes off in `src/app/api/**` (usually a two-line change) and the row moves
to a ✅. The previous edition of this file was deleted once every row closed;
same plan here.*
