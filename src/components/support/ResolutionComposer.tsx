"use client";

import { useMemo, useState } from "react";
import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useSupportActions } from "@/hooks/useSupport";

/**
 * Words and phrases that turn a support reply into a sales reply.
 *
 * This is an ADVISORY inline check, exactly like the console's governance
 * warning. The authoritative rule lives in the backend claim checker — "a
 * support intent may never be answered with a commercial claim" — and it is
 * enforced there because prompt wording and operator discipline both fail
 * eventually. The warning exists to stop a well-meant segue before it is sent,
 * not to be the control.
 */
const COMMERCIAL_TERMS = [
  "upgrade",
  "expansion",
  "expand",
  "renewal",
  "renew",
  "upsell",
  "additional workload",
  "another workload",
  "pricing",
  "price",
  "quote",
  "licence fee",
  "license fee",
  "next agreement",
  "commercial discussion",
];

function commercialHits(text: string): string[] {
  const lower = text.toLowerCase();
  return COMMERCIAL_TERMS.filter((term) => lower.includes(term));
}

/**
 * Resolve a support request.
 *
 * The reply helps with the problem and stops. It does not mention another
 * workload, an expansion, a renewal, or a next agreement — no matter how
 * natural the segue seems (Playbook v1.6 §12D).
 */
export function ResolutionComposer({ requestId }: { requestId: string }) {
  const [resolution, setResolution] = useState("");
  const { resolve } = useSupportActions(requestId);

  const hits = useMemo(() => commercialHits(resolution), [resolution]);

  return (
    <div className="space-y-2">
      <Label htmlFor="resolution">Resolution</Label>
      <Textarea
        id="resolution"
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="What was wrong, what you did, and what the customer should expect now."
        rows={4}
      />

      {hits.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning-soft p-2.5">
          <AlertTriangleIcon
            className="mt-0.5 size-4 shrink-0 text-warning-text"
            aria-hidden="true"
          />
          <p className="text-caption text-warning-text">
            This reads like a commercial reply to a support question:{" "}
            <strong className="font-semibold">{hits.join(", ")}</strong>. A support reply
            helps with the problem and stops. The server governance pass will reject a
            commercial claim here.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-micro text-ink-secondary">
          The customer is asked afterwards whether this actually resolved it.
        </p>
        <Button
          onClick={() => resolve.mutate(resolution, { onSuccess: () => setResolution("") })}
          disabled={!resolution.trim() || resolve.isPending}
        >
          {resolve.isPending && <Spinner className="text-current" />}
          Resolve
        </Button>
      </div>
    </div>
  );
}
