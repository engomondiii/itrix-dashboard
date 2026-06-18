import type { Tier } from "@/constants/tiers";

/** Per-operator notification toggles (settings/notifications). */
export interface NotificationPrefs {
  /** New Tier 1 lead arrives. */
  tier1: boolean;
  /** A follow-up breaches its SLA. */
  sla: boolean;
  /** An NDA is signed. */
  nda: boolean;
  /** Weekly pipeline report digest. */
  weekly: boolean;
}

/** Editable SLA response thresholds (hours) keyed by tier; null = no SLA. */
export type SlaConfig = Record<Tier, number | null>;

/** Editable profile fields. */
export interface ProfileUpdate {
  name?: string;
}
