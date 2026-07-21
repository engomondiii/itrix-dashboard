import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getPersona } from "@/mocks/personasDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ personaId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { personaId } = await params;

  if (!siteConfig.useMocks) {
    // v6: GET personas/{id}/ (team)
    const r = await djangoFetch(`/personas/${personaId}/`);
    return djangoJson(r);
  }

  const persona = getPersona(personaId);
  if (!persona) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(persona);
}
