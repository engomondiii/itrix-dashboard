import "server-only";

import { AGENT_LABEL, type AgentKey } from "@/constants/agentKeys";
import { AGENT_AUTO_APPROVE_MAX_LEVEL, type ClaimLevel } from "@/constants/claimLevels";
import type { JourneyState } from "@/constants/journeyStates";
import type { LadderStage } from "@/constants/cockpit";
import type { LeadStatus } from "@/constants/statuses";
import type { AgentRunResult } from "@/types/agent";
import type { CockpitLead, CockpitNextAction, PitchAnalytics } from "@/types/cockpit";
import { getLead } from "@/mocks/leadsDb";
import { getJourney } from "@/mocks/journeyDb";
import { queueDraft } from "@/mocks/approvalsDb";
import { recordAgentRun } from "@/mocks/agentRunsDb";
import { listConversations } from "@/mocks/conversationsDb";
import { listThreads } from "@/mocks/threadsDb";

/** The conversation belonging to a lead, if one exists (so drafts deliver into it). */
function conversationForLead(leadId: string): string | null {
  if (!leadId) return null;
  return listConversations().find((c) => c.leadId === leadId)?.id ?? null;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function visitorTypeFor(productRoute: string): string {
  if (productRoute === "alpha_core") return "Semiconductor / Hardware partner";
  if (productRoute === "both") return "Strategic executive";
  if (productRoute === "general") return "Curious visitor";
  return "Cloud / AI infrastructure";
}

const STATUS_TO_STAGE: Record<LeadStatus, LadderStage> = {
  New: "Review",
  Contacted: "Review",
  "Meeting Booked": "Review",
  NDA: "Assessment",
  Evaluation: "Assessment",
  PoC: "PoC",
  Licensed: "License-out",
  Closed: "Review",
};

export function getCockpit(leadId: string): CockpitLead | null {
  const lead = getLead(leadId);
  if (!lead) return null;
  const journey = getJourney(leadId);
  const state: JourneyState = journey?.state ?? "ARRIVED";
  const strong = lead.tier <= 2;

  return {
    leadId,
    company: lead.company,
    tier: lead.tier,
    score: lead.score,
    journeyState: state,
    productRoute: lead.productRoute,
    commercialPath: lead.commercialPath,
    valueDelivered: journey?.valueDelivered ?? false,
    pitchEngagement: {
      opened: strong,
      slidesViewed: strong ? 6 : 2,
      totalDwellSeconds: strong ? 135 : 40,
      ctaClicks: strong ? 2 : 0,
      questionsAsked: strong ? 2 : 0,
      reopens: strong ? 1 : 0,
      engagementScore: clamp(lead.score + 8),
    },
    // v3: richer read (mock-only)
    pain: lead.primaryPain || undefined,
    gain: "Lower compute cost at the same SLA, validated through evaluation.",
    visitorType: visitorTypeFor(lead.productRoute),
    buyerPsychology:
      "Buys validated evidence, not claims — reassured by a scoped paid assessment before commitment.",
    objectionSignals: lead.score < 60 ? ["Wants proof before any commitment"] : [],
    readiness: {
      nda: clamp(lead.score - 8),
      assessment: clamp(lead.score),
      poc: clamp(lead.score - 18),
    },
    licenseOutProbability: clamp(lead.score + (lead.specialRights !== "None" ? 18 : 0)),
    ladderStage: STATUS_TO_STAGE[lead.status],

    // v5.0 — the conversation this lead came out of, and what it gathered.
    ...conversationRead(leadId),
    riskFlags: riskFlagsFor(lead.specialRights, lead.commercialIntent, lead.score),
  };
}

/**
 * The thread-derived half of the cockpit read.
 *
 * Sourced from the thread store rather than recomputed, so the cockpit and the
 * thread board can never disagree about the same conversation — an operator
 * seeing "4 covered" here and "6 covered" there would trust neither.
 */
function conversationRead(leadId: string): Partial<CockpitLead> {
  const thread = listThreads().find((t) => t.leadId === leadId);
  if (!thread) return { threadId: null, live: false };
  return {
    threadId: thread.id,
    live: thread.live,
    coverage: thread.coverage,
    loop: thread.loop,
    attachments: thread.attachments,
  };
}

/**
 * Sensitivity alerts — things that should make a concierge slow down.
 *
 * Deliberately conservative: these are prompts to pay attention, not scores.
 * Anything here is internal-only and must never be paraphrased into a message
 * to the visitor.
 */
function riskFlagsFor(
  specialRights: string,
  commercialIntent: string,
  score: number,
): string[] {
  const flags: string[] = [];
  if (specialRights !== "None") {
    flags.push(`Requests ${specialRights.toLowerCase()} rights — exclusivity needs sign-off`);
  }
  if (commercialIntent === "Acquisition / partnership") {
    flags.push("Acquisition intent — route to executive before any commercial answer");
  }
  if (score >= 85) flags.push("High score — confirm qualification before escalating");
  return flags;
}

const NEXT_ACTION: Record<JourneyState, { nextAction: string; reason: string }> = {
  ARRIVED: { nextAction: "review", reason: "No prompt yet — nothing to act on." },
  IN_REVIEW: { nextAction: "await_diagnosis", reason: "Qualification is in progress." },
  DIAGNOSED: {
    nextAction: "reveal_client_page",
    reason: "Diagnosis is ready — reveal the personalized client page.",
  },
  CLIENT_PAGE: {
    nextAction: "send_account_invite",
    reason: "Engaged with the page — offer account creation if the gate passes.",
  },
  INVITED: { nextAction: "await_claim", reason: "Invite sent — awaiting account creation." },
  NDA_REVIEW: {
    nextAction: "propose_evaluation",
    reason: "Client active under NDA — propose the paid ALPHA Compute Assessment.",
  },
  // States 7–10 each carry their own next step. Under v3.0 all three of these
  // collapsed into one "advance the engagement" line, which told the operator
  // nothing about which rung the relationship was actually on.
  ASSESSMENT: {
    nextAction: "start_poc",
    reason: "Assessment delivered — scope the paid PoC against agreed KPIs.",
  },
  POC: {
    nextAction: "start_integration",
    reason: "PoC evidence is in — move to integration readiness.",
  },
  INTEGRATION: {
    nextAction: "record_contract",
    reason: "Integration is ready — close the license-out agreement.",
  },
  CUSTOMER_SUCCESS: {
    nextAction: "review_outcomes",
    reason: "Contracted customer — keep outcomes on plan before anything commercial.",
  },
  DORMANT: { nextAction: "reactivate", reason: "Dormant — nurture and re-score on return." },
};

export function getNextAction(leadId: string): CockpitNextAction | null {
  const journey = getJourney(leadId);
  if (!getLead(leadId)) return null;
  const state: JourneyState = journey?.state ?? "ARRIVED";
  const na = NEXT_ACTION[state];
  return { leadId, state, nextAction: na.nextAction, reason: na.reason };
}

const AGENT_CLAIM: Partial<Record<AgentKey, ClaimLevel>> = {
  strategy: 2,
  buyer: 2,
  objection: 3,
  proof: 3,
  proposal: 5,
};

export function getPitchAnalytics(windowDays = 30): PitchAnalytics {
  return {
    totalPitchesOpened: 24,
    totalCtaClicks: 11,
    totalQuestionsAsked: 9,
    byPitchType: {
      "Strategic Executive": 7,
      "Technical Buyer": 5,
      "Cloud / AI Infrastructure": 6,
      "Semiconductor / Hardware Partner": 3,
      "Investor / Strategic Partner": 3,
    },
    windowDays,
  };
}

export function runAgent(key: AgentKey, leadId: string): AgentRunResult {
  const level = AGENT_CLAIM[key] ?? 2;
  const held = level > AGENT_AUTO_APPROVE_MAX_LEVEL;
  const governanceStatus = held ? "under_review" : "auto_approved";
  const lead = leadId ? getLead(leadId) : null;
  const company = lead?.company ?? "this lead";
  const draftBody = `${AGENT_LABEL[key]} draft for ${company}: prepared from approved Knowledge Core content, pending governance.`;

  // A held draft really lands in the approval queue, so the toast tells the truth.
  const approval = held
    ? queueDraft({
        leadId: leadId || null,
        conversationId: conversationForLead(leadId),
        agentKey: key,
        claimLevel: level,
        draftBody,
        citedChunkIds: [],
      })
    : null;

  // Every invocation is recorded in the agent-run audit log.
  recordAgentRun({
    agentKey: key,
    leadId: leadId || null,
    claimLevel: level,
    governanceStatus,
    usedAi: false,
  });

  return {
    agentKey: key,
    usedAi: false,
    governanceStatus,
    claimLevel: level,
    output: {
      summary: held
        ? `${AGENT_LABEL[key]} draft prepared and queued for approval.`
        : `${AGENT_LABEL[key]} draft prepared and auto-delivered.`,
      held,
      approvalId: approval?.id ?? null,
    },
    chunkIds: [],
  };
}
