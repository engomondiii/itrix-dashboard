import type { JourneyState } from "@/constants/journeyStates";

/** Pitch-room engagement telemetry (backend `pitch_engagement_for_lead`). Internal-only. */
export interface PitchEngagement {
  opened: boolean;
  slidesViewed: number;
  totalDwellSeconds: number;
  ctaClicks: number;
  questionsAsked: number;
  reopens: number;
  engagementScore: number;
}

export interface CockpitReadiness {
  nda?: number;
  assessment?: number;
  poc?: number;
}

/**
 * The cockpit "read the visitor" payload — mirrors the backend `CockpitLeadView`:
 * the 8 base fields + pitchEngagement, plus the richer internal read (pain/gain,
 * visitor type, buyer psychology, objections, readiness, license-out probability,
 * ladder stage). All internal-only — these signals never reach a visitor. The
 * richer fields stay optional so a leaner backend response still type-checks.
 */
export interface CockpitLead {
  leadId: string;
  company: string | null;
  tier: number;
  score: number;
  journeyState: JourneyState;
  productRoute: string;
  commercialPath: string;
  valueDelivered: boolean;
  pitchEngagement: Partial<PitchEngagement>;

  // v3: richer visitor read (mock-only until the backend serves it)
  pain?: string;
  gain?: string;
  visitorType?: string;
  buyerPsychology?: string;
  objectionSignals?: string[];
  readiness?: CockpitReadiness;
  /** Internal directional signal ONLY — never shown to a visitor. */
  licenseOutProbability?: number;
  ladderStage?: string;
}

export interface CockpitNextAction {
  leadId: string;
  state: JourneyState;
  nextAction: string;
  reason: string;
}

/** Aggregated pitch-room analytics (backend `pitch_engagement_overview`). Internal-only. */
export interface PitchAnalytics {
  totalPitchesOpened: number;
  totalCtaClicks: number;
  totalQuestionsAsked: number;
  byPitchType: Record<string, number>;
  windowDays: number;
}
