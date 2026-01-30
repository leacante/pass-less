import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaUserRepository } from '@/core/infrastructure/repositories/PrismaUserRepository';
import { ValidateMasterPasswordUseCase } from '@/core/application/use-cases/users/ValidateMasterPasswordUseCase';

const userRepository = new PrismaUserRepository();
const validateMasterPasswordUseCase = new ValidateMasterPasswordUseCase(userRepository);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { masterPassword } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { error: 'Master password is required' },
        { status: 400 }
      );
    }

    // Obtener el user ID del usuario actual
    const user = await userRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Ejecutar el use case
    const result = await validateMasterPasswordUseCase.execute({
      userId: user.id,
      masterPassword,
    });

    return NextResponse.json({
      isValid: result.isValid,
      message: result.message,
    });
  } catch (error) {
    console.error('Error validating master password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
