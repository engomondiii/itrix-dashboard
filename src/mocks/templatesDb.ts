import "server-only";

import type { Template } from "@/types/template";

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "tpl-email-followup",
    kind: "email",
    name: "Tier 1 / 2 follow-up",
    variables: ["company", "name", "pain", "industry", "route"],
    updatedAt: "2026-06-09T10:00:00.000Z",
    body: `Subject: Your ALPHA Compute / Core Assessment — {{company}}

Dear {{name}},

Thank you for sharing your compute bottleneck with iTrix.

Based on your response, your organization appears to be facing a potential {{pain}} constraint in {{industry}}. Our initial assessment suggests this may be relevant to {{route}}.

The appropriate next step would be a confidential discussion to determine whether a paid ALPHA assessment is justified. Before any sensitive technical information is exchanged, we can proceed under NDA.

Best regards,
iTrix Assessment Team`,
  },
  {
    id: "tpl-followup-script",
    kind: "follow-up",
    name: "Discovery call script",
    variables: ["company"],
    updatedAt: "2026-06-08T10:00:00.000Z",
    body: `Discovery call — {{company}} (15–20 min)

1. Confirm the compute bottleneck in their words.
2. Why is it strategically urgent now?
3. Current hardware / software stack.
4. ALPHA Compute vs ALPHA Core relevance (do not overclaim).
5. Non-exclusive vs exclusive interest.
6. Possible KPI targets.
7. NDA + paid evaluation pathway.
8. Agree next step + owner.`,
  },
  {
    id: "tpl-eval-proposal",
    kind: "evaluation",
    name: "Paid evaluation proposal",
    variables: ["company", "package"],
    updatedAt: "2026-06-07T10:00:00.000Z",
    body: `{{package}} — {{company}}

Deliverables:
- Workload diagnosis
- ALPHA fit analysis
- Structural bottleneck map
- KPI recommendation
- Licensing path recommendation
- PoC plan

All technical claims are bounded; deeper proof shared under NDA.`,
  },
  {
    id: "tpl-poc-proposal",
    kind: "poc",
    name: "PoC proposal",
    variables: ["company"],
    updatedAt: "2026-06-06T10:00:00.000Z",
    body: `PoC scope — {{company}}

- Baseline workload + benchmark
- Transformed representation (ALPHA Compute)
- Runtime validation (ALPHA Core)
- KPIs: runtime, memory, energy, accuracy, reproducibility
- Milestones + acceptance criteria
- Risk register
- Fees + timeline`,
  },
  {
    id: "tpl-handoff-memo",
    kind: "handoff",
    name: "Offline handoff memo",
    variables: ["company", "tier", "route", "bottleneck", "nextStep"],
    updatedAt: "2026-06-05T10:00:00.000Z",
    body: `LEAD HANDOFF — {{company}}
Tier {{tier}} · {{route}}
Bottleneck: {{bottleneck}}
Recommended next step: {{nextStep}}`,
  },
];
