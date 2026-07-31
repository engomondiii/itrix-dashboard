import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";

/** Every agreed outcome across the book — "are we delivering what we promised?" */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return notImplementedOnBackend(
    "Outcomes across the book",
    "GET cockpit/customers/outcomes/ (not mounted yet)",
  );
}
