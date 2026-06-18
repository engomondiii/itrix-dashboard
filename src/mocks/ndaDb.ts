import "server-only";

import { MOCK_LEADS } from "@/mocks/leads";
import { getLead, setStatus } from "@/mocks/leadsDb";
import type { NDARecord, NDAStatus } from "@/types/nda";

const SIGNED_STATUSES = ["Evaluation", "PoC", "Licensed"];
const NDA_LEAD_STATUSES = ["NDA", "Evaluation", "PoC", "Licensed"];

const overrides = new Map<string, { status: NDAStatus; signedAt?: string }>();

function checklist(signed: boolean) {
  return [
    { id: "c1", label: "Confidentiality scope agreed", done: true },
    { id: "c2", label: "Counterparty entity confirmed", done: true },
    { id: "c3", label: "Disclosure boundary set (public / NDA-only)", done: true },
    { id: "c4", label: "Signed by both parties", done: signed },
  ];
}

function build(): NDARecord[] {
  return MOCK_LEADS.filter((l) => NDA_LEAD_STATUSES.includes(l.status)).map((l) => {
    const o = overrides.get(l.id);
    const status: NDAStatus =
      o?.status ?? (SIGNED_STATUSES.includes(l.status) ? "signed" : "sent");
    const signed = status === "signed";
    return {
      id: `nda-${l.id}`,
      leadId: l.id,
      leadName: l.company ?? l.email,
      company: l.company,
      status,
      checklist: checklist(signed),
      requestedAt: l.submittedAt,
      signedAt: signed ? (o?.signedAt ?? l.submittedAt) : null,
    };
  });
}

export function listNda(): NDARecord[] {
  return build();
}

export function getNda(leadId: string): NDARecord | null {
  return build().find((n) => n.leadId === leadId) ?? null;
}

export function signNda(leadId: string, by?: string): NDARecord | null {
  overrides.set(leadId, { status: "signed", signedAt: new Date().toISOString() });
  // A signed NDA clears the lead into the evaluation stage of the pipeline.
  const lead = getLead(leadId);
  if (lead?.status === "NDA") setStatus(leadId, "Evaluation", by);
  return getNda(leadId);
}

export function declineNda(leadId: string): NDARecord | null {
  overrides.set(leadId, { status: "declined" });
  return getNda(leadId);
}

export function expireNda(leadId: string): NDARecord | null {
  overrides.set(leadId, { status: "expired" });
  return getNda(leadId);
}
