import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/iron-session';

export default auth(async (req) => {
    const isLoggedIn = !!req.auth;
    const session = await getSession();
    const sessionLoggedIn = session.isLoggedIn;

    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
    const isSessionRoute = req.nextUrl.pathname === '/api/session';

    // Allow auth and session routes
    if (isAuthRoute || isSessionRoute) {
        return NextResponse.next();
    }

    // Check if user is authenticated (NextAuth or iron-session)
    const authenticated = isLoggedIn || sessionLoggedIn;

    // Protect dashboard
    if (isOnDashboard && !authenticated) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // Protect API routes (except auth and session)
    if (isApiRoute && !authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
