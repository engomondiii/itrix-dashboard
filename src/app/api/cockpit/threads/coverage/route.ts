import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";

/**
 * Loop productivity across the whole book.
 *
 * Answers the question a per-thread view cannot: which listening dimensions the
 * question loop keeps failing to close. A dimension that is still unknown when
 * most loops stop is a weak question bank or weak extraction, not bad luck.
 */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return notImplementedOnBackend(
    "Loop productivity",
    "GET cockpit/threads/coverage/ (only per-thread coverage is mounted; the book-wide read is not yet)",
  );
}
