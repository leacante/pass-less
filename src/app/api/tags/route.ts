import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
    const session = await auth();
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const tags = await prisma.tag.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, color } = body;

        if (!name) {
            return new NextResponse('Name is required', { status: 400 });
        }

        const tag = await prisma.tag.create({
            data: {
                name,
                color,
                userId: session.user.id,
            },
        });

        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
