import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Build CSP connect-src from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const apiOrigin = apiUrl ? new URL(apiUrl).origin : '';
  const isProd = process.env.NODE_ENV === 'production';
  const connectSources = [
    "'self'",
    ...(apiOrigin ? [apiOrigin] : []),
    ...(!isProd ? ['http://localhost:5002', 'http://localhost:8080'] : []),
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ].join(' ');

  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src ${connectSources}; frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com; object-src 'none'; base-uri 'self'; form-action 'self'`
  );
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};