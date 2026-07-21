"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getCoverageOverview,
  getThread,
  getThreads,
  threadQueryParams,
} from "@/lib/api/threadsApi";
import type { ThreadFilterState } from "@/types/thread";

/**
 * The board polls, because a thread is live: a visitor may be typing right now
 * and an approval may be blocking them. Phase 3 switches this to the WebSocket
 * and keeps the GET as the fallback (Surface 2 v5.0 §06 Phase 3), which is why
 * the interval is here rather than baked into the fetcher.
 */
const LIVE_POLL_MS = 15_000;

export const DEFAULT_THREAD_FILTERS: ThreadFilterState = {
  identity: "all",
  state: "all",
  liveOnly: false,
  hasAttachments: false,
  blockedOnApproval: false,
  guardHalted: false,
  abandoned: false,
};

export function useThreads(filters: ThreadFilterState = DEFAULT_THREAD_FILTERS) {
  const params = threadQueryParams(filters);
  return useQuery({
    queryKey: ["threads", params],
    queryFn: () => getThreads(params),
    refetchInterval: LIVE_POLL_MS,
  });
}

export function useThreadDetail(threadId: string) {
  return useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => getThread(threadId),
    enabled: Boolean(threadId),
    refetchInterval: LIVE_POLL_MS,
  });
}

/**
 * Loop productivity across the book. An aggregate over closed loops, so it does
 * not need the live cadence — refetching it every 15s would be pure noise.
 */
export function useCoverageOverview() {
  return useQuery({
    queryKey: ["coverage-overview"],
    queryFn: getCoverageOverview,
    staleTime: 60_000,
  });
}
