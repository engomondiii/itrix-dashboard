import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { listFollowUps } from "@/mocks/followUpDb";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // overdue | today | undefined

  if (!siteConfig.useMocks) {
    // v3: separate paths GET /follow-up/, /follow-up/overdue/, /follow-up/today/
    const path =
      filter === "overdue"
        ? "/follow-up/overdue/"
        : filter === "today"
          ? "/follow-up/today/"
          : "/follow-up/";
    const r = await djangoFetch(path);
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const now = Date.now();
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  let tasks = listFollowUps();
  if (filter === "overdue") {
    tasks = tasks.filter((t) => new Date(t.dueAt).getTime() < now);
  } else if (filter === "today") {
    tasks = tasks.filter((t) => {
      const due = new Date(t.dueAt).getTime();
      return due >= now && due <= dayEnd.getTime();
    });
  }

  tasks = [...tasks].sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  return NextResponse.json({ results: tasks, count: tasks.length });
}
