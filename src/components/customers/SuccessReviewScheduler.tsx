"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import { useSuccessReviews } from "@/hooks/useCustomers";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";

/**
 * Upcoming success reviews and the agenda assembled for each.
 *
 * THE AGENDA IS ORDERED WORST-FIRST — off plan, then at risk, then open
 * support, then adoption, and achievements last. A review that opens with good
 * news and buries the problem wastes the one meeting where the customer is
 * definitely listening, so the ordering is a property of the assembly
 * (`success_review.py`), not a presentation choice this component makes.
 */
export function SuccessReviewScheduler() {
  const query = useSuccessReviews();
  const reviews = query.data;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(reviews)}
        label="scheduled reviews"
        error={query.error}
      />

      {reviews && reviews.length === 0 && (
        <EmptyState
          title="No reviews scheduled"
          description="A success review is scheduled for every customer from the first payment onward."
        />
      )}

      {reviews && reviews.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle>{review.company}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sec text-ink-secondary">
                  {formatDate(review.scheduledAt)} · {review.owner}
                </p>
                <div className="space-y-1">
                  <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                    Agenda
                  </div>
                  <ol className="space-y-0.5">
                    {review.agenda.map((item, i) => (
                      <li key={`${review.id}-${i}`} className="text-sec text-ink-primary">
                        {i + 1}. {item}
                      </li>
                    ))}
                  </ol>
                </div>
                <Link
                  href={ROUTES.customer(review.clientId)}
                  className="inline-block text-caption font-medium text-ink-primary hover:underline"
                >
                  Open the customer →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
