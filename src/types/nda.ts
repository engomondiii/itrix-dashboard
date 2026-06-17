export type NDAStatus = "required" | "sent" | "signed";

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
