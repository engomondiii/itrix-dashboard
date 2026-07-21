import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
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
    return notImplementedOnBackend(
      "The per-customer read",
      "GET cockpit/customers/{id}/",
    );
  }

  const detail = getCustomer(clientId);
  if (!detail) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(detail);
}
