import type { JourneyState } from "@/constants/journeyStates";
import type {
  CoverageStatus,
  ListeningDimension,
  StopReason,
} from "@/constants/listeningDimensions";
import type { DisclosureCeiling, IdentityState } from "@/constants/shellContract";
import type { ArtifactType } from "@/constants/artifactTypes";
import type { ScanVerdict } from "@/types/attachment";

/**
 * A conversation thread as the team sees it (Backend v6.0 §2.1).
 *
 * THE LEAD / CLIENT / CUSTOMER / THREAD DISTINCTION. A Lead is the CRM record
 * the team works. A Client is the portal account-holder. A Customer is a Client
 * with a contract. A Thread is the conversation itself — and it may exist before
 * any of the other three, because an anonymous visitor has a thread from their
 * first sentence. The team still works the Lead, but from the first turn it must
 * also be able to watch the Thread (Surface 2 v5.0 §00.2).
 */

export type ThreadOwnerKind = "session" | "client" | "team";

export type ThreadContext =
  | "review"
  | "anonymous_review"
  | "client_page"
  | "portal"
  | "customer_success";

/**
 * A turn's lifecycle. `settled` is the only status whose text is final —
 * `streaming` text is provisional and always replaceable, and the frontend must
 * never present it as delivered (Architecture v2.6 §19.8).
 */
export type StreamingStatus =
  | "pending"
  | "streaming"
  | "settled"
  | "halted"
  | "under_review";

export type TurnAuthor = "visitor" | "agent" | "team";

/** Coverage of one listening dimension, with a pointer to the evidence. */
export interface CoverageEntry {
  dimension: ListeningDimension;
  status: CoverageStatus;
  /** The message id that moved this dimension, if any. */
  evidenceMessageId: string | null;
  updatedAt: string; // ISO
}

/** The question loop's state for a thread. Internal-only. */
export interface LoopState {
  open: boolean;
  questionsAsked: number;
  budgetRemaining: number;
  /** Null while the loop is still open. */
  stopReason: StopReason | null;
}

/** One generated question, and which dimension it was trying to close. */
export interface QuestionHistoryEntry {
  id: string;
  primaryText: string;
  chips: string[];
  targetDimension: ListeningDimension;
  askedAt: string; // ISO
  /** Whether the dimension actually moved after this question. */
  productive: boolean;
}

/**
 * An approval that is blocking a live visitor.
 *
 * `waitingSeconds` is the visitor's wait, not the approval's age. Those diverge
 * whenever an approval is raised for someone who has since closed the tab, and
 * the queue orders by the former (Surface 2 v5.0 §05.1).
 */
export interface BlockingApproval {
  approvalId: string;
  claimLevel: number;
  waitingSeconds: number;
}

/** Row on the thread board. */
export interface ThreadListItem {
  id: string;
  title: string;
  ownerKind: ThreadOwnerKind;
  context: ThreadContext;
  identityState: IdentityState;
  state: JourneyState;
  journeyNumber: number | null;
  /** Whether the visitor is connected to this thread right now. */
  live: boolean;
  coverage: { covered: number; partial: number; unknown: number };
  loop: LoopState;
  attachments: { count: number; worstScan: ScanVerdict | null };
  blocking: BlockingApproval | null;
  /** Whether a stream-guard halt has fired on this thread. */
  guardHalted: boolean;
  humanOwner: string | null;
  /** The CRM record, once one exists. Null for an unqualified anonymous thread. */
  leadId: string | null;
  createdAt: string; // ISO
  lastActivityAt: string; // ISO
}

/** One turn in the transcript, as the operator sees it. */
export interface ThreadTurn {
  id: string;
  seq: number;
  author: TurnAuthor;
  body: string;
  streamingStatus: StreamingStatus;
  createdAt: string; // ISO
  /** Internal overlay — never part of what the visitor saw. */
  citedChunkIds: string[];
  /** The claim ceiling the pre-flight envelope bound this turn to. */
  envelopeLevel: number | null;
  /** Set when the stream guard halted this turn mid-generation. */
  haltedPattern: string | null;
  attachmentIds: string[];
}

/** An artifact delivered into the thread. */
export interface ThreadArtifact {
  id: string;
  type: ArtifactType;
  version: number;
  disclosureLevel: DisclosureCeiling;
  governanceStatus: "approved" | "under_review" | "rejected";
  createdAt: string; // ISO
  supersededById: string | null;
}

/**
 * The full operator read of one thread: the transcript exactly as the visitor
 * saw it, PLUS the internal overlay they never see (coverage, question history,
 * citations, envelope levels, guard halts).
 */
export interface ThreadDetail {
  thread: ThreadListItem;
  turns: ThreadTurn[];
  artifacts: ThreadArtifact[];
  coverageMap: CoverageEntry[];
  questionHistory: QuestionHistoryEntry[];
  disclosureCeiling: DisclosureCeiling;
}

/** Filters on the thread board (Surface 2 v5.0 §3.1). */
export interface ThreadFilterState {
  identity: IdentityState | "all";
  state: JourneyState | "all";
  liveOnly: boolean;
  hasAttachments: boolean;
  blockedOnApproval: boolean;
  guardHalted: boolean;
  abandoned: boolean;
}

/** Loop productivity across the whole book (threads/coverage). */
export interface CoverageOverview {
  threadsAnalysed: number;
  /** Dimension → how often it is still unknown when the loop closes. */
  weakestDimensions: Array<{
    dimension: ListeningDimension;
    unknownRate: number;
    partialRate: number;
  }>;
  stopReasonCounts: Partial<Record<StopReason, number>>;
  medianQuestionsToArtifact: number;
}
