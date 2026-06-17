import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { addNote } from "@/mocks/leadsDb";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/leads/${leadId}/note/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const text = String(body?.body ?? "").trim();
  if (!text) return NextResponse.json({ detail: "Note is empty" }, { status: 400 });
  const lead = addNote(leadId, text, user.name);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}
