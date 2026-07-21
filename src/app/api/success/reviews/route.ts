import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
import { listSuccessReviews } from "@/mocks/customersDb";

/**
 * Scheduled success reviews with their assembled agenda.
 *
 * The agenda is ordered worst-first by `success_review.py`: anything off plan,
 * then at risk, then open support, then adoption, and achievements last. A
 * review that opens with good news and buries the problem wastes the one
 * meeting where the customer is definitely listening.
 */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    return notImplementedOnBackend(
      "Scheduled success reviews",
      "GET success/reviews/",
    );
  }

  const results = listSuccessReviews();
  return NextResponse.json({ results, count: results.length });
}
