import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaPasswordRepository } from '@/core/infrastructure/repositories/PrismaPasswordRepository';
import { NodeCryptoService } from '@/core/infrastructure/crypto/NodeCryptoService';
import { UpdatePasswordUseCase } from '@/core/application/use-cases/passwords/UpdatePasswordUseCase';
import { DeletePasswordUseCase } from '@/core/application/use-cases/passwords/DeletePasswordUseCase';

export const dynamic = 'force-dynamic';

const repository = new PrismaPasswordRepository();
const crypto = new NodeCryptoService();

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { username, password, description, observation, tagId, workspaceId } = body;

        const updated = await new UpdatePasswordUseCase(repository, crypto).execute({
            id,
            userId: session.user.id,
            username,
            password,
            description,
            observation,
            tagId,
            workspaceId,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        await new DeletePasswordUseCase(repository).execute(id, session.user.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting password:', error);
        return NextResponse.json(
            { error: 'Failed to delete password' },
            { status: 500 },
        );
    }
}
