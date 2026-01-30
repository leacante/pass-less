import { auth } from '@/lib/auth';
import { saveSession } from '@/lib/iron-session';
import { NextResponse } from 'next/server';

/**
 * POST /api/session/sync-auth
 * Sincroniza la sesión de NextAuth con iron-session
 * Útil después de que el usuario inicia sesión con Google
 */
export async function POST() {
    try {
        const authSession = await auth();

        if (!authSession?.user) {
            return NextResponse.json(
                { error: 'Not authenticated with NextAuth' },
                { status: 401 }
            );
        }

        // Guardar información del usuario en iron-session
        const ironSession = await saveSession({
            userId: authSession.user.id || '',
            email: authSession.user.email || '',
            isLoggedIn: true,
        });

        return NextResponse.json(
            {
                message: 'Session synchronized',
                session: ironSession,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error syncing session:', error);
        return NextResponse.json(
            { error: 'Failed to sync session' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/session/sync-auth
 * Obtiene el estado de sincronización
 */
export async function GET() {
    try {
        const authSession = await auth();
        return NextResponse.json({
            nextAuthSession: authSession,
        });
    } catch (error) {
        console.error('Error getting auth session:', error);
        return NextResponse.json(
            { error: 'Failed to get auth session' },
            { status: 500 }
        );
    }
}
