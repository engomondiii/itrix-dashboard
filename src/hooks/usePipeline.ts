"use client";

import { useQuery } from "@tanstack/react-query";

import { getPipeline } from "@/lib/api/pipelineApi";
import { dashboardConfig } from "@/config/dashboard.config";

export function usePipeline() {
  return useQuery({
    queryKey: ["pipeline"],
    queryFn: getPipeline,
    refetchInterval: dashboardConfig.polling.overview,
  });
}
