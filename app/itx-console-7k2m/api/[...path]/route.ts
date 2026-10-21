import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const cookieName = 'itrix_website_admin';
const scope = '/itx-console-7k2m';
async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const target = (await context.params).path.join('/');
  if (
    !/^(auth\/(request|verify)|admin\/(session|records|records\/\d+|export|logs|accounts|notice))$/.test(
      target,
    )
  )
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  const incoming = new URL(request.url);
  // Forwarded host only comes from the configured reverse proxy; origin remains mandatory on mutations.
  const origin = request.headers.get('origin');
  const permittedOrigins = [
    incoming.origin,
    process.env.WEBSITE_PUBLIC_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean);
  if (
    request.method !== 'GET' &&
    (!origin || !permittedOrigins.includes(origin))
  )
    return NextResponse.json({ detail: 'Invalid origin' }, { status: 403 });
  const jar = await cookies();
  const token = jar.get(cookieName)?.value || '';
  if (target.startsWith('admin/') && !token)
    return NextResponse.json({ detail: 'Session expired' }, { status: 403 });
  const base = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''
  ).replace(/\/$/, '');
  if (!base)
    return NextResponse.json(
      { detail: 'Service unavailable' },
      { status: 503 },
    );
  const body = request.method === 'POST' ? await request.text() : undefined;
  if (body && body.length > 40000)
    return NextResponse.json({ detail: 'Request too large' }, { status: 413 });
  try {
    const response = await fetch(
      `${base}/website/${target}/${incoming.search}`,
      {
        method: request.method,
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(20000),
        headers: {
          'Content-Type': 'application/json',
          'X-Website-Session': token,
          'X-Website-Proxy-Key': process.env.WEBSITE_PROXY_KEY || '',
          'X-Website-Client-IP': request.headers.get('x-real-ip') || '',
        },
      },
    );
    if (target === 'admin/export' && response.ok)
      return new NextResponse(await response.text(), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="itrix-submissions.csv"',
          'Cache-Control': 'no-store',
        },
      });
    const data = await response
      .json()
      .catch(() => ({ detail: 'Service unavailable' }));
    const sessionToken = data.session_token;
    delete data.session_token;
    const result = NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
    if (response.ok && sessionToken)
      result.cookies.set(cookieName, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: scope,
      });
    if (
      (target === 'admin/session' &&
        body &&
        JSON.parse(body).action === 'logout') ||
      (response.status === 403 && target.startsWith('admin/'))
    )
      result.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: scope,
        maxAge: 0,
      });
    return result;
  } catch {
    return NextResponse.json(
      { detail: 'Service unavailable. Please retry.' },
      { status: 503 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
