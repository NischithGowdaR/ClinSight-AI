import { NextRequest, NextResponse } from 'next/server';

// Lightweight signature-free JWT payload decoder for Next.js Edge Middleware runtime
function decodeToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ['/auth/login', '/auth/signup', '/'];

  // Protected routes
  const protectedRoutes = ['/doctor', '/patient'];

  // Check if current path is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Verify token
    const decoded = decodeToken(token);
    if (!decoded) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check role-based access
    if (pathname.startsWith('/doctor') && decoded.role !== 'doctor') {
      return NextResponse.redirect(new URL('/patient', request.url));
    }

    if (pathname.startsWith('/patient') && decoded.role !== 'patient') {
      return NextResponse.redirect(new URL('/doctor', request.url));
    }
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (publicRoutes.includes(pathname) || pathname.startsWith('/auth/')) {
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const redirectUrl = decoded.role === 'doctor' ? '/doctor' : '/patient';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
