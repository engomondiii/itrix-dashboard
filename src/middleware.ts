import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Team-JWT presence guard (Surface 2 v3.0). Redirects unauthenticated requests
 * for any dashboard route to /login. This is a coarse presence check — fine-grained
 * role gates (journey advance, governance admin) are enforced in the pages/routes
 * and, authoritatively, by the backend permission classes.
 *
 * The cookie name mirrors `lib/server/session.ts` SESSION_COOKIE (redefined here
 * because that module is server-only and can't be imported into edge middleware).
 */
const SESSION_COOKIE = "itrix_session";
const PUBLIC_PREFIXES = ["/login", "/logout"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (!req.cookies.has(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Guard everything except auth screens, API routes, Next internals, and files.
  matcher: ["/((?!login|logout|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
