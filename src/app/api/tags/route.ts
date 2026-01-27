import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaTagRepository } from '@/core/infrastructure/repositories/PrismaTagRepository';
import { ListTagsUseCase } from '@/core/application/use-cases/tags/ListTagsUseCase';
import { CreateTagUseCase } from '@/core/application/use-cases/tags/CreateTagUseCase';
import { DeleteTagUseCase } from '@/core/application/use-cases/tags/DeleteTagUseCase';

const repository = new PrismaTagRepository();

export async function GET() {
    const session = await auth();
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const tags = await new ListTagsUseCase(repository).execute(session.user.id);
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

        const tag = await new CreateTagUseCase(repository).execute({
            userId: session.user.id,
            name,
            color,
        });

        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
