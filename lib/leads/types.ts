/**
 * Lead-detail wire types — exactly as Django serializes them
 * (itrix-backend apps/leads/serializers.py, apps/agents/views.py cockpit,
 * apps/nda/serializers.py). All camelCase unless noted.
 */

import type { LeadRow, LeadStatus, NdaRow } from '@/lib/today/types';

export interface LeadNote {
  id: string;
  body: string;
  author: string;
  createdAt: string;
}

export type LeadActivityType =
  | 'submission'
  | 'status_change'
  | 'owner_change'
  | 'note'
  | 'email_sent'
  | 'escalated'
  | 'nda'
  | 'evaluation'
  | 'poc'
  | 'paid_eval'
  | 'meeting';

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  label: string;
  at: string;
  by: string | null;
}

export interface LeadMeeting {
  id: string;
  scheduledAt: string;
  durationMins: number;
  attendee: string;
  location: string;
  notes: string;
  bookedBy: string;
  createdAt: string;
}

/** GET /leads/{id}/ — every action also returns this full shape. */
export interface LeadDetail extends LeadRow {
  email: string;
  commercialPath: string;
  specialRights: string;
  timeline: string;
  computeBottleneck: string;
  workloadType: string;
  currentStack: string[];
  commercialIntent: string;
  scoreBreakdown: Record<string, unknown>;
  recommendedNextStep: string;
  humanHandoffTrigger: boolean;
  ctaClicked: boolean;
  documentsViewed: number;
  clientId: string | null;
  valueDelivered: boolean;
  qualification: Record<string, unknown>;
  notes: LeadNote[];
  activity: LeadActivity[];
  meetings: LeadMeeting[];
}

/** GET /cockpit/leads/{leadId}/ — deterministic, always fully populated. */
export interface DealSignals {
  leadId: string;
  company: string;
  tier: number;
  score: number;
  journeyState: string;
  productRoute: string;
  commercialPath: string;
  valueDelivered: boolean;
  pitchEngagement: {
    opened: boolean;
    slidesViewed: number;
    totalDwellSeconds: number;
    ctaClicks: number;
    questionsAsked: number;
    reopens: number;
    engagementScore: number;
  };
  pain: string | null;
  gain: string;
  visitorType: string;
  buyerPsychology: string;
  objectionSignals: string[];
  readiness: { nda: number; assessment: number; poc: number };
  licenseOutProbability: number;
  ladderStage: string;
}

/** GET /cockpit/leads/{leadId}/next-action/ */
export interface NextActionSuggestion {
  leadId: string;
  state: string;
  nextAction: string;
  reason: string;
  primary: { key: string; label: string; detail: string; href: string } | null;
  secondary: Array<{ key: string; label: string; detail: string; href: string }>;
}

/** GET /nda/{leadId}/ — list row + body. 404 = no NDA yet (never auto-created). */
export interface NdaRecord extends NdaRow {
  body: string;
  checklist: Array<Record<string, unknown>>;
}

/** GET /pipeline/ — always all 8 visible stages, in order. */
export interface PipelineStage {
  status: LeadStatus;
  count: number;
  leads: Array<LeadRow & { overdue: boolean }>;
}

export interface PipelineBoard {
  stages: PipelineStage[];
}
