import { saveSession } from '@/lib/iron-session';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/session/sign-in
 * Inicia sesión y almacena los datos en iron-session
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, email } = body;

        if (!userId || !email) {
            return NextResponse.json(
                { error: 'userId and email are required' },
                { status: 400 }
            );
        }

        const session = await saveSession({
            userId,
            email,
            isLoggedIn: true,
        });

        return NextResponse.json(
            { message: 'Session created', session },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error signing in:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}
