import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaTagRepository } from '@/core/infrastructure/repositories/PrismaTagRepository';
import { DeleteTagUseCase } from '@/core/application/use-cases/tags/DeleteTagUseCase';

const repository = new PrismaTagRepository();

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { id } = await params;
        const tagId = id;

        if (!tagId) {
            return new NextResponse('Tag ID is required', { status: 400 });
        }

        await new DeleteTagUseCase(repository).execute({
            tagId,
            userId: session.user.id,
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
