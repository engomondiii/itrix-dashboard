import type { ClaimLevel } from "@/constants/claimLevels";

/**
 * A Claim-Card (backend `ClaimCardSerializer`). NOTE: the backend model is
 * intentionally lean — only these fields exist. The Surface 2 spec's richer
 * fields (disallowedWording, evidenceSource, allowedAudience, disclosureCeiling,
 * reviewDate) are // v3: not yet on the backend and are omitted here.
 */
export interface ClaimCard {
  id: string;
  key: string;
  title: string;
  approvedWording: string;
  claimLevel: ClaimLevel;
  isActive: boolean;
  ownerName: string | null;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimCardInput {
  key: string;
  title: string;
  approvedWording: string;
  claimLevel: ClaimLevel;
  isActive?: boolean;
  notes?: string;
}
