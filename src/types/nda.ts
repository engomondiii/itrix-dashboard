export const NDA_STATUSES = [
  "required",
  "sent",
  "signed",
  "declined",
  "expired",
] as const;
export type NDAStatus = (typeof NDA_STATUSES)[number];

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
  requestedAt: string; // ISO
  signedAt?: string | null;
}
