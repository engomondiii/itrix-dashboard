"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { StateBadge } from "@/components/journey/StateBadge";
import { AnonymousBadge } from "@/components/threads/AnonymousBadge";
import { useThreads } from "@/hooks/useThreads";
import { ROUTES } from "@/constants/routes";
import { features } from "@/config/features.config";
import { formatTimeAgo } from "@/lib/formatting";

const MAX_ROWS = 5;

/**
 * Who is in a conversation right now.
 *
 * This is the question the overview could not answer before v5.0: the team saw
 * leads, and a lead only exists after qualification, so the first two journey
 * states were invisible. A visitor mid-sentence — and especially one whose turn
 * is stuck behind an approval — is the most time-sensitive thing on this page.
 *
 * Blocked threads lead, because someone is waiting on us.
 */
export function LiveThreadsWidget() {
  const { data: threads, isLoading } = useThreads();

  if (!features.threadOversight) return null;

  const live = (threads ?? []).filter((t) => t.live || t.blocking);
  const blocked = live.filter((t) => t.blocking).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live conversations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner className="size-4" />
          </div>
        )}

        {!isLoading && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={live.length > 0 ? "success" : "neutral"}>
                {live.length} active
              </Badge>
              {blocked > 0 && (
                <Badge variant="error">
                  {blocked} blocked on an approval
                </Badge>
              )}
            </div>

            {live.length === 0 ? (
              <p className="text-sec text-ink-secondary">
                Nobody is in a conversation right now.
              </p>
            ) : (
              <ul className="space-y-2">
                {live.slice(0, MAX_ROWS).map((thread) => (
                  <li key={thread.id} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <Link
                        href={ROUTES.thread(thread.id)}
                        className="line-clamp-1 text-sec font-medium text-ink-primary hover:underline"
                      >
                        {thread.title}
                      </Link>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <AnonymousBadge identityState={thread.identityState} />
                        <StateBadge state={thread.state} />
                      </span>
                    </span>
                    <span className="shrink-0 text-micro text-ink-secondary">
                      {thread.blocking ? (
                        <span className="font-semibold text-error-text tabular-nums">
                          waiting {Math.floor(thread.blocking.waitingSeconds / 60)}m
                        </span>
                      ) : (
                        formatTimeAgo(thread.lastActivityAt)
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={ROUTES.threads}
              className="inline-block text-caption font-medium text-ink-primary hover:underline"
            >
              Open the thread board →
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
