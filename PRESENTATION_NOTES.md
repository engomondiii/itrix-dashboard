# itriX Ops Dashboard — Presenter Notes

Brief, step-by-step walkthrough. One line of narration per stop, plus what to click.
Live app: `https://itrix-dashboard-production.up.railway.app/`

> **Framing line (say once, up front):** *"This is Surface 2 — the internal console.
> The public site listens to visitors; this is where our team sees what it heard,
> and decides what happens next. Nothing reaches a customer from here without a human."*

---

## 1. Login
- **Say:** internal-only, team accounts, JWT in an httpOnly cookie.
- **Do:** log in. Point out you land on Overview.
- **Note:** roles matter — *Admin* and *Assessment Team* can act; everyone else is read-only.

## 2. Overview
- **Say:** the daily "what needs me" screen — pipeline at a glance.
- **Show:** KPI tiles, then the **Journey distribution** widget (how many leads sit at each
  stage of the visitor journey).
- **Drill-down:** click through to Leads.

## 3. Leads → Lead detail *(the heart of the demo)*
- **Say:** every public-site review becomes a scored lead here.
- **Show:** list → filters → tier sub-pages (Tier 1–4). Open a **Tier 1** lead.
- **On the detail page, walk the right column top-to-bottom:**
  1. **Cockpit** — "reads the visitor": pain/gain, visitor type, readiness meters, pitch
     engagement. **Next best action** is a *button* — click it, the journey advances.
     *Say: these signals are internal-only and never reach the visitor.*
  2. **Journey** — the 8 states and the four reveals ①–④. Guarded **Advance** control.
  3. **Client account** — whether the lead was promoted to a portal client.
  4. **Run an agent** — Strategy / Buyer / Objection / Proof / Proposal.
     *Say: the agent drafts; a human approves. Run "Proof" → it queues for approval.*
- **Ask the audience:** *"Should the AI ever send this itself?"* → answer: no, that's §5.

## 4. Console
- **Say:** live client conversations — review, client page, portal — in one place.
- **Show:** a thread. Point out the three sender styles: client, **itriX assessment**
  (agent), **itriX team** (human). Send a message at claim level 1 → delivers.
- **Then:** send one at level 3 → it is **held**, not delivered. Segue to Approvals.

## 5. Agents → Approvals *(the governance story)*
- **Say:** anything above the auto-approve threshold waits for a human.
- **Show:** the draft you queued in §3. Note the claim level badge and cited chunks.
- **Do:** **Edit** (revises, does *not* send) → **Approve & deliver** → return to the
  Console thread and show the message now delivered.
- **Show a Level 4/5 draft:** button says **"Approve (1 of 2)"** — commercial and legal
  claims need a **second, different approver**.
- **Do:** Reject → a reason is required, and it lands in the audit trail.

## 6. Agents → Runs
- **Say:** every agent invocation is logged — which agent, claim level, governance verdict,
  AI vs deterministic, duration.

## 7. Governance → Claim-Cards & Audit
- **Say:** this is the source of truth the agents are checked against — approved wording.
- **Show:** a card (e.g. the ALPHA Core wording rule). Editing is Admin/Assessment only.
- **Audit:** every approval, edit and rejection, with its reason, linked back to lead/thread.

## 8. Analytics (+ Pitch)
- **Say:** funnel, leads, response time, bottlenecks — and **Pitch**: how the personalized
  pitch room performed. Internal telemetry only.

## 9. Pipeline / Follow-up / NDA / Evaluations / PoCs
- **Say:** the commercial ladder after qualification — move a lead through stages, honour
  the SLA clock, sign the NDA, run a paid assessment, then a PoC.
- **Show:** one card moving a stage; the overdue follow-up view.

## 10. Reporting, Templates, Settings
- **Say:** monthly reports; reusable email/eval/PoC/handoff templates; team, SLA,
  notifications, and the governance threshold.

---

## Closing line
*"The deterministic engine decides. The AI only re-words approved content. A human
approves anything that carries a claim. That's why we can move fast without over-claiming."*

---

## Anticipated questions
- **"Is this a chatbot?"** No. The public site has no bot; here, agents draft and humans send.
- **"Can the AI invent a number?"** No — claims resolve to approved Claim-Cards; L3+ needs
  citation and human approval; L4/L5 needs two approvers.
- **"What's live vs. mocked?"** The backend serves journey, cockpit, approvals, console,
  governance, runs and pitch. See "Known gaps" below for what still degrades.

---

## Known gaps — do NOT demo these
> The deployed dashboard runs against the **real Django backend** (`NEXT_PUBLIC_USE_MOCKS=false`),
> so these are what an audience would actually hit.

1. **Realtime is off.** Console/approvals poll instead of streaming. The WebSocket auth
   handshake isn't wired (team-JWT is httpOnly, so the browser can't put it in the
   subprotocol). Don't promise "live".
2. **Two cross-links don't appear.** `conversationId` on approvals and `leadId` on
   conversations aren't in the Django serializers yet, so "Open thread" and the thread's
   "View lead" render only when the field is present. Needs a small backend change.
3. **Journey distribution is empty** — there's no `journey/overview` endpoint, so the
   Overview widget hides itself. Don't point at it.
4. **Read-only users** still see an editable Claim-Card form that 403s on save.
5. **Client-page preview** — RevealLog ticks "① Client page" but there's no way to view
   what the visitor sees (Surface 1 owns that route).
6. **Evaluations and PoCs lists have no search/filter/pagination.** Fine with a handful of
   records; with real volume there's no way to find a specific one. NDA has all three.
7. **Analytics date range**: works against the real backend (the route forwards `days`).
   In local mock mode 30d and 90d look identical because the seeded leads only span ~30 days.

## Fixed just before this pass
- Stylesheet was failing to compile (a Pretendard `@import` placed after `@import "tailwindcss"`)
  — every page 500'd in dev.
- Collapsed sidebar spilled its labels over the page (`--sidebar-width-icon` was never defined).
- Agent runs showed an empty `L0 ·` badge (claim level 0 = "no claim") and raw `43198ms`.
- A failed request used to spin forever (settings forms, analytics views) or show a
  reassuring "nothing here yet" (evaluations, PoCs). Both now say the request failed.
- "Create PoC" toasted but went nowhere, and could be clicked twice → duplicate PoCs.
- Overview KPI tiles weren't clickable; follow-up sub-views had no way back; the Settings
  landing page was missing its Governance card.

## Demo-day checklist
- [ ] **Deploy** — production is still serving a build from before the sidebar/CSS fixes.
- [ ] Confirm you're logged in as **Admin or Assessment Team**, or the approve/advance/run
      buttons will (correctly) show "restricted" instead of acting.
- [ ] Have one **Tier 1 lead** open in a tab — that's the strongest single screen.
- [ ] Queue one draft before you start, so Approvals isn't empty.
