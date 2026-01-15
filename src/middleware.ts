import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');

    // Allow auth routes
    if (isAuthRoute) {
        return NextResponse.next();
    }

    // Protect dashboard
    if (isOnDashboard && !isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // Protect API routes (except auth)
    if (isApiRoute && !isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
