import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type {
  BottleneckPattern,
  FunnelStage,
  IndustryBreakdown,
  OverviewMetrics,
  ResponseTimeMetrics,
} from "@/types/analytics";

export function getOverview() {
  return apiGet<OverviewMetrics>(API.analyticsOverview);
}
export function getFunnel() {
  return apiGet<{ stages: FunnelStage[] }>(API.analyticsFunnel);
}
export function getResponseTime() {
  return apiGet<ResponseTimeMetrics>(API.analyticsResponseTime);
}
export function getBottlenecks() {
  return apiGet<{ bottlenecks: BottleneckPattern[]; industries: IndustryBreakdown[] }>(
    API.analyticsBottlenecks,
  );
}
