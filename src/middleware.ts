import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = (session?.user as any)?.role;
  const onboarded = (session?.user as any)?.onboardingCompleted;

  // Public routes
  const publicPaths = ['/', '/auth/login', '/auth/register', '/auth/error', '/api/auth', '/api/register', '/api/seed'];
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next();

  // Not logged in
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Student not onboarded
  if (role === 'student' && !onboarded && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Role-based routing
  if (pathname.startsWith('/teacher') && !['teacher','admin'].includes(role || '')) {
    return NextResponse.redirect(new URL('/student/dashboard', req.url));
  }
  if (pathname.startsWith('/parent') && !['parent','admin'].includes(role || '')) {
    return NextResponse.redirect(new URL('/student/dashboard', req.url));
  }
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/student/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|manifest).*)'],
};
