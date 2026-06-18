import "server-only";

import { MOCK_LEADS } from "@/mocks/leads";
import { getLead, setStatus } from "@/mocks/leadsDb";
import type { NDADocType, NDAListItem, NDARecord, NDAStatus } from "@/types/nda";

const SIGNED_STATUSES = ["Evaluation", "PoC", "Licensed"];
const NDA_LEAD_STATUSES = ["NDA", "Evaluation", "PoC", "Licensed"];

interface NdaOverride {
  status?: NDAStatus;
  docType?: NDADocType;
  body?: string;
  signerName?: string;
  signerEmail?: string;
  sentAt?: string;
  signedAt?: string;
  declineReason?: string;
}

const overrides = new Map<string, NdaOverride>();

/** Merge into the existing override so a later transition never wipes the document. */
function mergeOverride(leadId: string, patch: NdaOverride) {
  overrides.set(leadId, { ...(overrides.get(leadId) ?? {}), ...patch });
}

/** A standard NDA body, generated from the counterparty + type. */
export function defaultNdaBody(company: string, docType: NDADocType): string {
  const mutuality =
    docType === "mutual"
      ? "Each party may disclose confidential information to the other, and both parties agree to protect it."
      : "iTrix Worldwide Ltd. may disclose confidential information to the Recipient, who agrees to protect it.";
  return `MUTUAL NON-DISCLOSURE AGREEMENT

Between: iTrix Worldwide Ltd. ("iTrix")
And: ${company} ("Counterparty")

1. Purpose. The parties wish to explore a potential engagement around iTrix's
   ALPHA compute technology and may exchange confidential information.

2. Confidential Information. ${mutuality} Confidential information includes
   benchmarks, mechanisms, pricing, and any material marked or understood to be
   confidential.

3. Use. The receiving party will use confidential information solely to evaluate
   the potential engagement and will not disclose it to third parties.

4. Term. Confidentiality obligations survive for three (3) years from disclosure.

5. No License. Nothing here grants any license or IP rights beyond evaluation.

Signed for ${company}:

Name: ______________________   Title: ______________   Date: ____________`;
}

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
    const sentOrBeyond = status === "sent" || signed;
    const company = l.company ?? l.email;
    const docType: NDADocType = o?.docType ?? "mutual";
    return {
      id: `nda-${l.id}`,
      leadId: l.id,
      leadName: company,
      company: l.company,
      status,
      checklist: checklist(status),
      docType,
      body: o?.body ?? defaultNdaBody(company, docType),
      signerName: o?.signerName,
      signerEmail: o?.signerEmail,
      requestedAt: l.submittedAt,
      sentAt: o?.sentAt ?? (sentOrBeyond ? l.submittedAt : null),
      signedAt: signed ? (o?.signedAt ?? l.submittedAt) : null,
      declineReason: status === "declined" ? o?.declineReason : undefined,
    };
  });
}

/** Drop the heavy document body for list payloads. */
function toListItem(n: NDARecord): NDAListItem {
  const { body, ...rest } = n;
  void body;
  return rest;
}

export interface NdaListQuery {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** Filtered, searched, paginated NDA list (without document bodies). */
export function listNda(query: NdaListQuery = {}): {
  results: NDAListItem[];
  count: number;
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 25);
  const search = query.search?.toLowerCase().trim();

  let rows = build();
  if (query.status) rows = rows.filter((n) => n.status === query.status);
  if (search) {
    rows = rows.filter((n) =>
      `${n.leadName} ${n.company ?? ""} ${n.signerName ?? ""} ${n.signerEmail ?? ""}`
        .toLowerCase()
        .includes(search),
    );
  }

  const count = rows.length;
  const start = (page - 1) * pageSize;
  const results = rows.slice(start, start + pageSize).map(toListItem);
  return { results, count, page, pageSize };
}

export function getNda(leadId: string): NDARecord | null {
  return build().find((n) => n.leadId === leadId) ?? null;
}

export interface NdaDraft {
  docType?: NDADocType;
  body?: string;
  signerName?: string;
  signerEmail?: string;
}

/** Create/edit the NDA document before it's sent (stays "required"). */
export function prepareNda(leadId: string, draft: NdaDraft): NDARecord | null {
  if (!getLead(leadId)) return null;
  mergeOverride(leadId, {
    docType: draft.docType,
    body: draft.body?.trim() ? draft.body : undefined,
    signerName: draft.signerName?.trim() || undefined,
    signerEmail: draft.signerEmail?.trim() || undefined,
  });
  return getNda(leadId);
}

/** Send a drafted NDA to a named signer: required -> sent. */
export function sendNda(
  leadId: string,
  signer: { signerName?: string; signerEmail: string },
): NDARecord | null {
  if (!getLead(leadId)) return null;
  mergeOverride(leadId, {
    status: "sent",
    sentAt: new Date().toISOString(),
    signerName: signer.signerName?.trim() || undefined,
    signerEmail: signer.signerEmail.trim(),
  });
  return getNda(leadId);
}

export function signNda(leadId: string, by?: string): NDARecord | null {
  mergeOverride(leadId, { status: "signed", signedAt: new Date().toISOString() });
  // A signed NDA clears the lead into the evaluation stage of the pipeline.
  const lead = getLead(leadId);
  if (lead?.status === "NDA") setStatus(leadId, "Evaluation", by);
  return getNda(leadId);
}

export function declineNda(leadId: string, reason?: string): NDARecord | null {
  mergeOverride(leadId, { status: "declined", declineReason: reason?.trim() || undefined });
  return getNda(leadId);
}

export function expireNda(leadId: string): NDARecord | null {
  mergeOverride(leadId, { status: "expired" });
  return getNda(leadId);
}
