import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Verificar que el workspace pertenece al usuario
        const workspace = await prisma.workspace.findUnique({
            where: { id },
        });

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        if (workspace.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Eliminar el workspace (las contraseñas asociadas tendrán workspaceId en null gracias a onDelete: SetNull)
        await prisma.workspace.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Workspace deleted successfully' });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
    }
}
