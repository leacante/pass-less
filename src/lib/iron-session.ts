import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
    userId?: string;
    email?: string;
    isLoggedIn?: boolean;
    masterPassword?: string;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
};

export const sessionOptions = {
    password: process.env.IRON_SESSION_PASSWORD || 'complex_password_at_least_32_characters_long!',
    cookieName: 'session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict' as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    },
};

export async function getSession() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
        cookieStore,
        sessionOptions
    );
    return session;
}

export async function saveSession(data: SessionData) {
    const session = await getSession();
    Object.assign(session, data);
    await session.save();
    return session;
}

export async function destroySession() {
    const session = await getSession();
    session.destroy();
}
