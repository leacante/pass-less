import { destroySession } from '@/lib/iron-session';
import { NextResponse } from 'next/server';

/**
 * POST /api/session/sign-out
 * Cierra la sesión y destruye la cookie de sesión
 */
export async function POST() {
    try {
        await destroySession();
        return NextResponse.json(
            { message: 'Session destroyed successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error signing out:', error);
        return NextResponse.json(
            { error: 'Failed to destroy session' },
            { status: 500 }
        );
    }
}
