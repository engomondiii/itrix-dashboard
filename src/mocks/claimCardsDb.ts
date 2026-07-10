import "server-only";

import type { ClaimCard, ClaimCardInput } from "@/types/claimCard";

/** Mock Claim-Card store. Seeds a few of the governing wordings. */
function seed(): ClaimCard[] {
  return [
    {
      id: "cc-1",
      key: "alpha_core_execution",
      title: "ALPHA Core execution wording",
      approvedWording: "table-free index-ordered algebraic execution",
      claimLevel: 1,
      isActive: true,
      ownerName: "Benjamin",
      notes: "Hard rule — never say 'lookup-table execution'.",
      createdAt: "2026-06-20T09:00:00Z",
      updatedAt: "2026-06-29T09:00:00Z",
    },
    {
      id: "cc-2",
      key: "sustainable_ai_positioning",
      title: "Sustainable AI positioning",
      approvedWording: "itriX builds Computational AI Infrastructure for Sustainable AI.",
      claimLevel: 1,
      isActive: true,
      ownerName: "Benjamin",
      notes: "Approved public one-liner.",
      createdAt: "2026-06-20T09:00:00Z",
      updatedAt: "2026-06-20T09:00:00Z",
    },
    {
      id: "cc-3",
      key: "axiom_spd_speedup",
      title: "AXIOM SPD / Cholesky speedup",
      approvedWording:
        "May reduce cost and improve speed for specific SPD/Cholesky workloads. Specific ratios are internal-only until approved.",
      claimLevel: 3,
      isActive: true,
      ownerName: "Benjamin",
      notes: "The 3–4× figure is INTERNAL-ONLY. Cite before any external use.",
      createdAt: "2026-06-22T09:00:00Z",
      updatedAt: "2026-06-29T09:00:00Z",
    },
    {
      id: "cc-4",
      key: "energy_reduction_roi",
      title: "Energy reduction (ROI)",
      approvedWording:
        "Potential energy reduction for eligible workloads, validated through evaluation.",
      claimLevel: 4,
      isActive: true,
      ownerName: null,
      notes: "Commercial/ROI — mandatory approval, never auto-delivered.",
      createdAt: "2026-06-25T09:00:00Z",
      updatedAt: "2026-06-25T09:00:00Z",
    },
  ];
}

let cards: ClaimCard[] = seed();

export function listClaimCards(level?: number): ClaimCard[] {
  const all = [...cards].sort((a, b) => a.claimLevel - b.claimLevel);
  return level ? all.filter((c) => c.claimLevel === level) : all;
}

export function getClaimCard(id: string): ClaimCard | null {
  return cards.find((c) => c.id === id) ?? null;
}

/** Claim-card keys are the governing identifier — they must be unique. */
export function claimCardKeyExists(key: string, exceptId?: string): boolean {
  return cards.some((c) => c.key === key && c.id !== exceptId);
}

export function createClaimCard(input: ClaimCardInput, ownerName: string): ClaimCard {
  const now = new Date().toISOString();
  const card: ClaimCard = {
    id: `cc-${cards.length + 1}-${Math.floor(cards.length * 7 + 3)}`,
    key: input.key,
    title: input.title,
    approvedWording: input.approvedWording,
    claimLevel: input.claimLevel,
    isActive: input.isActive ?? true,
    ownerName,
    notes: input.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };
  cards = [...cards, card];
  return card;
}

export function updateClaimCard(
  id: string,
  patch: Partial<ClaimCardInput>,
): ClaimCard | null {
  const idx = cards.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const updated: ClaimCard = {
    ...cards[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  cards[idx] = updated;
  return updated;
}
