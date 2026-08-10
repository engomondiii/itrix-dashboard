'use client';

/**
 * Insights data — ONE endpoint: GET /api/v1/analytics/?days=N (1..365).
 * The legacy per-widget analytics routes never existed on Django.
 *
 * Casing trap: the top-level block keys are snake_case (the only snake
 * envelope in the API); everything nested is camelCase.
 */

import { useQuery } from '@tanstack/react-query';

import { http } from '@/lib/api/client';

export interface FunnelStage {
  stage: string;
  count: number;
  /** Stage-to-stage conversion, 0–1; ABSENT on the first stage. */
  conversion?: number;
}

export interface AnalyticsPayload {
  overview: {
    newLeads: number;
    tier1Count: number;
    tier2Count: number;
    overdueFollowUps: number;
    tierDistribution: Record<string, number>;
    routeDistribution: Record<string, number>;
    weeklySubmissions: Array<{ date: string; count: number }>;
  };
  funnel: FunnelStage[];
  sla_compliance: {
    tier1AvgHours: number;
    tier2AvgHours: number;
    tier1Breaches: number;
    tier2Breaches: number;
    /** 0–1. Only tiers 1 and 2 are measured. */
    complianceRate: number;
  };
  patterns: Array<{ phrase: string; count: number }>;
  industry_breakdown: Array<{ industry: string; count: number }>;
  route_distribution: Record<string, number>;
  submission_trend: Array<{ date: string; count: number }>;
}

export function useAnalytics(days: number) {
  return useQuery({
    queryKey: ['insights', days],
    queryFn: () => http.get<AnalyticsPayload>(`/api/v1/analytics/?days=${days}`),
  });
}
