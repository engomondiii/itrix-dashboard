import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";

/**
 * The persona hypothesis for one lead.
 *
 * A 204 is the right answer when nothing matched — an empty body says "no
 * hypothesis" without the client having to distinguish a missing lead from a
 * lead the matcher could not place.
 */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return notImplementedOnBackend(
    "The persona hypothesis for a lead",
    "GET cockpit/leads/{id}/persona/ (personas/ exists, but nothing joins a lead to one)",
  );
}
