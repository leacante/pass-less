import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

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
        // Verify ownership
        const existing = await prisma.password.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const body = await request.json();
        const { username, password, description, observation, tagId, workspaceId } = body;

        if (observation && observation.length > 1000) {
            return NextResponse.json(
                { error: 'Observation must be less than 1000 characters' },
                { status: 400 }
            );
        }

        const updateData: {
            username?: string;
            description?: string;
            observation?: string;
            tagId?: string | null;
            workspaceId?: string | null;
            encryptedPassword?: string;
            iv?: string;
            authTag?: string;
        } = {};

        if (username) updateData.username = username;
        if (description) updateData.description = description;
        if (observation !== undefined) updateData.observation = observation;
        if (tagId !== undefined) {
            updateData.tagId =
                typeof tagId === 'string' && tagId.trim() !== '' ? tagId : null;
        }
        if (workspaceId !== undefined) {
            updateData.workspaceId =
                typeof workspaceId === 'string' && workspaceId.trim() !== '' ? workspaceId : null;
        }

        // Only re-encrypt if password is provided
        if (password) {
            const { encrypted, iv, authTag } = encrypt(password, session.user.id);
            updateData.encryptedPassword = encrypted;
            updateData.iv = iv;
            updateData.authTag = authTag;
        }

        const updated = await prisma.password.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                description: true,
                observation: true,
                tag: true, // Include relation
                tagId: true,
                workspace: true,
                workspaceId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
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
        // Verify ownership
        const existing = await prisma.password.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await prisma.password.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting password:', error);
        return NextResponse.json(
            { error: 'Failed to delete password' },
            { status: 500 }
        );
    }
}
