import "server-only";

import { MOCK_LEADS } from "@/mocks/leads";
import type {
  Lead,
  LeadActivity,
  LeadActivityType,
  LeadMeeting,
} from "@/types/lead";

/**
 * In-process mutable mock store. Mutations persist for the life of the dev
 * server process (module state), which is enough to demo the action flows.
 */

function enrich(l: Lead): Lead {
  if (!l.qualification) {
    l.qualification = {
      computationProblem: l.computeBottleneck,
      organizationType: l.industry,
      role: l.role,
      primaryPain: l.primaryPain,
      workloadType: l.workloadType,
      currentStack: l.currentStack,
      commercialIntent: l.commercialIntent,
      commercialRights:
        l.specialRights === "None"
          ? "Non-exclusive evaluation"
          : `${l.specialRights} exclusivity`,
      timeline: l.timeline,
    };
  }
  if (!l.notes) l.notes = [];
  if (!l.meetings) l.meetings = [];
  if (!l.activity) {
    l.activity = [
      {
        id: `${l.id}-a0`,
        type: "submission",
        label: "Submitted compute bottleneck via AI Sales Engine",
        at: l.submittedAt,
      },
    ];
  }
  return l;
}

let seq = 1000;
function pushActivity(l: Lead, type: LeadActivityType, label: string, by?: string) {
  const entry: LeadActivity = {
    id: `act-${seq++}`,
    type,
    label,
    at: new Date().toISOString(),
    by,
  };
  l.activity = [entry, ...(l.activity ?? [])];
}

export function getLead(id: string): Lead | null {
  const l = MOCK_LEADS.find((x) => x.id === id);
  return l ? enrich(l) : null;
}

export function assignOwner(
  id: string,
  owner: string | null,
  by?: string,
  note?: string,
) {
  const l = getLead(id);
  if (!l) return null;
  l.owner = owner;
  const suffix = note?.trim() ? ` — ${note.trim()}` : "";
  pushActivity(l, "owner_change", `Owner set to ${owner ?? "Unassigned"}${suffix}`, by);
  return l;
}

export function setStatus(
  id: string,
  status: Lead["status"],
  by?: string,
  reason?: string,
) {
  const l = getLead(id);
  if (!l) return null;
  l.status = status;
  const suffix = reason?.trim() ? ` — ${reason.trim()}` : "";
  pushActivity(l, "status_change", `Status → ${status}${suffix}`, by);
  return l;
}

export function addNote(id: string, body: string, author: string) {
  const l = getLead(id);
  if (!l) return null;
  const note = { id: `note-${seq++}`, body, author, createdAt: new Date().toISOString() };
  l.notes = [note, ...(l.notes ?? [])];
  pushActivity(l, "note", "Internal note added", author);
  return l;
}

export interface EscalationInput {
  reason: string;
  priority: string; // "normal" | "high" | "urgent"
}

export function escalate(id: string, input: EscalationInput, by?: string) {
  const l = getLead(id);
  if (!l) return null;
  const priority = input.priority.toUpperCase();
  pushActivity(
    l,
    "escalated",
    `Escalated to executive review · ${priority} — ${input.reason.trim()}`,
    by,
  );
  return l;
}

export function markNda(id: string, by?: string) {
  const l = getLead(id);
  if (!l) return null;
  l.status = "NDA";
  pushActivity(l, "nda", "Marked NDA required", by);
  return l;
}

export function markEvaluation(id: string, by?: string) {
  const l = getLead(id);
  if (!l) return null;
  l.status = "Evaluation";
  pushActivity(l, "evaluation", "Requested paid evaluation", by);
  return l;
}

export function markPoC(id: string, by?: string) {
  const l = getLead(id);
  if (!l) return null;
  l.status = "PoC";
  pushActivity(l, "poc", "Marked PoC candidate", by);
  return l;
}

export interface MeetingInput {
  scheduledAt: string; // local datetime, "YYYY-MM-DDTHH:mm"
  durationMins: number;
  attendee: string;
  location: string;
  notes?: string;
}

export function bookMeeting(id: string, input: MeetingInput, by?: string) {
  const l = getLead(id);
  if (!l) return null;
  const meeting: LeadMeeting = {
    id: `mtg-${seq++}`,
    scheduledAt: input.scheduledAt,
    durationMins: input.durationMins,
    attendee: input.attendee.trim(),
    location: input.location.trim(),
    notes: input.notes?.trim() || undefined,
    bookedBy: by,
    createdAt: new Date().toISOString(),
  };
  l.meetings = [meeting, ...(l.meetings ?? [])];
  l.status = "Meeting Booked";
  const when = input.scheduledAt.replace("T", " ");
  pushActivity(l, "meeting", `Meeting booked for ${when}`, by);
  return l;
}

/**
 * Record an outbound follow-up on the lead's timeline. A first touch on a
 * brand-new lead also advances it out of the "New" stage.
 */
export interface EmailLogOptions {
  scheduledAt?: string;
  cc?: string;
  attachments?: string[];
}

export function logEmailSent(
  id: string,
  subject: string,
  by?: string,
  opts: EmailLogOptions = {},
) {
  const l = getLead(id);
  if (!l) return null;
  const scheduled =
    !!opts.scheduledAt && new Date(opts.scheduledAt).getTime() > Date.now();
  // Only an actual send (not a future-scheduled one) advances the lead.
  if (!scheduled && l.status === "New") l.status = "Contacted";

  const extras: string[] = [];
  if (opts.cc?.trim()) extras.push(`cc ${opts.cc.trim()}`);
  if (opts.attachments?.length) {
    extras.push(
      `${opts.attachments.length} attachment${opts.attachments.length > 1 ? "s" : ""}`,
    );
  }
  const suffix = extras.length ? ` (${extras.join("; ")})` : "";
  const label = scheduled
    ? `Follow-up scheduled for ${opts.scheduledAt!.replace("T", " ")}: ${subject}${suffix}`
    : `Follow-up sent: ${subject}${suffix}`;
  pushActivity(l, "email_sent", label, by);
  return l;
}
