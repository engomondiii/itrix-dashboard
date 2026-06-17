/**
 * Lead-scoring categories and weights (sum = 100).
 * Scoring itself runs in the Django backend; the dashboard only displays
 * the breakdown. Source: Master Architecture Flow §6.1.
 */

export const SCORING_CATEGORIES = [
  "strategicFit",
  "technicalFit",
  "urgency",
  "budgetAuthority",
  "licenseOutPotential",
] as const;
export type ScoringCategory = (typeof SCORING_CATEGORIES)[number];

export interface ScoringCategoryDef {
  key: ScoringCategory;
  label: string;
  weight: number;
}

export const SCORING_WEIGHTS: Record<ScoringCategory, ScoringCategoryDef> = {
  strategicFit: { key: "strategicFit", label: "Strategic fit", weight: 25 },
  technicalFit: { key: "technicalFit", label: "Technical fit", weight: 25 },
  urgency: { key: "urgency", label: "Urgency", weight: 20 },
  budgetAuthority: { key: "budgetAuthority", label: "Budget / authority", weight: 15 },
  licenseOutPotential: {
    key: "licenseOutPotential",
    label: "License-out potential",
    weight: 15,
  },
};

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;
