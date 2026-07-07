import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { JOURNEY_STATES } from "@/constants/journeyStates";
import { getStateDistribution } from "@/mocks/journeyDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    // v3: no backend journey-distribution endpoint yet — return an empty shape so
    // the widget degrades gracefully until one exists.
    const distribution = Object.fromEntries(JOURNEY_STATES.map((s) => [s, 0]));
    return NextResponse.json({ distribution, total: 0 });
  }

  return NextResponse.json(getStateDistribution());
}
