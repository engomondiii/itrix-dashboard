import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/** Add a section to a report. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: report add-section endpoint
  const r = await djangoFetch(`/reporting/${reportId}/sections/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
