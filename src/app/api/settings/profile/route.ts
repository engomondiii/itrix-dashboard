import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getProfile, updateProfile } from "@/mocks/settingsDb";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  if (!siteConfig.useMocks) {
    // v3: current-user profile endpoint
    const r = await djangoFetch("/auth/profile/");
    return djangoJson(r);
  }
  return NextResponse.json(getProfile(user));
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: profile update endpoint
    const r = await djangoFetch("/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }
  return NextResponse.json(updateProfile(user, { name: body?.name }));
}
