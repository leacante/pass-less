import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const passwords = await prisma.password.findMany({
        where: { userId: session.user.id },
        select: {
            id: true,
            username: true,
            description: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(passwords);
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { username, password, description } = body;

        if (!username || !password || !description) {
            return NextResponse.json(
                { error: 'Username, password, and description are required' },
                { status: 400 }
            );
        }

        const { encrypted, iv, authTag } = encrypt(password);

        const newPassword = await prisma.password.create({
            data: {
                userId: session.user.id,
                username,
                encryptedPassword: encrypted,
                iv,
                authTag,
                description,
            },
            select: {
                id: true,
                username: true,
                description: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(newPassword, { status: 201 });
    } catch (error) {
        console.error('Error creating password:', error);
        return NextResponse.json(
            { error: 'Failed to create password' },
            { status: 500 }
        );
    }
}
