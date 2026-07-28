import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const publicPaths = ['/login', '/forgot-password'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // In Next.js middleware, we can check for an auth cookie
  // Since we are using Zustand with localStorage by default, 
  // the edge middleware won't see the token unless we store it in cookies.
  // The primary protection is done via the client-side AuthGuard.
  // However, this is set up for future cookie-based auth scaling.
  const token = request.cookies.get('fams_access_token')?.value;

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If you enforce cookies, uncomment below:
  // if (!isPublicPath && !token && !request.nextUrl.pathname.startsWith('/_next')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
