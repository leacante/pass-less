import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSession } from '@/lib/iron-session';
import { PrismaPasswordRepository } from '@/core/infrastructure/repositories/PrismaPasswordRepository';
import { NodeCryptoService } from '@/core/infrastructure/crypto/NodeCryptoService';
import { DecryptPasswordUseCase } from '@/core/application/use-cases/passwords/DecryptPasswordUseCase';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const repository = new PrismaPasswordRepository();
const crypto = new NodeCryptoService();

export async function POST(request: Request, { params }: RouteParams) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Obtener master password de la sesión encriptada
        const ironSession = await getSession();
        const masterPassword = ironSession?.masterPassword;

        if (!masterPassword) {
            return NextResponse.json(
                { error: 'Master password not found in session' },
                { status: 401 }
            );
        }

        // Desencriptar en el servidor sin devolver el password
        const decryptedPassword = await new DecryptPasswordUseCase(repository, crypto).execute(
            id,
            session.user.id,
            masterPassword,
        );

        // Devolver solo confirmación, no el password desencriptado
        // El cliente puede acceder al password a través de la sesión si lo necesita
        return NextResponse.json({ success: true, length: decryptedPassword.length });
    } catch (error) {
        console.error('Error decrypting password:', error);
        return NextResponse.json(
            { error: 'Failed to decrypt password' },
            { status: 500 },
        );
    }
}
