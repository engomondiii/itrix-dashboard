import { TriangleAlertIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";

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
}: {
  isLoading: boolean;
  isError: boolean;
  hasData: boolean;
  /** Named in the error copy, e.g. "the SLA settings". */
  label?: string;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
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
