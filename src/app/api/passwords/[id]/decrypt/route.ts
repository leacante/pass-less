import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify ownership and get encrypted data
        const passwordEntry = await prisma.password.findFirst({
            where: { id, userId: session.user.id },
            select: {
                encryptedPassword: true,
                iv: true,
                authTag: true,
            },
        });

        if (!passwordEntry) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Descifrar usando la clave derivada del usuario
        const decryptedPassword = decrypt(
            passwordEntry.encryptedPassword,
            passwordEntry.iv,
            passwordEntry.authTag,
            session.user.id
        );

        return NextResponse.json({ password: decryptedPassword });
    } catch (error) {
        console.error('Error decrypting password:', error);
        return NextResponse.json(
            { error: 'Failed to decrypt password' },
            { status: 500 }
        );
    }
}
