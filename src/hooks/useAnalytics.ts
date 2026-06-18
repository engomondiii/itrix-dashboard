"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getBottlenecks,
  getFunnel,
  getOverview,
  getResponseTime,
} from "@/lib/api/analyticsApi";
import { dashboardConfig } from "@/config/dashboard.config";

export function useOverview(days = 30) {
  return useQuery({
    queryKey: ["analytics", "overview", days],
    queryFn: () => getOverview(days),
    refetchInterval: dashboardConfig.polling.overview,
  });
}
export function useFunnel(days = 30) {
  return useQuery({
    queryKey: ["analytics", "funnel", days],
    queryFn: () => getFunnel(days),
  });
}
export function useResponseTime(days = 30) {
  return useQuery({
    queryKey: ["analytics", "response-time", days],
    queryFn: () => getResponseTime(days),
  });
}
export function useBottlenecks(days = 30) {
  return useQuery({
    queryKey: ["analytics", "bottlenecks", days],
    queryFn: () => getBottlenecks(days),
  });
}
