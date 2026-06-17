import type { Tier } from "@/constants/tiers";
import type { ProductRoute } from "@/constants/products";

export interface OverviewMetrics {
  newLeads: number;
  tier1Count: number;
  tier2Count: number;
  overdueFollowUps: number;
  tierDistribution: Record<Tier, number>;
  routeDistribution: Record<ProductRoute, number>;
  weeklySubmissions: { date: string; count: number }[];
}

export interface FunnelStage {
  stage: string;
  count: number;
  /** Conversion from the previous stage, 0–1. */
  conversion?: number;
}

export interface ResponseTimeMetrics {
  tier1AvgHours: number;
  tier2AvgHours: number;
  tier1Breaches: number;
  tier2Breaches: number;
  complianceRate: number; // 0–1
}

export interface BottleneckPattern {
  phrase: string;
  count: number;
}

export interface IndustryBreakdown {
  industry: string;
  count: number;
}
