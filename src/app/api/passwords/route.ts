import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaPasswordRepository } from '@/core/infrastructure/repositories/PrismaPasswordRepository';
import { NodeCryptoService } from '@/core/infrastructure/crypto/NodeCryptoService';
import { ListPasswordsUseCase } from '@/core/application/use-cases/passwords/ListPasswordsUseCase';
import { CreatePasswordUseCase } from '@/core/application/use-cases/passwords/CreatePasswordUseCase';

export const dynamic = 'force-dynamic';

const repository = new PrismaPasswordRepository();
const crypto = new NodeCryptoService();

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const passwords = await new ListPasswordsUseCase(repository).execute(session.user.id);
    return NextResponse.json(passwords);
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { username, password, description, observation, tagId, workspaceId, masterPassword } = body;

        if (!username || !password || !description) {
            return NextResponse.json(
                { error: 'Username, password, and description are required' },
                { status: 400 },
            );
        }

        const useCase = new CreatePasswordUseCase(repository, crypto);
        const newPassword = await useCase.execute({
            userId: session.user.id,
            username,
            password,
            description,
            observation,
            tagId,
            workspaceId,
            masterPassword,
        });

        return NextResponse.json(newPassword, { status: 201 });
    } catch (error) {
        console.error('Error creating password:', error);
        return NextResponse.json(
            { error: 'Failed to create password' },
            { status: 500 },
        );
    }
}
