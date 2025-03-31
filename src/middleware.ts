import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

// Define routes that require authentication
const protectedRoutes = ['/dashboard', '/api/validate-prompt', '/api/chat', '/api/user'];
// Define routes accessible without authentication
const publicRoutes = ['/login', '/', '/api/auth'];

// These should be environment variables in a real app
const SESSION_SECRET = 'your-super-secure-secret-key-min-32-chars-long';
const encodedKey = new TextEncoder().encode(SESSION_SECRET);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // 1. Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // 2. Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // 3. Get the session cookie
  const sessionCookie = req.cookies.get('session');
  
  // 4. If it's a protected route and no session cookie, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // 5. If it's a public route and we have a session cookie, verify token
  if (isPublicRoute && sessionCookie) {
    try {
      // Verify the JWT token
      const { payload } = await jose.jwtVerify(
        sessionCookie.value,
        encodedKey,
        { algorithms: ['HS256'] }
      );
      
      // If token is valid and trying to access login page, redirect to dashboard
      if (payload && path === '/login') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (error) {
      // If token verification fails, continue as normal
      console.error('Token verification failed:', error);
    }
  }
  
  return NextResponse.next();
}

// Configure which paths middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 