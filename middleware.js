import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // 1. Get the pathname
  const { pathname } = request.nextUrl;

  // 2. Check for NextAuth session token (proper JWT validation)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Do not allow legacy cookie auth for gating
  const hasAuth = !!token;

  // 3. Define public pages that should be accessible without auth
  const isAuthPage = pathname === '/auth';

  // 4. Protect all app pages except /auth
  if (!hasAuth && !isAuthPage && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. If logged-in user tries to access auth page -> Redirect to Dashboard
  if (isAuthPage && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Optimization: Only run middleware on these specific routes
export const config = {
  matcher: [
    '/:path*'
  ],
};
