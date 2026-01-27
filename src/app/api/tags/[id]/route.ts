import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaTagRepository } from '@/core/infrastructure/repositories/PrismaTagRepository';
import { DeleteTagUseCase } from '@/core/application/use-cases/tags/DeleteTagUseCase';

const repository = new PrismaTagRepository();

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const tagId = params.id;

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
