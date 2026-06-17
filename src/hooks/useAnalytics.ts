"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getBottlenecks,
  getFunnel,
  getOverview,
  getResponseTime,
} from "@/lib/api/analyticsApi";
import { dashboardConfig } from "@/config/dashboard.config";

export function useOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: getOverview,
    refetchInterval: dashboardConfig.polling.overview,
  });
}
export function useFunnel() {
  return useQuery({ queryKey: ["analytics", "funnel"], queryFn: getFunnel });
}
export function useResponseTime() {
  return useQuery({ queryKey: ["analytics", "response-time"], queryFn: getResponseTime });
}
export function useBottlenecks() {
  return useQuery({ queryKey: ["analytics", "bottlenecks"], queryFn: getBottlenecks });
}
