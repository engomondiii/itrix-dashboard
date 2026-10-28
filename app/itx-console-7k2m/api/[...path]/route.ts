import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
function retired() {
  const response = NextResponse.json(
    { detail: 'Website administration has moved to Google Forms.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
  response.cookies.set('itrix_website_admin', '', {
    path: '/itx-console-7k2m',
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  return response;
}
export const GET = retired;
export const POST = retired;
export const PATCH = retired;
export const DELETE = retired;
