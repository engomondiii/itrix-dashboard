import type { ProductRoute, LicensePath, SpecialRights } from "@/constants/products";
import type { Tier } from "@/constants/tiers";
import type { LeadStatus } from "@/constants/statuses";
import type { ScoringCategory } from "@/constants/scoring";

/** Q1–Q9 qualification answers (Master Architecture §4.3). */
export interface QualificationAnswers {
  computationProblem: string; // Q1 (free text)
  organizationType: string; // Q2
  role: string; // Q3
  primaryPain: string; // Q4
  workloadType: string; // Q5
  currentStack: string[]; // Q6
  commercialIntent: string; // Q7
  commercialRights: string; // Q8
  timeline: string; // Q9
}

/** Per-category points contributing to the 0–100 lead score. */
export type ScoreBreakdown = Record<ScoringCategory, number>;

export interface LeadNote {
  id: string;
  body: string;
  author: string;
  createdAt: string; // ISO
}

export type LeadActivityType =
  | "submission"
  | "status_change"
  | "owner_change"
  | "note"
  | "email_sent"
  | "escalated"
  | "nda"
  | "evaluation"
  | "poc"
  | "meeting";

/** A scheduled meeting with the lead (captured by the Book meeting flow). */
export interface LeadMeeting {
  id: string;
  scheduledAt: string; // ISO date-time
  durationMins: number;
  attendee: string; // the customer-side contact
  location: string; // video link or room
  notes?: string;
  bookedBy?: string;
  createdAt: string; // ISO
}

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  label: string;
  at: string; // ISO
  by?: string;
}

/** Core CRM record (Master Architecture §8.1). */
export interface Lead {
  id: string;
  visitorName: string | null;
  company: string | null;
  email: string;
  industry: string;
  role: string;
  productRoute: ProductRoute;
  commercialPath: LicensePath;
  computeBottleneck: string; // AI-generated summary
  primaryPain: string;
  workloadType: string;
  currentStack: string[];
  commercialIntent: string;
  specialRights: SpecialRights;
  timeline: string;
  score: number; // 0–100
  tier: Tier;
  scoreBreakdown: ScoreBreakdown;
  recommendedNextStep: string;
  humanHandoffTrigger: boolean;
  status: LeadStatus;
  owner: string | null; // team member name/id
  ctaClicked?: string | null;
  documentsViewed?: number;
  submittedAt: string; // ISO
  qualification?: QualificationAnswers;
  notes?: LeadNote[];
  activity?: LeadActivity[];
  meetings?: LeadMeeting[];
}

/** Lightweight row for list/table views. */
export type LeadListItem = Pick<
  Lead,
  | "id"
  | "visitorName"
  | "company"
  | "industry"
  | "role"
  | "productRoute"
  | "commercialPath"
  | "primaryPain"
  | "score"
  | "tier"
  | "status"
  | "owner"
  | "specialRights"
  | "submittedAt"
>;
