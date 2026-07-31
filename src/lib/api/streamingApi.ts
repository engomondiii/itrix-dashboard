import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { StreamingGovernanceRead } from "@/types/streaming";

/**
 * Normalise the streaming-governance read at the boundary, exactly once.
 *
 * The shipped `cockpit/streaming/guard-hits/` answers `{ results, count,
 * matchedTextVisible, interpretation }`; the mock (and the v7.0 spec shape)
 * answer `{ guardHits, blocking, downgrades, guardHitRate }`. Components see
 * one shape: `guardHits` is always an array, and the fields the connected
 * backend does not serve stay absent — absent renders as an omitted section,
 * never as a zero that means "not served".
 */
type WireRead = Partial<StreamingGovernanceRead> & {
  results?: StreamingGovernanceRead["guardHits"];
};

export async function getStreamingGovernance(): Promise<StreamingGovernanceRead> {
  const raw = await apiGet<WireRead>(API.cockpitGuardHits);
  const { results, ...rest } = raw;
  return {
    ...rest,
    guardHits: raw.guardHits ?? results ?? [],
  };
}
