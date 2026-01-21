import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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
        const decryptedPassword = await new DecryptPasswordUseCase(repository, crypto).execute(id, session.user.id);
        return NextResponse.json({ password: decryptedPassword });
    } catch (error) {
        console.error('Error decrypting password:', error);
        return NextResponse.json(
            { error: 'Failed to decrypt password' },
            { status: 500 },
        );
    }
}
