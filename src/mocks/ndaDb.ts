import "server-only";

import { MOCK_LEADS } from "@/mocks/leads";
import { getLead, setStatus } from "@/mocks/leadsDb";
import type { NDARecord, NDAStatus } from "@/types/nda";

const SIGNED_STATUSES = ["Evaluation", "PoC", "Licensed"];
const NDA_LEAD_STATUSES = ["NDA", "Evaluation", "PoC", "Licensed"];

const overrides = new Map<
  string,
  { status: NDAStatus; signedAt?: string; declineReason?: string }
>();

/** Checklist mirrors the pipeline so it reflects real progress, not a fixed list. */
function checklist(status: NDAStatus) {
  const sentOrBeyond = status === "sent" || status === "signed";
  return [
    { id: "c1", label: "Draft prepared (scope + counterparty)", done: true },
    { id: "c2", label: "Sent to counterparty", done: sentOrBeyond },
    { id: "c3", label: "Signed by both parties", done: status === "signed" },
  ];
}

function build(): NDARecord[] {
  return MOCK_LEADS.filter((l) => NDA_LEAD_STATUSES.includes(l.status)).map((l) => {
    const o = overrides.get(l.id);
    // A lead past the NDA stage has a signed NDA; a lead just at "NDA" has a
    // drafted ("required") NDA awaiting send. Overrides drive sent/signed/etc.
    const status: NDAStatus =
      o?.status ?? (SIGNED_STATUSES.includes(l.status) ? "signed" : "required");
    const signed = status === "signed";
    return {
      id: `nda-${l.id}`,
      leadId: l.id,
      leadName: l.company ?? l.email,
      company: l.company,
      status,
      checklist: checklist(status),
      requestedAt: l.submittedAt,
      signedAt: signed ? (o?.signedAt ?? l.submittedAt) : null,
      declineReason: status === "declined" ? o?.declineReason : undefined,
    };
  });
}

export function listNda(): NDARecord[] {
  return build();
}

export function getNda(leadId: string): NDARecord | null {
  return build().find((n) => n.leadId === leadId) ?? null;
}

/** Send a drafted ("required") NDA to the counterparty: required -> sent. */
export function sendNda(leadId: string): NDARecord | null {
  overrides.set(leadId, { status: "sent" });
  return getNda(leadId);
}

export function signNda(leadId: string, by?: string): NDARecord | null {
  overrides.set(leadId, { status: "signed", signedAt: new Date().toISOString() });
  // A signed NDA clears the lead into the evaluation stage of the pipeline.
  const lead = getLead(leadId);
  if (lead?.status === "NDA") setStatus(leadId, "Evaluation", by);
  return getNda(leadId);
}

export function declineNda(leadId: string, reason?: string): NDARecord | null {
  overrides.set(leadId, { status: "declined", declineReason: reason?.trim() || undefined });
  return getNda(leadId);
}

export function expireNda(leadId: string): NDARecord | null {
  overrides.set(leadId, { status: "expired" });
  return getNda(leadId);
}
