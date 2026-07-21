import type { JourneyState } from "@/constants/journeyStates";
import type { StopReason } from "@/constants/listeningDimensions";
import type { ScanVerdict } from "@/types/attachment";

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

  /**
   * v5.0 reading fields (Surface 2 v5.0 §2.1).
   *
   * All four exist because Surface 1 became a live conversation: the cockpit now
   * has to answer "what has this thread actually gathered, what did it ask, what
   * did they upload, and are they in front of it right now?" — none of which the
   * v3.0 field set could express.
   *
   * `coverage`, `loop.stopReason` and `riskFlags` are on the client-plane
   * serializer deny-list and must never be echoed into a portal payload or an
   * intervention (Architecture v2.6 §10.5, §7.4).
   */
  threadId?: string | null;
  /** Whether the visitor is connected to their thread right now. */
  live?: boolean;
  coverage?: { covered: number; partial: number; unknown: number };
  loop?: {
    open: boolean;
    questionsAsked: number;
    budgetRemaining: number;
    stopReason: StopReason | null;
  };
  attachments?: { count: number; worstScan: ScanVerdict | null };
  /** Sensitivity alerts. Team plane only. */
  riskFlags?: string[];
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
