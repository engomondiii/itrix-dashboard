"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { canAdminGovernance } from "@/constants/permissions";

/**
 * The prohibited wording the stream guard caught.
 *
 * THE HALT EXISTED SO NOBODY WOULD READ THIS. Showing it to an operator is a
 * deliberate exception — approved for ADMIN / ASSESSMENT so they can judge
 * whether the guard fired correctly and whether retrieval has drifted — and it
 * is treated accordingly:
 *
 *   · role-gated, matching every other elevated action on this surface;
 *   · COLLAPSED BY DEFAULT, so it is never on screen by accident, never in a
 *     screenshot of the console, and never behind someone in a meeting room;
 *   · labelled as never-sent, because the single most likely misuse is an
 *     operator assuming this text was delivered and "correcting" it in a
 *     follow-up — which would publish the exact thing the guard stopped.
 *
 * A VIEWER sees that a halt occurred and which pattern matched. That is enough
 * to understand the event without reproducing the claim.
 */
export function MatchedTextReveal({ text }: { text: string | null }) {
  const { user } = useAuth();
  const [shown, setShown] = useState(false);

  if (!text) return null;
  if (!canAdminGovernance(user?.role)) return null;

  if (!shown) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShown(true)}
        aria-expanded={false}
      >
        <EyeIcon className="size-3.5" aria-hidden="true" />
        Show what was blocked
      </Button>
    );
  }

  return (
    <div className="space-y-1.5 rounded-md border border-error/40 bg-error-soft p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-micro font-semibold uppercase tracking-[0.06em] text-error-text">
          Blocked wording — never sent to the visitor
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShown(false)}
          aria-expanded
        >
          <EyeOffIcon className="size-3.5" aria-hidden="true" />
          Hide
        </Button>
      </div>
      <p className="font-mono text-caption text-error-text">{text}</p>
      <p className="text-micro text-ink-secondary">
        Do not paste this into a thread intervention or a follow-up draft. The halt
        is the reason no one has read it.
      </p>
    </div>
  );
}
