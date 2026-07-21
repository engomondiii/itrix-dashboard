import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getCustomer } from "@/mocks/customersDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { clientId } = await params;

  if (!siteConfig.useMocks) {
    // v6: GET cockpit/customers/{id}/
    const r = await djangoFetch(`/cockpit/customers/${clientId}/`);
    return djangoJson(r);
  }

  const detail = getCustomer(clientId);
  if (!detail) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(detail);
}
