import { apiGet, type QueryParams } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type {
  CoverageOverview,
  ThreadDetail,
  ThreadFilterState,
  ThreadListItem,
} from "@/types/thread";

/** Only the active filters are sent, so an unfiltered board has a clean URL. */
export function threadQueryParams(filters: ThreadFilterState): QueryParams {
  return {
    identity: filters.identity === "all" ? undefined : filters.identity,
    state: filters.state === "all" ? undefined : filters.state,
    liveOnly: filters.liveOnly || undefined,
    hasAttachments: filters.hasAttachments || undefined,
    blockedOnApproval: filters.blockedOnApproval || undefined,
    guardHalted: filters.guardHalted || undefined,
  };
}

export async function getThreads(params: QueryParams = {}): Promise<ThreadListItem[]> {
  const data = await apiGet<{ results: ThreadListItem[] }>(API.cockpitThreads, params);
  return data.results;
}

export function getThread(threadId: string) {
  return apiGet<ThreadDetail>(API.cockpitThread(threadId));
}

export function getCoverageOverview() {
  return apiGet<CoverageOverview>(API.cockpitThreadsCoverage);
}
