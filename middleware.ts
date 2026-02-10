import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that are always accessible
  const publicPaths = [
    '/login',
    '/_next',
    '/favicon.ico',
    '/api/auth' // Allow auth api if needed, though we use server actions
  ];

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for the authentication cookie
  const authCookie = request.cookies.get('auth_token');

  // If no cookie, redirect to login
  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    // Optional: Add a 'next' param to redirect back after login
    // loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
