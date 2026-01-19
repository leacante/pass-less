import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const workspaces = await prisma.workspace.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' },
        });

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

        const workspace = await prisma.workspace.create({
            data: {
                name,
                userId: session.user.id,
            },
        });

        return NextResponse.json(workspace, { status: 201 });
    } catch (error) {
        console.error('Error creating workspace:', error);
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
    }
}
