import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type {
  BottleneckPattern,
  FunnelStage,
  IndustryBreakdown,
  OverviewMetrics,
  ResponseTimeMetrics,
} from "@/types/analytics";

export function getOverview(days?: number) {
  return apiGet<OverviewMetrics>(API.analyticsOverview, days ? { days } : undefined);
}
export function getFunnel(days?: number) {
  return apiGet<{ stages: FunnelStage[] }>(
    API.analyticsFunnel,
    days ? { days } : undefined,
  );
}
export function getResponseTime(days?: number) {
  return apiGet<ResponseTimeMetrics>(
    API.analyticsResponseTime,
    days ? { days } : undefined,
  );
}
export function getBottlenecks(days?: number) {
  return apiGet<{ bottlenecks: BottleneckPattern[]; industries: IndustryBreakdown[] }>(
    API.analyticsBottlenecks,
    days ? { days } : undefined,
  );
}
