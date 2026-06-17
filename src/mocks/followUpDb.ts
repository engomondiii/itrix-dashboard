import "server-only";

import { MOCK_LEADS } from "@/mocks/leads";
import { slaDeadline } from "@/lib/sla/slaCalculator";
import type { FollowUpTask } from "@/types/followUp";

let tasks: FollowUpTask[] | null = null;

function build(): FollowUpTask[] {
  const now = Date.now();
  return MOCK_LEADS.filter(
    (l) => l.tier <= 3 && ["New", "Contacted", "Meeting Booked"].includes(l.status),
  ).map((l, i) => {
    // Spread created times across the last ~3 days for a realistic overdue/soon mix.
    const createdAt = new Date(now - ((i * 7) % 80) * 3600_000).toISOString();
    const due = slaDeadline(createdAt, l.tier) ?? new Date(now + 24 * 3600_000);
    return {
      id: `fu-${l.id}`,
      leadId: l.id,
      leadName: l.company ?? l.email,
      company: l.company,
      tier: l.tier,
      owner: l.owner,
      createdAt,
      dueAt: due.toISOString(),
      status: "pending",
    };
  });
}

function all(): FollowUpTask[] {
  if (!tasks) tasks = build();
  return tasks;
}

export function listFollowUps(): FollowUpTask[] {
  return all().filter((t) => t.status !== "completed");
}

export function completeTask(id: string): FollowUpTask | null {
  const t = all().find((x) => x.id === id);
  if (!t) return null;
  t.status = "completed";
  return t;
}

export function snoozeTask(id: string, hours = 24): FollowUpTask | null {
  const t = all().find((x) => x.id === id);
  if (!t) return null;
  t.status = "snoozed";
  t.snoozedUntil = new Date(Date.now() + hours * 3600_000).toISOString();
  t.dueAt = t.snoozedUntil;
  return t;
}
