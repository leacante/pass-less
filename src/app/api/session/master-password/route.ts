import { saveSession, getSession } from '@/lib/iron-session';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/session/master-password
 * Guarda el master password en la sesión después de validarlo
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { masterPassword } = body;

        if (!masterPassword) {
            return NextResponse.json(
                { error: 'Master password es requerido' },
                { status: 400 }
            );
        }

        // Validar el master password contra la API
        const validateResponse = await fetch(
            new URL('/api/users/validate-master-password', process.env.NEXTAUTH_URL || 'http://localhost:3000'),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': req.headers.get('cookie') || '',
                },
                body: JSON.stringify({ masterPassword }),
            }
        );

        const validateData = await validateResponse.json();

        if (!validateResponse.ok || !validateData.isValid) {
            return NextResponse.json(
                { error: 'Master password inválido' },
                { status: 401 }
            );
        }

        // Guardar en sesión
        const session = await getSession();
        session.masterPassword = masterPassword;
        await session.save();

        return NextResponse.json(
            { message: 'Master password guardado en sesión', session },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error saving master password to session:', error);
        return NextResponse.json(
            { error: 'Failed to save master password' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/session/master-password
 * Elimina el master password de la sesión
 */
export async function DELETE() {
    try {
        const session = await getSession();
        session.masterPassword = undefined;
        await session.save();

        return NextResponse.json(
            { message: 'Master password eliminado de la sesión' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting master password from session:', error);
        return NextResponse.json(
            { error: 'Failed to delete master password' },
            { status: 500 }
        );
    }
}
