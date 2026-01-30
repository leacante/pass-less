import { getSession, saveSession, destroySession } from '@/lib/iron-session';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/session
 * Obtiene los datos de la sesión actual
 */
export async function GET() {
    try {
        const session = await getSession();
        return NextResponse.json(session);
    } catch (error) {
        console.error('Error getting session:', error);
        return NextResponse.json(
            { error: 'Failed to get session' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/session
 * Actualiza los datos de la sesión
 */
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const session = await saveSession(data);
        return NextResponse.json(session);
    } catch (error) {
        console.error('Error saving session:', error);
        return NextResponse.json(
            { error: 'Failed to save session' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/session
 * Destruye la sesión actual
 */
export async function DELETE() {
    try {
        await destroySession();
        return NextResponse.json({ message: 'Session destroyed' });
    } catch (error) {
        console.error('Error destroying session:', error);
        return NextResponse.json(
            { error: 'Failed to destroy session' },
            { status: 500 }
        );
    }
}
