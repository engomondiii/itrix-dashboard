import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";

const ACTIONS = new Set(["assign", "resolve", "escalate"]);

/**
 * Assign, resolve or escalate a support request.
 *
 * Not role-gated beyond authentication: answering support is the job, and
 * putting an approval step between an operator and a customer who is waiting
 * would be the wrong trade. The one thing that IS gated is content — a
 * resolution passes the same governance pass as any other team→customer
 * message, and a support question may never be answered with a commercial
 * claim (enforced in the backend claim checker).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ requestId: string; action: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { action } = await params;
  if (!ACTIONS.has(action)) {
    return NextResponse.json({ detail: "Unknown action" }, { status: 404 });
  }

  return notImplementedOnBackend(
    "Support actions",
    "POST cockpit/support/queue/{id}/{assign|resolve|escalate}/ (the queue reads are mounted; the write actions are not yet)",
  );
}
