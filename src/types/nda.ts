export const NDA_STATUSES = [
  "required",
  "sent",
  "signed",
  "declined",
  "expired",
] as const;
export type NDAStatus = (typeof NDA_STATUSES)[number];

export const NDA_DOC_TYPES = ["mutual", "one-way"] as const;
export type NDADocType = (typeof NDA_DOC_TYPES)[number];

export const NDA_DOC_TYPE_LABELS: Record<NDADocType, string> = {
  mutual: "Mutual NDA",
  "one-way": "One-way NDA",
};

export interface NDAChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface NDARecord {
  id: string;
  leadId: string;
  leadName: string;
  company: string | null;
  status: NDAStatus;
  checklist: NDAChecklistItem[];
  /** The NDA document itself. */
  docType: NDADocType;
  body: string;
  signerName?: string;
  signerEmail?: string;
  requestedAt: string; // ISO
  sentAt?: string | null;
  signedAt?: string | null;
  declineReason?: string;
}

/** Queue/list row — omits the heavy document body (only the detail view needs it). */
export type NDAListItem = Omit<NDARecord, "body">;
