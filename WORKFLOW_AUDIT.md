# Workflow Audit — Surface 2 v3.0 operator flows

Living record of end-to-end workflow audits. Method: recon → verify-don't-trust →
fix only genuine reachable bugs → verify in a runtime → document.

---

## 2026-07-07 · Batch 1–3: agent drafts, approvals, console, cockpit, journey, governance

**Scope.** The newly built operator surfaces — console, agent approvals, agent runs,
sales cockpit, RunAgentMenu, journey monitor, governance claim-cards/audit, pitch
analytics. Complaint: *"the pages exist but the flows around them are incomplete."*
That was accurate: the pages rendered, but the three hops that make them a workflow
(draft→queue, queue→thread delivery, thread-held→queue) did not exist.

**Verified in the runtime** (`pnpm dev`, mock mode) by driving each flow over HTTP as
Admin / Assessment Team / read-only users, not just by typechecking.

### Real fixes

| # | Defect | Fix | Severity |
|---|---|---|---|
| 1 | `runAgent()` never created an approval — the "queued for approval" toast was false; the queue never showed the draft | `mocks/cockpitDb.ts` now calls new `approvalsDb.queueDraft()`; returns `approvalId` | High |
| 2 | `runAgent()` never recorded a run — `/agents/runs` was a static fixture despite claiming "every invocation" | new `agentRunsDb.recordAgentRun()`, called on every run | High |
| 3 | Approving a draft delivered nothing — `approvalsDb` and `conversationsDb` were never linked | new `conversationsDb.deliverApprovedMessage()`, called on final approval; replaces the held placeholder | High |
| 4 | A held team message (claim L3+) was stuck forever — it never entered the approval queue | console message route now calls `queueDraft()` when `held` | High |
| 5 | **Permission hole**: the console send route had no elevation gate (unlike the run/approval routes), so a read-only operator could message a client thread | `canAdminGovernance` gate added → 403 | High |
| 6 | `edit` silently **approved and delivered** the draft (fell through into the approver branch) | `edit` now saves `finalBody` and returns; approval stays pending | High |
| 7 | Two-approver (L4/L5) drafts were **permanently un-approvable** — only one elevated mock user existed, and self-second-approval is (correctly) refused | added `kang@itrix.example` (Assessment Team) | High |
| 8 | Every "View lead" link 404'd — fixtures used `lead-1`, real mock leads are `l001` | corrected ids in `approvalsDb`, `agentRunsDb` | High |
| 9 | No path back to context: approvals had no conversation link; conversations had no lead | added `ApprovalRequest.conversationId` + `Conversation.leadId` (both optional — backend doesn't serve them yet) and links in `DraftCard`, `LiveThread`, `AuditTrailTable` | High |
| 10 | **Cockpit next-best-action was a dead end** — text only, no way to act. The vocabularies differ (`send_account_invite` → event `gate_invite`), so no naive mapping existed | new `NEXT_ACTION_EVENT` map + `NextActionButton`, which only renders when the event is legal from the current state and the user is elevated | High |
| 11 | Advancing the journey left the cockpit stale (old state + old recommendation, inches apart on screen) | `useAdvanceJourney` now invalidates `["cockpit", id]`, `["cockpit-nba", id]`, `["journey-overview"]` | High |
| 12 | Approve/edit/reject invalidated only `["approvals"]` → the thread and run log stayed stale | also invalidates `["conversations"]`, `["conversation"]`, `["agent-runs"]`, `["governance-audit"]` | Med |
| 13 | "Approve & deliver" lied on a pending L4/L5 draft — the first approval delivers nothing | label is now `Approve (1 of 2)` / `Second approve & deliver`; toast matches | Med |
| 14 | Reject took no reason and no confirmation — one click irreversibly rejected an L5 LOI with an empty audit reason | inline confirm + required reason, surfaced in the audit trail | Med |
| 15 | `ClientLinkCard` claimed "Linked" for any CLIENT/ENGAGED lead even with `lead.client == null` | distinguishes *linked* from *expected but not linked* | Med |
| 16 | `BreadCrumb` garbled id segments (`/console/<uuid>` → "550E8400 E29B …") despite its own comment claiming it skipped them | `isIdSegment()` → renders "Detail" | Med |
| 17 | Claim-card "Create" button was dead on empty required fields (silent `return`, no feedback) | `invalid` guard disables the button + inline message; applies to edit too | Med |
| 18 | No duplicate-key check on claim cards — keys govern approved wording | `claimCardKeyExists()` → 409 | Med |
| 19 | Claim-card edit page passed no `onDone`: no Cancel, and saving didn't navigate | `onDone` → router back to the list | Med |
| 20 | No `loading.tsx` on any new route; **no `error.tsx` anywhere in the app** | added `loading.tsx` ×8 and a `(dashboard)/error.tsx` boundary | Low/Med |

### Verified correct (no change needed)

- `pathTo()` slice indices in `journeyDb` are right for every target state (no off-by-one);
  `ARRIVED` early-returns, `DORMANT` has its own branch.
- `AdvanceControl`'s offered events match `ALLOWED_TRANSITIONS`, and the server re-checks.
  `ENGAGED` correctly reports "No further transitions".
- Held message bodies never leak: blanked in `postTeamMessage`, never rendered by
  `MessageRow`, excluded from the list preview.
- Reject correctly drops the card from the queue (`listApprovalQueue` filters status).
- Edit-then-approve keeps the edited text (`finalBody || draftBody`).
- The two-approver rule itself was logically sound — only unreachable (fix #7).
- Loading/empty/error states already existed *in-component* on every list surface.
- Server-side RBAC on the claim-card POST/PATCH and journey advance was already enforced.
- `SidebarLink` active state is correct for all sub-routes.

### False positives caught

- Recon proposed cross-linking the audit trail using `ApprovalRequest.leadId` "which is
  populated in the mock" — but those ids (`lead-1`) were **invalid** and would have 404'd.
  Fixed the data before adding the link (defect #8).
- Recon flagged `AgentRunResult`'s `"pending"` branch as dead code. It is defensive: the
  real backend returns `pending`. Left as-is.
- Recon flagged `getStateDistribution` as O(n²)-ish waste. True but not a bug; `n` is the
  mock lead count. Not changed.

### Deferred — needs a human decision

- **`/c/[token]` client-page preview.** `RevealLog` ticks "① Client page" green but there
  is no way to view what the visitor sees; Surface 1 owns that route and no token/URL is
  exposed to the dashboard. Product call: expose a preview URL, or leave the reveal as
  status-only.
- **Backend parity for the two new fields.** `conversationId` on `ApprovalRequest` and
  `leadId` on `Conversation` are typed optional and populated only in mock mode. The Django
  serializers don't expose them, so the links silently disappear in real mode. Needs a
  backend change (`ApprovalRequestSerializer`, `ConversationSummarySerializer`).
- **`journey/overview` in real mode** hardcodes `total: 0`, so the Overview distribution
  widget renders as `null` in production forever. Needs a real backend endpoint.
- **Cockpit richer read + agent-runs** exist on the backend only as I extended them; those
  backend changes remain uncommitted/undeployed.
- **Read-only users still get an editable claim-card form** that 403s on save. Whether to
  show a read-only detail view instead is a product/UX call.

### Runtime evidence

Driven over HTTP against `pnpm dev` (mock mode), then the server was stopped and scratch
files removed:

- run `proof` on `l001` → queue grows 3→4, new `apr-4-proof` carries `leadId l001` +
  `conversationId conv-1`.
- approve it → `conv-1` grows 2→3 messages, new message `agent | approved`; card leaves
  the queue.
- read-only user POST to `conv-1` → **403**; Admin → 201.
- edit a pending draft → status stays `pending` (no delivery).
- L5: Admin → `awaiting_second`; Admin again → **409**; Kang → `approved`.
- held L4 team message → appears in queue as `apr-5-concierge`.
- duplicate claim-card key → **409**.
- journey `qualify → reveal_client_page → gate_invite`: cockpit state and NBA follow
  exactly (`await_diagnosis → reveal_client_page → send_account_invite → await_claim`),
  reveals fire, and an illegal `engage` from `INVITED` → **409**.

Gate: `pnpm lint` ✅ · `pnpm exec tsc --noEmit` ✅ (one real `prefer-const` caught and fixed).

---

## 2026-07-22 · Batch 4–5: Console rows, and a contract sweep of every screen

**Scope.** Triggered by a production screenshot of `/console` in which *every*
conversation row rendered a bare `—` where the last message should be. Batch 4 is that
row. Batch 5 sweeps every dashboard proxy path against the real backend URL map
(`engomondiii/itrix-backend` @ `07a7ad8`) — a screen is broken if its endpoint is
wrong, so this is the systematic form of "review all screens".

**Method note.** Recon was done by reading both sides of the contract directly rather
than by delegating, so there was no recon layer to false-positive. The one false
positive below was my own path-normalising, caught the same way — by reading the code.

### Real fixes

| # | Defect | Fix | Severity |
|---|---|---|---|
| 1 | Console rows rendered `—` for three completely different states: no messages, messages held at the governance gate, and no data. On a governance console the middle case is the one an operator is looking for — a turn pending approval, possibly with a visitor waiting — and it was indistinguishable from an idle conversation | new `conversationPreview()` splits the states using `lastMessageAt`; the row now shows an **"Awaiting approval"** badge and says nothing was delivered | High |
| 2 | The row rendered `unreadCount` as "**N new**". On the team plane the backend resolves that field with neither `client` nor `user`, so no `last_read_at` filter applies and it is the count of *approved* messages, not unread ones — a mislabelled number, not a missing one | relabelled to "N approved"; the comment records why the honest label is not "new" | Medium |

Root cause of #1 is worth stating plainly: `lastPreview` comes from
`deliverable_messages()`, which admits only `AUTO_APPROVED`/`APPROVED` turns. That is
the **client-facing** filter, and the team console inherits it (the serializer's own
docstring says *"a row in the portal conversation list"*). An empty preview therefore
means "nothing approved", never "nothing happened".

### Verified correct (no change needed)

- **All eight lead actions** the detail page posts — `assign`, `status`, `note`,
  `meeting`, `escalate`, `nda`, `paid-eval`, `poc` — exist as `@action` methods on
  `LeadViewSet`. The action buttons on the lead screen are wired correctly.
- **Follow-up** `{id}/{complete|snooze|dismiss|reschedule}/` — all four exist; the
  dashboard only ever sends three of them.
- **Notifications** `{id}/read/` — exists (`@action(detail=True) def read`).
- **Settings → Profile** — `/auth/profile/` is mounted and correct.
- **Governance** claim-cards (list + detail) and audit, **agents** approval-queue /
  approval action / runs / `{key}/run`, **console** conversations + message,
  **conversations** `{id}`, **cockpit** leads + next-action, **journey** leads /
  advance / overview, **analytics** + analytics/pitch, **personas** list + detail —
  every one matches a real backend route.
- The **`—` no longer appears anywhere** in the console list; each state has words.

### False positives caught

- *"`/personas/{id}` is missing its trailing slash — Django `APPEND_SLASH` will break
  the POST."* Not real. The call is `` `/personas/${qs}` `` on the **list** route,
  where `qs` is a query string (`""` or `"?family=…"`), so it resolves to `/personas/`
  or `/personas/?family=…`. The artefact came from my own path-normalising sed
  collapsing `${…}` to `{id}`, not from the code. Reading the actual line settled it.
- Same cause: `/agents/approval/{id}/{id}/`, `/follow-up/{id}/{id}/` and
  `/nda/{id}/{id}/` all looked like doubled ids. They are `{id}/{action}` pairs and
  match the backend exactly.

### Deferred — needs a human decision

1. **`apps.settings` is never mounted.** `apps/settings/urls.py` defines exactly
   `sla/` and `notifications/` — precisely the two paths the dashboard calls — and the
   app is in `INSTALLED_APPS`, but `api/v1/urls.py` has no `path("settings/", …)`.
   **Settings → SLA** and **Settings → Notifications** therefore 404 in real mode.
   One-line backend fix. **Deliberately not patched dashboard-side:** the dashboard is
   calling the right path, and adding a `notImplementedOnBackend` guard would go stale
   the moment the route is wired. Written up in `../BACKEND_GAPS.md`.
2. **The console preview is computed with client-plane visibility.** An operator cannot
   see the latest turn of a conversation whose turns are all pending — the exact
   conversation that needs attention. Needs a team-plane preview
   (`all_messages().last()`), which is a backend serializer decision, not a frontend
   one. Batch 4 fix #1 makes the *state* visible; it cannot recover the text.
3. **No per-operator read state on the team plane.** `unreadCount` cannot mean "unread
   for you" until console participants carry a `user` and a `last_read_at`. Fix #2
   stops the UI claiming otherwise.

### Runtime evidence

`conversationPreview` exercised directly under `node --experimental-strip-types` across
five cases — approved turn, held-at-gate, genuinely empty, `null` timestamp off the
wire, and preview-without-timestamp — all pass, including the happy path. The stub
backend confirmed the proxy delivers all three shapes end to end
(`preview='…'` / `preview='' + lastMessageAt` / `preview='' + no timestamp`).
Throwaway script and scratch route both removed; `.env.local` restored to mock mode.

Gate: `pnpm lint` ✅ · `pnpm typecheck` ✅ · `pnpm build` ✅

---

## 2026-07-22 · Batch 6: Lead-detail actions — stale cross-screen caches

**Scope.** The five action buttons on the lead detail rail (Book meeting, Mark NDA
required, Request paid evaluation, Mark PoC candidate, Escalate) and the two inline
controls (status, owner), traced through `useLeadActions` to what each one actually
mutates and which *other* screens read that state.

### Real fix

| # | Defect | Fix | Severity |
|---|---|---|---|
| 1 | `useLeadActions` invalidated only `["lead"]` and `["leads"]`. But **four actions move `lead.status`** — which the **pipeline board** groups by and the **NDA list** filters on (`listNda` selects `NDA_LEAD_STATUSES`) — and two more create a deal record their own screen lists. With a 30s `staleTime`, marking a lead NDA-required and opening Pipeline showed it still in its old column | per-action invalidation: status-movers refresh `["pipeline"]`+`["nda"]`; eval/poc also refresh `["evaluations"]`/`["pocs"]`; assign refreshes `["pipeline"]` (cards show the owner). `escalate`/`addNote`/`bookMeeting` stay lead-local — they touch nothing off-screen | Medium |

### Verified correct (no change needed)

- **Not a permission hole.** None of the eight lead-action routes gate role
  dashboard-side, but every `@action` on `LeadViewSet` carries
  `[IsAuthenticated, IsDashboardUser, IsNotViewer]` — a read-only operator is refused
  one layer down, on the authoritative side. (This is the recon's classic false
  positive — "unguarded action" defended by the layer below — so it was checked
  before touching anything.)
- **`escalate` genuinely is lead-local** — it only appends a `LeadActivity`, changes
  no status and creates no record, so it correctly needs no extra invalidation.
  Reverting the instinct to invalidate it wholesale is the method working.
- Per-action keys chosen over blanket invalidation on purpose: a note or an
  escalation must not refetch the whole pipeline board.

### Runtime evidence (mock mode, driven over HTTP as Admin)

- `POST /api/leads/{id}/nda` on a `Meeting Booked` lead → `status: NDA`, and the lead
  went from **absent to present** on the NDA screen (`onNdaScreen: False → True`).
- `POST /api/leads/{id}/poc` on a `Closed` lead → pipeline column **`Closed → PoC`**
  AND a PoC record appeared on the PoCs screen. Both are cross-screen effects the old
  two-key invalidation left stale.

Gate: `pnpm lint` ✅ · `pnpm typecheck` ✅ · `pnpm build` ✅

---

## 2026-07-22 · Batch 7: Pipeline board — the move menu

**Scope.** `usePipeline` / `useMoveLead` and the per-card "Move to stage" menu
(`PipelineCard.tsx:73`), which offers every value in `LEAD_STATUSES` — including NDA,
Evaluation, PoC and Licensed — as a one-click target.

### Real fix

| # | Defect | Fix | Severity |
|---|---|---|---|
| 1 | `useMoveLead` invalidated only `["pipeline"]` and `["leads"]`. But the **NDA list** is derived from status (`listNda` selects `["NDA","Evaluation","PoC","Licensed"]`), and the menu can move a lead straight into NDA. Moving a card into the NDA column left the NDA screen showing the stale set for its 30s window | added `["nda"]` invalidation | Medium |

### Over-reach caught and reverted (the method working)

The first version of this fix also invalidated `["evaluations"]` and `["pocs"]`, on
the assumption — carried over from Batch 6 — that those screens are status-derived
too. **They are not.** `/api/pocs` returns `pocDb()` and `/api/evaluations` returns
`evalDb()`: Evaluation and PoC *records*, created only by the dedicated
"Request paid evaluation" / "Mark PoC candidate" actions, which `useLeadActions`
already refreshes.

Caught by the runtime rather than by reading: after moving a lead to `PoC`, its
pipeline column changed to `PoC` and `onPoCs` stayed **False**. Both keys removed —
shipping them would have been two needless refetches on every pipeline move, justified
by a comment that was simply wrong.

Batch 6 is unaffected and stands: `requestEvaluation` / `markPoC` *do* create records
(`createEvaluationForLead` / `createPoCForLead`), so refreshing those lists there is
correct.

### False positives caught

- *"`/api/nda` is broken — the dev log shows `TypeError: components.ComponentMod.handler
  is not a function`."* Not real. **Port 3001 was held by `wslrelay.exe`**, a WSL port
  forward, so half the verification traffic was hitting an unrelated service (its 401
  body was `{messageId: "auth.unauthorized", traceID: …}` — not this app's
  `{detail: …}` shape). Re-running the dashboard on port 3021: `/api/nda` → **200**.
  The error was HMR fallout from the port clash.
- *A typecheck failure in `.next/dev/types/validator.ts`.* Generated file, written by
  the dev server concurrently with `tsc`. Clean after stopping dev and removing
  `.next/dev/types`.

### Runtime evidence (mock mode, port 3021, driven as Admin)

`POST /api/leads/{id}/status {"status":"NDA"}` — the exact call the move menu makes —
on a `Meeting Booked` lead: pipeline column `Meeting Booked → NDA`, and NDA-screen
membership **False → True**. A subsequent move to `PoC`: column `NDA → PoC`, NDA
membership stayed True (correct — PoC is in `NDA_LEAD_STATUSES`), PoCs screen stayed
False (correct — no record was created).

Gate: `pnpm lint` ✅ · `pnpm typecheck` ✅ · `pnpm build` ✅

---

## 2026-07-22 · Batch 8: NDA transitions, then a systematic sweep that closed the class

**Scope.** Started on `useNda`'s five mutations. Having now found the same
cache-staleness class in three consecutive batches (6, 7, 8), the batch pivoted
mid-way from hook-by-hook to an exhaustive sweep: *every* mock function that calls
`setStatus` — i.e. every code path that can move a lead on the pipeline board — cross
referenced against which hooks invalidate `["pipeline"]`.

### Real fixes

| # | Defect | Fix | Severity |
|---|---|---|---|
| 1 | `useSignNda` — signing an NDA calls `setStatus(leadId, "Evaluation")` (`ndaDb.ts:181`), moving the card NDA → Evaluation. The hook refreshed `["leads"]`/`["lead"]` but not `["pipeline"]`. Its own comment said *"Signing advances the lead's pipeline status"* — the author knew, and missed the key | `["pipeline"]` added, **for signing only** — `prepare`/`send`/`decline`/`expire` write the NDA override and leave status alone | Medium |
| 2 | `useEvaluation().setStatus` — marking an evaluation **lost** moves the lead Evaluation → Closed (`dealsDb.ts:120`), a column change that also drops it out of `NDA_LEAD_STATUSES` | `["pipeline"]` + `["nda"]` | Medium |
| 3 | `usePoC().setStatus` — **completed** licenses the lead (PoC → Licensed) and **cancelled** closes it (PoC → Closed) (`dealsDb.ts:231,238`) | `["pipeline"]` + `["nda"]` | Medium |

### The sweep — this bug class is now exhaustively closed

`setStatus` has exactly **four** call sites in the mock layer, plus the lead's own
mutators. All are now covered:

| Call site | Reached from | Covered in |
|---|---|---|
| `leadsDb` `setStatus`/`markNda`/`markEvaluation`/`markPoC` | lead-detail actions | Batch 6 |
| `usePipeline` move menu | pipeline card | Batch 7 |
| `ndaDb.ts:181` (sign) | NDA screen | Batch 8 |
| `dealsDb.ts:120` (evaluation lost) | Evaluations screen | Batch 8 |
| `dealsDb.ts:231,238` (PoC completed/cancelled) | PoCs screen | Batch 8 |

Every other mutation hook — `useFollowUp`, `useReporting`, `useTemplates`,
`useSettings`, `useTeam`, `useApprovals`, `useClaimCards`, `useConsole`,
`useNotifications`, `useCockpit`, `useAttachments`, `useSupport`, `useEmail` — calls
`setStatus` nowhere, so none of them can move a lead and none needs the invalidation.
**Verified by grep over the whole mock layer, not by sampling.**

### Verified correct (no change needed)

- `decline` and `expire` genuinely do not move the lead — `mergeOverride` only. Proven
  in the runtime: expiring an NDA on a lead at `NDA` left its column at `NDA`. Not
  invalidating the board for them is correct, not an oversight.
- The `setPoCStatus` guard `lead.status !== "Licensed" && !== "Closed"` works: firing
  `completed` on an already-`Licensed` lead changed nothing. The first verification run
  looked like a failed proof and was actually the guard doing its job — the
  precondition had to be set up before the transition was observable.

### False positive caught

- *"The build is failing — `Error while requesting resource` ×3."* Not real.
  `next/font/google` fetches Space Grotesk, Inter and IBM Plex Mono at build time and
  the requests were flaky; the same build reported `✓ Compiled successfully`. Worth
  knowing as a **deployment fragility** (the build needs network for fonts) but it is
  not a code defect and was not "fixed".

### Runtime evidence (mock mode, port 3021 — 3001 is held by `wslrelay.exe`)

- Sign: lead at `NDA` → after `POST /api/nda/{id} {"action":"sign"}` column became
  **`Evaluation`**.
- Expire: lead at `NDA` → column stayed **`NDA`**.
- PoC completed: column `PoC` → **`Licensed`**, NDA membership stayed `True`
  (correct — Licensed is in `NDA_LEAD_STATUSES`).
- PoC cancelled: column `PoC` → **`Closed`**, NDA membership **`True` → `False`**.

Gate: `pnpm lint` ✅ · `pnpm typecheck` ✅ · `pnpm build` ✅

---

## Batch 9 — destructive actions: confirmation and role gating

Deliberately a **different bug class** from batches 6–8, which had converged on one
finding (status-moving mutations not invalidating dependent caches). Batch 8 closed
that class exhaustively, so continuing to probe it would only have manufactured work.

### Verified correct (no change needed)

- **Every destructive action is confirmed.** All five DELETE-issuing call sites route
  through `ConfirmDialog`/`AlertDialog`: PoC risk, report, report section, team member,
  template. `deleteReport` initially looked like dead code — a grep of
  `components/reporting` found nothing — but the affordance lives at
  `app/(dashboard)/reporting/[reportId]/page.tsx:79`, gated by a confirm and followed
  by a redirect. Searching for the api-layer name rather than the hook's destructured
  property (`remove`) is what hid it.

### False positive caught (and why)

- *"Reporting, templates and pocs have no write gate — a VIEWER can delete."* **Wrong.**
  Class-level `permission_classes = [IsAuthenticated, IsDashboardUser]` is only the
  **read** default; all three override `get_permissions()` and return `IsNotViewer()`
  for write actions (`apps/reporting/views.py:48,59`, `templates_library/views.py:35`,
  `pocs/views.py:50`). Grepping `permission_classes` alone is not sufficient to
  conclude anything about a DRF viewset — the dynamic override wins. Same shape as the
  Batch 6 false positive about lead actions.

### Real finding 1 — admin-only affordances were not gated

Two backend routes are gated `IsAdminOrReadOnly`, i.e. literally `role == ADMIN`:

- `team` — **all** writes (`apps/team/views.py`)
- `templates_library` — the `destroy` action only

That is **stricter** than the `isElevated` tier (`{Admin, Assessment Team}`) the existing
`canControlJourney` / `canAdminGovernance` helpers mirror, so neither could be reused.
Added `canAdministerTeam` (ADMIN only) and gated the invite / edit / remove-member
affordances and the template Delete item.

Symptom this removes: a non-admin operator — **including the default local mock user,
Naomi, who is "Success Team"** — saw "Remove member", confirmed a destructive dialog
that says *"will lose dashboard access. This cannot be undone."*, and got a 403.

Template *create* and *edit* are deliberately left ungated: the backend guards those
with `IsNotViewer`, and Surface 2 has no VIEWER display role to mirror it with.

### Real finding 2 — team create/remove have no backend counterpart

`TeamMemberViewSet` declares `http_method_names = ["get", "patch", "head", "options"]`
and carries neither `CreateModelMixin` nor `DestroyModelMixin`. The dashboard's
`POST /api/team` and `DELETE /api/team/{id}` proxy branches forwarded anyway and would
return a bare DRF 405 that the UI could only show as a generic failure. Both now use
`notImplementedOnBackend`, so they degrade as "not served by the connected backend yet"
like the other unimplemented routes. Recorded in `BACKEND_GAPS.md`.

### Runtime evidence (mock mode, port 3021)

- `/api/auth/me` → `{"role":"Success Team"}` — the default local session is **not**
  admin, so the new gating is live by default rather than dormant.
- `/settings/team` → **200**, `/templates` → **200**: adding `useAuth` to a component
  rendered per-row in a list introduced no render regression.
- Mock branches untouched: `POST /api/team` → created `u-new-1`;
  `DELETE /api/team/u-new-1` → `{"ok":true}`.

**Stated limit:** `useAuth` resolves client-side, so the role-dependent branch cannot be
observed over HTTP and the Chrome extension is not connected. The gating itself is
verified by types, build and code path, not by seeing the button disappear. The initial
pre-hydration render is fail-closed (`user` undefined → hidden), so there is no flash of
a forbidden control.

Gate: `pnpm lint` ✅ · `pnpm typecheck` ✅ · `pnpm build` ✅
