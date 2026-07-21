import { ConstructionIcon, TriangleAlertIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { isNotImplemented } from "@/lib/api/client";

/**
 * The loading / error gate for a React Query view.
 *
 * React Query does not throw on error by default, so a `isLoading || !data` guard
 * leaves the page spinning forever when a fetch fails — and the route `error.tsx`
 * boundary never sees it. Use this so a failed request says so.
 *
 * Returns `null` when there is data to render.
 */
export function QueryState({
  isLoading,
  isError,
  hasData,
  label = "this data",
  error,
}: {
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  /** Named in the error copy, e.g. "the SLA settings". */
  label?: string;
  /** Pass `query.error` so a not-yet-built backend route reads as such. */
  error?: unknown;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }

  /**
   * "The backend has not shipped this yet" is a normal state of an in-progress
   * cutover, not a fault. Rendering it as a red failure trains operators to
   * ignore red failures, so it gets its own calm treatment.
   */
  if (isNotImplemented(error)) {
    return (
      <EmptyState
        icon={ConstructionIcon}
        title="Not available on this backend yet"
        description={
          error.expectedEndpoint
            ? `This view is built and waiting on ${error.expectedEndpoint}.`
            : error.message
        }
      />
    );
  }

  if (isError || !hasData) {
    return (
      <EmptyState
        icon={TriangleAlertIcon}
        title={`Couldn’t load ${label}`}
        description="The request failed. Refresh the page, or try again in a moment."
      />
    );
  }
  return null;
}
