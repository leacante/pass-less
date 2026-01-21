import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaWorkspaceRepository } from '@/core/infrastructure/repositories/PrismaWorkspaceRepository';
import { ListWorkspacesUseCase } from '@/core/application/use-cases/workspaces/ListWorkspacesUseCase';
import { CreateWorkspaceUseCase } from '@/core/application/use-cases/workspaces/CreateWorkspaceUseCase';

export const dynamic = 'force-dynamic';

const repository = new PrismaWorkspaceRepository();

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const workspaces = await new ListWorkspacesUseCase(repository).execute(session.user.id);
        return NextResponse.json(workspaces);
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const name = typeof body?.name === 'string' ? body.name.trim() : '';

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const workspace = await new CreateWorkspaceUseCase(repository).execute({ userId: session.user.id, name });
        return NextResponse.json(workspace, { status: 201 });
    } catch (error) {
        console.error('Error creating workspace:', error);
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
    }
}
