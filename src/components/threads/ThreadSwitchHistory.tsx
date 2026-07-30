import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { formatTimeAgo } from "@/lib/formatting";
import type { ThreadSwitchEntry } from "@/types/thread";

/**
 * Which threads this session moved between, and when (Surface 2 v6.0 §6.2).
 *
 * A visitor who opened three chats and abandoned two is telling you something
 * — about the question bank, about the landing prompt, or about a problem they
 * could not get the surface to hold. The history is the signal; it is never
 * shown to the visitor and never used in copy addressed to them.
 */
export function ThreadSwitchHistory({
  entries,
  currentThreadId,
}: {
  entries: ThreadSwitchEntry[];
  currentThreadId: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-caption text-ink-secondary">
        This session has stayed in one thread.
      </p>
    );
  }

  return (
    <ol className="space-y-1">
      {entries.map((entry) => {
        const current = entry.threadId === currentThreadId;
        return (
          <li
            key={`${entry.threadId}-${entry.at}`}
            className="flex items-baseline justify-between gap-3"
          >
            {current ? (
              <span className="line-clamp-1 text-sec font-medium text-ink-primary">
                {entry.title} (this thread)
              </span>
            ) : (
              <Link
                href={ROUTES.thread(entry.threadId)}
                className="line-clamp-1 text-sec text-ink-primary hover:underline"
              >
                {entry.title}
              </Link>
            )}
            <span className="shrink-0 text-micro tabular-nums text-ink-secondary">
              {formatTimeAgo(entry.at)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
