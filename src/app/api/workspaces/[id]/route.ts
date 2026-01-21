import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaWorkspaceRepository } from '@/core/infrastructure/repositories/PrismaWorkspaceRepository';
import { DeleteWorkspaceUseCase } from '@/core/application/use-cases/workspaces/DeleteWorkspaceUseCase';

export const dynamic = 'force-dynamic';

const repository = new PrismaWorkspaceRepository();

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await new DeleteWorkspaceUseCase(repository).execute(id, session.user.id);
        return NextResponse.json({ message: 'Workspace deleted successfully' });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
    }
}
