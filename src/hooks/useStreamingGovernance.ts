"use client";

import { useQuery } from "@tanstack/react-query";

import { getStreamingGovernance } from "@/lib/api/streamingApi";

/**
 * Polled at the live cadence: a blocking approval means a visitor is sitting in
 * front of a conversation that has stopped moving, and a stale wait timer is
 * worse than none — it under-reports how long someone has been waiting.
 */
const LIVE_POLL_MS = 10_000;

export function useStreamingGovernance() {
  return useQuery({
    queryKey: ["streaming-governance"],
    queryFn: getStreamingGovernance,
    refetchInterval: LIVE_POLL_MS,
  });
}

/** Just the blocking approvals — for the banner above the approval queue. */
export function useBlockingApprovals() {
  const query = useStreamingGovernance();
  return { ...query, data: query.data?.blocking };
}
